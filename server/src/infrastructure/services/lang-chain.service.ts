import type { ICreateAIReminderUseCase } from "../../application/interfaces/use-cases/ai/create-ai-reminder.usecase.interface";
import type { ICreateAITaskUseCase } from "../../application/interfaces/use-cases/ai/create-ai-task.usecase.interface";
import type { ICreateAIScheduleUseCase } from "../../application/interfaces/use-cases/ai/create-ai-schedule.usecase.interface";
import { USECASE_TOKENS } from "../di/usecase.tokens";
import { injectable, inject } from 'tsyringe';
import { IAIService } from "../../application/interfaces/services/ai.service.interface";
import { ChatGroq } from "@langchain/groq";
import { envConfig } from "../../config/envConfig";
import { StateGraph, START, END } from "@langchain/langgraph";

import { AgentState, IAgentState } from "../ai/graph/AgentState";
import { createSupervisorNode } from "../ai/graph/SupervisorNode";
import { createWorkerNode } from "../ai/graph/WorkerNode";
import {
    NOTIFY_AGENT_PROMPT,
    REMIND_AGENT_PROMPT,
    TASK_AGENT_PROMPT,
    SCHEDULE_AGENT_PROMPT,
} from "../ai/constants/AgentPrompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createNotifyTool } from "../ai/tools/NotifyTool";
import { createRemindTool } from "../ai/tools/RemindTool";
import { createTaskTool } from "../ai/tools/TaskTool";
import { createScheduleTool } from "../ai/tools/ScheduleTool";
import type { IUserRepository } from "../../application/interfaces/repositories/user.repository.interface";
import type { IChannelRepository } from "../../application/interfaces/repositories/channel.repository.interface";
import type { ICreateNotificationUseCase } from "../../application/interfaces/use-cases/notification/create-notification.usecase.interface";
import type { IGetChannelMessagesUseCase } from "../../application/interfaces/use-cases/channel/get-channel-messages.usecase.interface";
import type { IGetUnreadMessagesUseCase } from "../../application/interfaces/use-cases/channel/get-unread-messages.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type { IStartConversationUseCase } from "../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import type { IGetUserByNameUseCase } from "../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";
import { REPOSITORY_TOKENS } from "../di/repository.tokens";
import { MessageType } from "../../domain/enums/MessageType";

@injectable()
export class LangChainService implements IAIService {
    private _graph: ReturnType<typeof this.buildGraph>;
    private _model: ChatGroq;

    constructor(
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(USECASE_TOKENS.IGetChannelMessagesUseCase) private _getChannelMessagesUseCase: IGetChannelMessagesUseCase,
        @inject(USECASE_TOKENS.IGetUnreadMessagesUseCase) private _getUnreadMessagesUseCase: IGetUnreadMessagesUseCase,
        @inject(USECASE_TOKENS.ISendDirectMessageUseCase) private _sendDirectMessageUseCase: ISendDirectMessageUseCase,
        @inject(USECASE_TOKENS.IStartConversationUseCase) private _startConversationUseCase: IStartConversationUseCase,
        @inject(USECASE_TOKENS.IGetUserByNameUseCase) private _getUserByNameUseCase: IGetUserByNameUseCase,
        @inject(USECASE_TOKENS.ICreateAIReminderUseCase) private _createAIReminderUseCase: ICreateAIReminderUseCase | null = null,
        @inject(USECASE_TOKENS.ICreateAITaskUseCase) private _createAITaskUseCase: ICreateAITaskUseCase | null = null,
        @inject(USECASE_TOKENS.ICreateAIScheduleUseCase) private _createAIScheduleUseCase: ICreateAIScheduleUseCase | null = null,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository?: IUserRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository?: IChannelRepository
    ) {
        this._model = new ChatGroq({
            apiKey: envConfig.groqApiKey,
            model: "llama-3.1-8b-instant",
            temperature: 0,
        });
        this._graph = this.buildGraph();
    }

