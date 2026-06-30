import { IAIService } from "../../application/services/IAIService";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { envConfig } from "../config/envConfig";
import { StateGraph, START, END, CompiledStateGraph } from "@langchain/langgraph";

import { AgentState, IAgentState } from "../ai/graph/AgentState";
import { createSupervisorNode } from "../ai/graph/SupervisorNode";
import { createWorkerNode } from "../ai/graph/WorkerNode";
import { NOTIFY_AGENT_PROMPT, TASK_AGENT_PROMPT, SUMMARY_AGENT_PROMPT, REMIND_AGENT_PROMPT, FIX_AGENT_PROMPT } from "../ai/constants/AgentPrompts";
import { HumanMessage } from "@langchain/core/messages";

// Dependencies
import { CreateNotificationUseCase } from "../../application/use-cases/notification/CreateNotificationUseCase";
import { GetChannelMessagesUseCase } from "../../application/use-cases/channel/GetChannelMessagesUseCase";

// Tools
import { createNotifyTool } from "../ai/tools/NotifyTool";
import { createTaskTool, ICreateTaskDependency } from "../ai/tools/TaskTool";
import { createSummaryTool } from "../ai/tools/SummaryTool";
import { createRemindTool, ICreateReminderDependency } from "../ai/tools/RemindTool";
import { createFixTool } from "../ai/tools/FixTool";

export class LangChainService implements IAIService {
    private graph: ReturnType<typeof this.buildGraph>;

    constructor(
        private createNotificationUseCase: CreateNotificationUseCase,
        private getChannelMessagesUseCase: GetChannelMessagesUseCase,
        private createAITaskUseCase: ICreateTaskDependency | null = null,
        private createAIReminderUseCase: ICreateReminderDependency | null = null
    ) {
        this.graph = this.buildGraph();
    }

    private buildGraph() {
        const model = new ChatGoogleGenerativeAI({
            apiKey: envConfig.geminiApiKey,
            model: "gemini-2.5-flash",
            temperature: 0.2, 
        });

        const supervisorNode = createSupervisorNode();
        
        const notifyWorker = createWorkerNode(model, [createNotifyTool(this.createNotificationUseCase)], "NotifyAgent", NOTIFY_AGENT_PROMPT);
        const taskWorker = createWorkerNode(model, [createTaskTool(this.createAITaskUseCase)], "TaskAgent", TASK_AGENT_PROMPT);
        const summaryWorker = createWorkerNode(model, [createSummaryTool(this.getChannelMessagesUseCase)], "SummaryAgent", SUMMARY_AGENT_PROMPT);
        const remindWorker = createWorkerNode(model, [createRemindTool(this.createAIReminderUseCase)], "RemindAgent", REMIND_AGENT_PROMPT);
        const fixWorker = createWorkerNode(model, [createFixTool()], "FixAgent", FIX_AGENT_PROMPT);

        const workflow = new StateGraph(AgentState)
            .addNode("Supervisor", supervisorNode)
            .addNode("NotifyAgent", notifyWorker)
            .addNode("TaskAgent", taskWorker)
            .addNode("SummaryAgent", summaryWorker)
            .addNode("RemindAgent", remindWorker)
            .addNode("FixAgent", fixWorker);

        // All workers route back to supervisor
        workflow.addEdge("NotifyAgent", "Supervisor");
        workflow.addEdge("TaskAgent", "Supervisor");
        workflow.addEdge("SummaryAgent", "Supervisor");
        workflow.addEdge("RemindAgent", "Supervisor");
        workflow.addEdge("FixAgent", "Supervisor");

        workflow.addConditionalEdges("Supervisor", (state: IAgentState) => state.next, {
            NotifyAgent: "NotifyAgent",
            TaskAgent: "TaskAgent",
            SummaryAgent: "SummaryAgent",
            RemindAgent: "RemindAgent",
            FixAgent: "FixAgent",
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
            }) as IAgentState;

            const aiMessage = finalState.messages[finalState.messages.length - 1];
            if (!aiMessage) {
                return "I couldn't process that request.";
            }
            return aiMessage.content as string;
        } catch (error) {
            console.error("LangChainService processMessage error:", error);
            throw new Error("Failed to process AI message");
        }
    }
}