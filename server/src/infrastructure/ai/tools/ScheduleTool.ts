import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { google } from "googleapis";
import type { ICreateAIScheduleUseCase } from "../../../application/interfaces/use-cases/ai/create-ai-schedule.usecase.interface";
import type { IGetUserByNameUseCase } from "../../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import type { IStartConversationUseCase } from "../../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import { MessageType } from "../../../domain/enums/MessageType";
import { GoogleAuthService } from "../../services/google-auth.service";
import { SocketService } from "../../socket/socket.service";
import { logger } from "../../di/container";

function extractMeetLink(event: {
    hangoutLink?: string | null;
    conferenceData?: { entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }> };
}): string | undefined {
    return (
        event.hangoutLink ||
        event.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri ||
        undefined
    ) || undefined;
}

export const createScheduleTool = (
    createAIScheduleUseCase: ICreateAIScheduleUseCase | null,
    getUserByNameUseCase?: IGetUserByNameUseCase,
    userRepository?: IUserRepository,
    startConversationUseCase?: IStartConversationUseCase,
    sendDirectMessageUseCase?: ISendDirectMessageUseCase
) => {
    return tool(
        async ({ title, startsAt, targetUsername, durationMinutes }, config) => {
            if (!createAIScheduleUseCase) {
                return "Failed to schedule meeting: Schedule service is not available.";
            }
            if (!getUserByNameUseCase) {
                return "Failed to schedule meeting: User lookup is not available.";
            }

            const context = config?.configurable?.context;
            const workspaceId = context?.workspaceId;
            const channelId = context?.channelId;
            const organizerId = context?.userId;

            if (!workspaceId || !channelId || !organizerId) {
                return "Failed to schedule meeting: Missing workspace/channel/user context.";
            }
            if (!targetUsername?.trim()) {
                return "Failed to schedule meeting: Please specify who to meet with (e.g. @username).";
            }

            const participant = await getUserByNameUseCase.execute({ name: targetUsername });
            if (!participant?.id) {
                return `Failed to schedule meeting: Could not find a user named '${targetUsername}'.`;
            }
            if (participant.id === organizerId) {
                return "Failed to schedule meeting: Choose another person for a one-to-one call.";
            }

            const start = new Date(startsAt);
            if (Number.isNaN(start.getTime())) {
                return "Failed to schedule meeting: Invalid start time.";
            }
            if (start.getTime() <= Date.now() + 60_000) {
                return "Failed to schedule meeting: Start time must be in the future.";
            }

            const minutes = durationMinutes && durationMinutes > 0 ? durationMinutes : 30;
            const endsAt = new Date(start.getTime() + minutes * 60_000);
            const meetingTitle = title || `1:1 with ${participant.name}`;

            let meetLink: string | undefined;
            let googleEventId: string | undefined;
            let calendarWarning = "";

            try {
                const organizer = userRepository
                    ? await userRepository.findById(organizerId)
                    : null;
                const participantUser = userRepository
                    ? await userRepository.findById(participant.id)
                    : null;

                const authClient = await GoogleAuthService.authorize();
                const calendar = google.calendar({ version: "v3", auth: authClient as any });

                const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
                const event = await calendar.events.insert({
                    calendarId: "primary",
                    conferenceDataVersion: 1,
                    requestBody: {
                        summary: meetingTitle,
                        description: "1:1 video call scheduled via DevCollab AI Assistant",
                        start: { dateTime: start.toISOString(), timeZone },
                        end: { dateTime: endsAt.toISOString(), timeZone },
                        attendees: [organizer?.email, participantUser?.email]
                            .filter(Boolean)
                            .map((email) => ({ email: email as string })),
                        conferenceData: {
                            createRequest: {
                                requestId: `devcollab-${organizerId}-${Date.now()}`,
                                conferenceSolutionKey: { type: "hangoutsMeet" },
                            },
                        },
                        reminders: { useDefault: true },
                    },
                });

                googleEventId = event.data.id || undefined;
                meetLink = extractMeetLink(event.data);

                // Meet link can lag behind insert — fetch once more if missing
                if (!meetLink && googleEventId) {
                    await new Promise((r) => setTimeout(r, 800));
                    const fetched = await calendar.events.get({
                        calendarId: "primary",
                        eventId: googleEventId,
                    });
                    meetLink = extractMeetLink(fetched.data);
                }

                if (meetLink) {
                    logger.info(`[ScheduleTool] Meet link created: ${meetLink}`);
                } else {
                    logger.error(
                        `[ScheduleTool] Calendar event created (${googleEventId}) but no Meet link in response`
                    );
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.error(`Google Calendar / Meet sync failed: ${msg}`);
                GoogleAuthService.handleAuthFailure(err);
                if (/invalid_grant|not connected|credentials\.json/i.test(msg)) {
                    calendarWarning =
                        " Meeting was saved, but Google Calendar auth expired — run `npm run google:auth` in server/, then schedule again for a Meet link.";
                } else {
                    calendarWarning =
                        " Meeting was saved internally, but Google Calendar / Meet sync failed.";
                }
            }

            const result = await createAIScheduleUseCase.execute({
                organizerId,
                participantId: participant.id,
                workspaceId,
                channelId,
                title: meetingTitle,
                startsAt: start.toISOString(),
                endsAt: endsAt.toISOString(),
                meetLink,
                googleEventId,
            });

            // Side effect: DM participant with meeting details (+ Meet link when available)
            if (startConversationUseCase && sendDirectMessageUseCase) {
                try {
                    const conversation = await startConversationUseCase.execute(
                        workspaceId,
                        organizerId,
                        participant.id
                    );
                    const linkLine = result.meetLink
                        ? `Join Google Meet: ${result.meetLink}`
                        : "Meet link will be shared when Calendar sync is available.";
                    const content =
                        `I've scheduled a 1:1: "${meetingTitle}" for ${start.toLocaleString()}.\n${linkLine}`;
                    const message = await sendDirectMessageUseCase.execute(
                        conversation.id as string,
                        organizerId,
                        content,
                        MessageType.TEXT
                    );
                    const io = SocketService.getInstance()?.getIO();
                    if (io) {
                        io.to(`conversation:${conversation.id}`).emit("dm_received", message);
                        io.to(`user:${participant.id}`).emit("dm_received", message);
                    }
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : String(err);
                    logger.error(`Failed to DM meet invite: ${msg}`);
                }
            }

            const meetPart = result.meetLink
                ? ` Meet link saved on your AI dashboard and sent to @${participant.name} via DM: ${result.meetLink}.`
                : " Invite was DMed to the participant (no Meet link yet).";

            return `Scheduled a 1:1 video call with @${participant.name} at ${result.startsAt}.${meetPart} Both of you will get a reminder 15 minutes before (${result.reminderAt}).${calendarWarning}`;
        },
        {
            name: "schedule_tool",
            description:
                "Schedules a one-to-one Google Meet video call for a future time. Triggered by /schedule. Requires targetUsername and startsAt.",
            schema: z.object({
                title: z.string().optional().describe("Optional meeting title. Do NOT include '/schedule'."),
                startsAt: z
                    .string()
                    .describe("ISO-8601 start time for the meeting (must be in the future)."),
                targetUsername: z
                    .string()
                    .describe("The other person's name for the 1:1 call (e.g. ashin or @ashin)."),
                durationMinutes: z
                    .number()
                    .optional()
                    .describe("Optional meeting length in minutes. Defaults to 30."),
            }),
        }
    );
};
