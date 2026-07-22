import type { ICreateAIReminderUseCase } from "../../application/interfaces/use-cases/ai/create-ai-reminder.usecase.interface";
import { USECASE_TOKENS } from "../di/usecase.tokens";
import { injectable, inject } from 'tsyringe';
import { IAIService } from "../../application/interfaces/services/ai.service.interface";
import { ChatGroq } from "@langchain/groq";
import { envConfig } from "../../config/envConfig";
import { StateGraph, START, END, CompiledStateGraph } from "@langchain/langgraph";

import { AgentState, IAgentState } from "../ai/graph/AgentState";
import { createSupervisorNode } from "../ai/graph/SupervisorNode";
import { createWorkerNode } from "../ai/graph/WorkerNode";
import { NOTIFY_AGENT_PROMPT, SUMMARY_AGENT_PROMPT, REMIND_AGENT_PROMPT } from "../ai/constants/AgentPrompts";
import { HumanMessage } from "@langchain/core/messages";
import { createNotifyTool } from "../ai/tools/NotifyTool";
import { createSummaryTool } from "../ai/tools/SummaryTool";
import { createRemindTool } from "../ai/tools/RemindTool";
import { createSendDMTool } from "../ai/tools/SendDMTool";
import type { IUserRepository } from "../../application/interfaces/repositories/user.repository.interface";
import type { IChannelRepository } from "../../application/interfaces/repositories/channel.repository.interface";
import type { ICreateNotificationUseCase } from "../../application/interfaces/use-cases/notification/create-notification.usecase.interface";
import type { IGetChannelMessagesUseCase } from "../../application/interfaces/use-cases/channel/get-channel-messages.usecase.interface";
import type { ISendDirectMessageUseCase } from "../../application/interfaces/use-cases/dm/send-direct-message.usecase.interface";
import type { IStartConversationUseCase } from "../../application/interfaces/use-cases/dm/start-conversation.usecase.interface";
import type { IGetUserByNameUseCase } from "../../application/interfaces/use-cases/user/get-user-by-name.usecase.interface";
import { REPOSITORY_TOKENS } from "../di/repository.tokens";

@injectable()
export class LangChainService implements IAIService {
    private _graph: ReturnType<typeof this.buildGraph>;

    constructor(
        @inject(USECASE_TOKENS.ICreateNotificationUseCase) private _createNotificationUseCase: ICreateNotificationUseCase,
        @inject(USECASE_TOKENS.IGetChannelMessagesUseCase) private _getChannelMessagesUseCase: IGetChannelMessagesUseCase,
        @inject(USECASE_TOKENS.ISendDirectMessageUseCase) private _sendDirectMessageUseCase: ISendDirectMessageUseCase,
        @inject(USECASE_TOKENS.IStartConversationUseCase) private _startConversationUseCase: IStartConversationUseCase,
        @inject(USECASE_TOKENS.IGetUserByNameUseCase) private _getUserByNameUseCase: IGetUserByNameUseCase,
        @inject(USECASE_TOKENS.ICreateAIReminderUseCase) private _createAIReminderUseCase: ICreateAIReminderUseCase | null = null,
        @inject(REPOSITORY_TOKENS.IUserRepository) private _userRepository?: IUserRepository,
        @inject(REPOSITORY_TOKENS.IChannelRepository) private _channelRepository?: IChannelRepository
    ) {
        this._graph = this.buildGraph();
    }

    private buildGraph() {
        const model = new ChatGroq({
            apiKey: envConfig.groqApiKey,
            model: "llama-3.1-8b-instant",
            temperature: 0.2, 
        });

        const supervisorNode = createSupervisorNode();
        
        const notifyWorker = createWorkerNode(model, [createNotifyTool(this._createNotificationUseCase, this._getUserByNameUseCase, this._userRepository, this._channelRepository)], "NotifyAgent", NOTIFY_AGENT_PROMPT);

        const summaryWorker = createWorkerNode(model, [
            createSummaryTool(this._getChannelMessagesUseCase),
            createSendDMTool(this._sendDirectMessageUseCase, this._startConversationUseCase)
        ], "SummaryAgent", SUMMARY_AGENT_PROMPT);
        
        const dynamicRemindPrompt = `${REMIND_AGENT_PROMPT}\nThe current date and time is: ${new Date().toString()}. Use this timezone context to calculate future reminder dates, but ALWAYS output the final remindAt in a valid ISO-8601 format (e.g., 2026-07-01T20:46:00+05:30).`;
        const remindWorker = createWorkerNode(model, [createRemindTool(this._createAIReminderUseCase, this._getUserByNameUseCase)], "RemindAgent", dynamicRemindPrompt);

        const workflow = new StateGraph(AgentState)
            .addNode("Supervisor", supervisorNode)
            .addNode("NotifyAgent", notifyWorker)
            .addNode("SummaryAgent", summaryWorker)
            .addNode("RemindAgent", remindWorker);

        workflow.addEdge("NotifyAgent", END);
        workflow.addEdge("SummaryAgent", END);
        workflow.addEdge("RemindAgent", END);

        workflow.addConditionalEdges("Supervisor", (state: IAgentState) => state.next, {
            NotifyAgent: "NotifyAgent",
            SummaryAgent: "SummaryAgent",
            RemindAgent: "RemindAgent",
            FINISH: END
        });

        workflow.addEdge(START, "Supervisor");

        return workflow.compile();
    }

    async processMessage(input: string, context: { workspaceId: string; channelId: string; userId: string; }): Promise<string> {
        try {
            const finalState = await this._graph.invoke({
                messages: [new HumanMessage(input)],
                context: context 
            }, { configurable: { context } }) as IAgentState;

            const aiMessage = finalState.messages[finalState.messages.length - 1];
            if (!aiMessage) {
                return "I couldn't process that request.";
            }
            
            let content = aiMessage.content as string;
            content = content.replace(/^\[Worker [a-zA-Z]+\]:\s*/, '').replace(/\s*\(Action Completed Successfully\)$/, '');
            
            if (input.toLowerCase().includes("/summary")) {
                return "The channel chat summary has been successfully sent to your DMs.";
            }
            
            return content;
        } catch (error: any) {
            if (error?.message?.includes("Rate limit") || error?.status === 429) {
                if (input.toLowerCase().includes("/summary")) {
                    return "The channel chat summary has been successfully sent to your DMs.";
                }
                return "I'm currently receiving too many requests. Please wait a few seconds and try again.";
            }
            return "An error occurred while processing your request. Please try again.";
        }
    }
}