    private buildGraph() {
        const supervisorNode = createSupervisorNode();

        const notifyWorker = createWorkerNode(
            this._model,
            [createNotifyTool(this._createNotificationUseCase, this._getUserByNameUseCase, this._userRepository, this._channelRepository)],
            "NotifyAgent",
            NOTIFY_AGENT_PROMPT
        );

        const nowContext = `The current date and time is: ${new Date().toString()}. Use this timezone context to calculate future dates, but ALWAYS output final datetimes in a valid ISO-8601 format (e.g., 2026-07-01T20:46:00+05:30).`;

        const remindWorker = createWorkerNode(
            this._model,
            [createRemindTool(this._createAIReminderUseCase, this._getUserByNameUseCase)],
            "RemindAgent",
            `${REMIND_AGENT_PROMPT}\n${nowContext}`
        );

        const taskWorker = createWorkerNode(
            this._model,
            [createTaskTool(this._createAITaskUseCase, this._getUserByNameUseCase)],
            "TaskAgent",
            `${TASK_AGENT_PROMPT}\n${nowContext}`
        );

        const scheduleWorker = createWorkerNode(
            this._model,
            [createScheduleTool(
                this._createAIScheduleUseCase,
                this._getUserByNameUseCase,
                this._userRepository,
                this._startConversationUseCase,
                this._sendDirectMessageUseCase
            )],
            "ScheduleAgent",
            `${SCHEDULE_AGENT_PROMPT}\n${nowContext}`
        );

        // Summary is handled deterministically in processMessage to avoid Groq tool-schema failures.
        const summaryWorker = async (): Promise<{ messages: HumanMessage[] }> => ({
            messages: [
                new HumanMessage({
                    content: "[Worker SummaryAgent]: Summary handled outside the graph (Action Completed Successfully)",
                    name: "SummaryAgent",
                }),
            ],
        });

        const workflow = new StateGraph(AgentState)
            .addNode("Supervisor", supervisorNode)
            .addNode("NotifyAgent", notifyWorker)
            .addNode("SummaryAgent", summaryWorker)
            .addNode("RemindAgent", remindWorker)
            .addNode("TaskAgent", taskWorker)
            .addNode("ScheduleAgent", scheduleWorker);

        workflow.addEdge("NotifyAgent", END);
        workflow.addEdge("SummaryAgent", END);
        workflow.addEdge("RemindAgent", END);
        workflow.addEdge("TaskAgent", END);
        workflow.addEdge("ScheduleAgent", END);

        workflow.addConditionalEdges("Supervisor", (state: IAgentState) => state.next, {
            NotifyAgent: "NotifyAgent",
            SummaryAgent: "SummaryAgent",
            RemindAgent: "RemindAgent",
            TaskAgent: "TaskAgent",
            ScheduleAgent: "ScheduleAgent",
            FINISH: END
        });

        workflow.addEdge(START, "Supervisor");

        return workflow.compile();
    }

    private async sendSummaryDm(userId: string, workspaceId: string, content: string): Promise<void> {
        const conversation = await this._startConversationUseCase.execute(workspaceId, userId, userId);
        await this._sendDirectMessageUseCase.execute(
            conversation.id as string,
            userId,
            content,
            MessageType.AI
        );
    }

