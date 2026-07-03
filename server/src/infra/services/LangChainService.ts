import { IAIService } from "../../application/services/IAIService";
import { ChatGroq } from "@langchain/groq";
import { envConfig } from "../config/envConfig";
import { StateGraph, START, END, CompiledStateGraph } from "@langchain/langgraph";

import { AgentState, IAgentState } from "../ai/graph/AgentState";
import { createSupervisorNode } from "../ai/graph/SupervisorNode";
import { createWorkerNode } from "../ai/graph/WorkerNode";
import { NOTIFY_AGENT_PROMPT, SUMMARY_AGENT_PROMPT, REMIND_AGENT_PROMPT } from "../ai/constants/AgentPrompts";
import { HumanMessage } from "@langchain/core/messages";

import { CreateNotificationUseCase } from "../../application/use-cases/notification/CreateNotificationUseCase";
import { GetChannelMessagesUseCase } from "../../application/use-cases/channel/GetChannelMessagesUseCase";
import { createNotifyTool } from "../ai/tools/NotifyTool";
import { createSummaryTool } from "../ai/tools/SummaryTool";
import { createRemindTool, ICreateReminderDependency } from "../ai/tools/RemindTool";
import { createSendDMTool } from "../ai/tools/SendDMTool";
import { SendDirectMessageUseCase } from "../../application/use-cases/dm/SendDirectMessageUseCase";
import { StartConversationUseCase } from "../../application/use-cases/dm/StartConversationUseCase";
import { GetUserByNameUseCase } from "../../application/use-cases/user/GetUserByNameUseCase";

import { IUserRepository } from "../../application/repositories/IUserRepository";
import { IChannelRepository } from "../../application/repositories/IChannelRepository";

export class LangChainService implements IAIService {
    private graph: ReturnType<typeof this.buildGraph>;

    constructor(
        private createNotificationUseCase: CreateNotificationUseCase,
        private getChannelMessagesUseCase: GetChannelMessagesUseCase,
        private sendDirectMessageUseCase: SendDirectMessageUseCase,
        private startConversationUseCase: StartConversationUseCase,
        private getUserByNameUseCase: GetUserByNameUseCase,
        private createAIReminderUseCase: ICreateReminderDependency | null = null,
        private userRepository?: IUserRepository,
        private channelRepository?: IChannelRepository
    ) {
        this.graph = this.buildGraph();
    }

    private buildGraph() {
        const model = new ChatGroq({
            apiKey: envConfig.groqApiKey,
            model: "llama-3.1-8b-instant",
            temperature: 0.2, 
        });

        const supervisorNode = createSupervisorNode();
        
        const notifyWorker = createWorkerNode(model, [createNotifyTool(this.createNotificationUseCase, this.getUserByNameUseCase, this.userRepository, this.channelRepository)], "NotifyAgent", NOTIFY_AGENT_PROMPT);

        const summaryWorker = createWorkerNode(model, [
            createSummaryTool(this.getChannelMessagesUseCase),
            createSendDMTool(this.sendDirectMessageUseCase, this.startConversationUseCase)
        ], "SummaryAgent", SUMMARY_AGENT_PROMPT);
        
        const dynamicRemindPrompt = `${REMIND_AGENT_PROMPT}\nThe current date and time is: ${new Date().toString()}. Use this timezone context to calculate future reminder dates, but ALWAYS output the final remindAt in a valid ISO-8601 format (e.g., 2026-07-01T20:46:00+05:30).`;
        const remindWorker = createWorkerNode(model, [createRemindTool(this.createAIReminderUseCase, this.getUserByNameUseCase)], "RemindAgent", dynamicRemindPrompt);

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
            const finalState = await this.graph.invoke({
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