import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { IAgentState } from "./AgentState";
import { AgentName } from "../constants/AgentConstants";

export const createWorkerNode = (
    model: ChatGoogleGenerativeAI, 
    tools: DynamicStructuredTool[], 
    name: AgentName, 
    systemPrompt: string
) => {
    const agent = createReactAgent({
        llm: model,
        tools: tools,
        stateModifier: systemPrompt
    });

    return async (state: IAgentState): Promise<{ messages: BaseMessage[] }> => {
        const result = await agent.invoke(state);
        const lastMessage = result.messages[result.messages.length - 1];
        
        if (!lastMessage) {
            return { messages: [] };
        }

        return {
            messages: [
                new HumanMessage({
                    content: `[Worker ${name}]: ${lastMessage.content}`,
                    name: name,
                })
            ]
        };
    };
};
