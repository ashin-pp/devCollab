import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { IAgentState } from "./AgentState";
import { AgentName } from "../constants/AgentConstants";

function lastToolText(messages: BaseMessage[]): string {
    for (const message of [...messages].reverse()) {
        const isTool =
            message instanceof ToolMessage || message.getType() === "tool";
        if (!isTool) continue;
        const text = String(message.content ?? "").trim();
        if (text) return text;
    }
    return "";
}

export const createWorkerNode = (
    model: ChatGroq, 
    tools: DynamicStructuredTool[], 
    name: AgentName, 
    systemPrompt: string
) => {
    const agent = createReactAgent({
        llm: model,
        tools: tools,
        stateModifier: systemPrompt
    });

    return async (state: IAgentState, config?: any): Promise<{ messages: BaseMessage[] }> => {
        let result;
        try {
            result = await agent.invoke(state, config);
        } catch (error) {
            console.error(`[WorkerNode] ${name} failed:`, error);
            throw error;
        }

        const lastMessage = result.messages[result.messages.length - 1];

        if (!lastMessage) {
            console.warn(`[WorkerNode] ${name} returned no final message.`);
            return { messages: [] };
        }

        let reply = String(lastMessage.content ?? "");
        if (name === "ScheduleAgent") {
            const toolText = lastToolText(result.messages);
            if (toolText) reply = toolText;
        }

        const finalContent = `[Worker ${name}]: ${reply} (Action Completed Successfully)`;

        return {
            messages: [
                new HumanMessage({
                    content: finalContent,
                    name,
                }),
            ],
        };
    };
};