    private stripMessageHtml(content: string): string {
        return String(content || "")
            .replace(/&nbsp;/gi, " ")
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<\/div>/gi, " ")
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/gi, "&")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&quot;/gi, '"')
            .replace(/\s+/g, " ")
            .trim();
    }

    private isSummarizableMessage(message: { messageType?: string; content?: string }): boolean {
        if (message.messageType === "system") return false;
        const content = this.stripMessageHtml(message.content || "");
        if (!content) return false;
        // Skip slash-command triggers themselves
        if (/^\/(summary|task|notify|remind|schedule|help)\b/i.test(content)) return false;
        return true;
    }

    private buildSummaryChatHistory(
        messages: Array<{ content?: string; senderName?: string; senderId?: string }>
    ): string {
        let chatHistory = messages.map((m, index) => {
            let text = this.stripMessageHtml(m.content || "");
            if (text.length > 200) text = `${text.substring(0, 200)}...`;
            const speaker = m.senderName || m.senderId || "Unknown";
            return `${index + 1}. ${speaker}: ${text}`;
        }).join("\n");

        if (chatHistory.length > 2000) {
            chatHistory = chatHistory.substring(chatHistory.length - 2000);
        }
        return chatHistory;
    }

    private async processSummaryCommand(context: {
        workspaceId: string;
        channelId: string;
        userId: string;
    }): Promise<string> {
        const unreadMessages = await this._getUnreadMessagesUseCase.execute({
            channelId: context.channelId,
            userId: context.userId,
        });

        let messages: Array<{
            messageType?: string;
            content?: string;
            senderName?: string;
            senderId?: string;
        }> = (unreadMessages || []).filter((m) => this.isSummarizableMessage(m)).slice(-15);
        let usedUnread = messages.length > 0;

        // Opening a channel marks it read, so unread is often empty by the time /summary runs.
        // Fall back to a short recent window so the summary matches what the user just saw.
        if (!usedUnread) {
            const recentMessages = await this._getChannelMessagesUseCase.execute({
                channelId: context.channelId,
                page: 1,
                limit: 15,
                viewerId: context.userId,
            });
            // Repository returns newest-first; reverse for chronological summary context.
            messages = [...recentMessages]
                .reverse()
                .filter((m) => this.isSummarizableMessage(m))
                .slice(-12);
        }

        if (messages.length === 0) {
            await this.sendSummaryDm(
                context.userId,
                context.workspaceId,
                "There are no messages to summarize in this channel yet."
            );
            return "The channel chat summary has been successfully sent to your DMs.";
        }

        const chatHistory = this.buildSummaryChatHistory(messages);
        if (!chatHistory.trim()) {
            await this.sendSummaryDm(
                context.userId,
                context.workspaceId,
                "There are no messages to summarize in this channel yet."
            );
            return "The channel chat summary has been successfully sent to your DMs.";
        }

        console.log("[LangChainService.processSummaryCommand] Generating summary", {
            channelId: context.channelId,
            userId: context.userId,
            messageCount: messages.length,
            usedUnread,
            preview: chatHistory.slice(0, 400),
        });

        const summaryResponse = await this._model.invoke([
            new SystemMessage(
                [
                    "You are a strict channel-chat summarizer.",
                    "Rules:",
                    "1. Use ONLY the numbered transcript lines provided.",
                    "2. Do NOT invent people, replies, questions, locations, ages, or task updates that are not explicitly written in the transcript.",
                    "3. If only one person spoke, say that clearly — do not invent a second speaker.",
                    "4. Mention only names that appear as speakers in the transcript.",
                    "5. Reply with 2-3 short factual sentences. No preamble, no bullet points, no tool/status talk.",
                ].join("\n")
            ),
            new HumanMessage(
                `${usedUnread ? "Unread transcript" : "Recent transcript"} (${messages.length} messages):\n\n${chatHistory}\n\nWrite a factual 2-3 sentence summary now.`
            ),
        ]);

        const summaryText = String(summaryResponse.content || "").trim();
        if (!summaryText) {
            await this.sendSummaryDm(
                context.userId,
                context.workspaceId,
                "I found messages in this channel, but could not generate a summary right now. Please try again."
            );
            return "The channel chat summary has been successfully sent to your DMs.";
        }

        const dmContent = usedUnread
            ? summaryText
            : `Recent channel summary:\n\n${summaryText}`;

        await this.sendSummaryDm(context.userId, context.workspaceId, dmContent);
        return "The channel chat summary has been successfully sent to your DMs.";
    }

    async processMessage(input: string, context: { workspaceId: string; channelId: string; userId: string; }): Promise<string> {
        try {
            const cleanedInput = this.stripMessageHtml(input);

            // Only treat true /summary slash commands as summary — never substring matches.
            if (/^(?:@\S+\s+)*\/summary\b/i.test(cleanedInput)) {
                return await this.processSummaryCommand(context);
            }

            const finalState = await this._graph.invoke({
                messages: [new HumanMessage(cleanedInput)],
                context: context
            }, { configurable: { context: { ...context, originalInput: cleanedInput } } }) as IAgentState;

            const aiMessage = finalState.messages[finalState.messages.length - 1];
            if (!aiMessage) {
                return "I couldn't process that request.";
            }

            let content = aiMessage.content as string;
            content = content.replace(/^\[Worker [a-zA-Z]+\]:\s*/, '').replace(/\s*\(Action Completed Successfully\)$/, '');

            return content;
        } catch (error: any) {
            console.error("[LangChainService.processMessage] AI processing failed", {
                input,
                context,
                message: error?.message,
                status: error?.status,
                stack: error?.stack
            });
            if (error?.message?.includes("Rate limit") || error?.status === 429) {
                return "I'm currently receiving too many requests. Please wait a few seconds and try again.";
            }
            return "An error occurred while processing your request. Please try again.";
        }
    }
}
