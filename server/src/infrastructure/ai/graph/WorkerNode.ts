import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { IAgentState } from "./AgentState";
import { AgentName } from "../constants/AgentConstants";

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


        const finalContent = `[Worker ${name}]: ${lastMessage.content} (Action Completed Successfully)`;

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
