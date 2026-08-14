import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { ICreateAIScheduleUseCase } from "../../../application/interfaces/use-cases/ai/create-ai-schedule.usecase.interface";
import type { IGetUserByNameUseCase } from "../../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";
import type { IStartConversationUseCase } from "../../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type { IUserRepository } from "../../../application/interfaces/repositories/user.repository.interface";
import { MessageType } from "../../../domain/enums/MessageType";
import { SocketService } from "../../socket/socket.service";
import { logger } from "../../di/container";
import {
    extractScheduleNote,
    normalizeScheduleName,
} from "../utils/schedule-note.utils";

export const createScheduleTool = (
    createAIScheduleUseCase: ICreateAIScheduleUseCase | null,
    getUserByNameUseCase?: IGetUserByNameUseCase,
    userRepository?: IUserRepository,
    startConversationUseCase?: IStartConversationUseCase,
    sendDirectMessageUseCase?: ISendDirectMessageUseCase
) => {
    return tool(
        async ({ title, note, startsAt, targetUsername, targetUsernames, durationMinutes }, config) => {
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

            const names = Array.from(
                new Set(
                    [...(targetUsernames ?? []), targetUsername ?? ""]
                        .map(normalizeScheduleName)
                        .filter(Boolean)
                )
            );

            if (names.length === 0) {
                return "Failed to schedule meeting: Please specify who to meet with (e.g. @alice @bob).";
            }

            const resolved: Array<{ id: string; name: string }> = [];
            for (const name of names) {
                const user = await getUserByNameUseCase.execute({ name });
                if (!user?.id) {
                    return `Failed to schedule meeting: Could not find a user named '${name}'.`;
                }
                if (user.id === organizerId) continue;
                if (resolved.some((p) => p.id === user.id)) continue;
                resolved.push({ id: user.id, name: user.name });
            }

            if (resolved.length === 0) {
                return "Failed to schedule meeting: Choose at least one other person.";
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
            const primary = resolved[0];
            if (!primary) {
                return "Failed to schedule meeting: Choose at least one other person.";
            }

            const mentionList = resolved.map((p) => `@${p.name}`).join(", ");
            const originalInput = String(context?.originalInput || "");
            const leftoverNote = extractScheduleNote(originalInput, [
                ...names,
                ...resolved.map((p) => p.name),
            ]);
            const extraNote = (leftoverNote || note || "").trim();
            const customTitle = (title || "").trim();
            const meetingTitle =
                customTitle ||
                (extraNote && extraNote.length <= 80
                    ? extraNote
                    : resolved.length === 1
                      ? `Call with ${primary.name}`
                      : `Group call with ${mentionList}`);

            const extras = resolved.slice(1);
            const result = await createAIScheduleUseCase.execute({
                organizerId,
                participantId: primary.id,
                participantIds: extras.map((p) => p.id),
                workspaceId,
                channelId,
                title: meetingTitle,
                note: extraNote && extraNote.toLowerCase() !== meetingTitle.toLowerCase()
                    ? extraNote
                    : undefined,
                startsAt: start.toISOString(),
                endsAt: endsAt.toISOString(),
            });

            let organizerName = "Someone";
            if (userRepository) {
                const [organizer] = await userRepository.findByIds([organizerId]);
                if (organizer?.name) organizerName = organizer.name;
            }

            const when = start.toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
            });
            const showQuotedTitle = Boolean(
                customTitle ||
                    (extraNote && extraNote.toLowerCase() === meetingTitle.toLowerCase())
            );
            const inviteLine = showQuotedTitle
                ? `${organizerName} created a video call "${meetingTitle}" with ${mentionList} at ${when}.`
                : `${organizerName} created a video call with ${mentionList} at ${when}.`;
            const noteLine =
                extraNote && extraNote.toLowerCase() !== meetingTitle.toLowerCase()
                    ? extraNote
                    : "";
            const joinLine = result.meetLink || "";
            const userMessage = [inviteLine, noteLine, joinLine].filter(Boolean).join("\n");

            if (startConversationUseCase && sendDirectMessageUseCase) {
                await Promise.allSettled(
                    resolved.map(async (participant) => {
                        try {
                            const conversation = await startConversationUseCase.execute(
                                workspaceId,
                                organizerId,
                                participant.id
                            );
                            const message = await sendDirectMessageUseCase.execute(
                                conversation.id as string,
                                organizerId,
                                userMessage,
                                MessageType.TEXT
                            );
                            const io = SocketService.getInstance()?.getIO();
                            if (io) {
                                io.to(`conversation:${conversation.id}`).emit("dm_received", message);
                                io.to(`user:${participant.id}`).emit("dm_received", message);
                            }
                        } catch (err: unknown) {
                            const msg = err instanceof Error ? err.message : String(err);
                            logger.error(`Failed to DM meeting invite to ${participant.name}: ${msg}`);
                        }
                    })
                );
            }

            return userMessage;
        },
        {
            name: "schedule_tool",
            description:
                "Schedules a video call (1:1 or group). Triggered by /schedule. Pass one or more usernames plus a future startsAt.",
            schema: z.object({
                title: z.string().optional().describe("Optional short meeting name. Do NOT include '/schedule'."),
                note: z
                    .string()
                    .optional()
                    .describe(
                        "Any extra context the user typed (agenda, topic, or other message) besides names and time. Copy it verbatim."
                    ),
                startsAt: z
                    .string()
                    .describe("ISO-8601 start time for the meeting (must be in the future)."),
                targetUsername: z
                    .string()
                    .optional()
                    .describe("One invitee name (e.g. ashin or @ashin). Use targetUsernames for a group."),
                targetUsernames: z
                    .array(z.string())
                    .optional()
                    .describe("Invitee names for a 1-to-many call (e.g. ['alice','bob'])."),
                durationMinutes: z
                    .number()
                    .optional()
                    .describe("Optional meeting length in minutes. Defaults to 30."),
            }),
        }
    );
};
