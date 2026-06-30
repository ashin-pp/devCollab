import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage } from "@langchain/core/messages";
import { envConfig } from "../../config/envConfig";
import { AGENT_NAMES, RouteDestination } from "../constants/AgentConstants";
import { SUPERVISOR_PROMPT } from "../constants/AgentPrompts";
import { IAgentState } from "./AgentState";

export const createSupervisorNode = () => {
    const model = new ChatGoogleGenerativeAI({
        apiKey: envConfig.geminiApiKey,
        model: "gemini-2.5-flash",
        temperature: 0, 
    });

    const routingSchema = z.object({
        next: z.enum(["FINISH", ...AGENT_NAMES]).describe("The next worker to route to, or FINISH.")
    });

    const structuredModel = model.withStructuredOutput(routingSchema);

    return async (state: IAgentState): Promise<{ next: RouteDestination }> => {
        const messages = [
            new SystemMessage(SUPERVISOR_PROMPT),
            ...state.messages,
        ];
        
        const response = await structuredModel.invoke(messages);
        
        return {
            next: response.next as RouteDestination
        };
    };
};
