import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage } from "@langchain/core/messages";
import { envConfig } from "../../config/envConfig";
import { AGENT_NAMES, RouteDestination } from "../constants/AgentConstants";
import { SUPERVISOR_PROMPT } from "../constants/AgentPrompts";
import { IAgentState } from "./AgentState";

export const createSupervisorNode = () => {
    const model = new ChatGroq({
        apiKey: envConfig.groqApiKey,
        model: "llama3-70b-8192",
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
        console.log(`[SupervisorNode] Decided next step: ${response.next}`);
        
        return {
            next: response.next as RouteDestination
        };
    };
};
