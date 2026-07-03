import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage } from "@langchain/core/messages";
import { envConfig } from "../../config/envConfig";
import { AGENT_NAMES, RouteDestination } from "../constants/AgentConstants";
import { SUPERVISOR_PROMPT } from "../constants/AgentPrompts";
import { IAgentState } from "./AgentState";
import { logger } from "../../../container";

export const createSupervisorNode = () => {
    const model = new ChatGroq({
        apiKey: envConfig.groqApiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0,
    });

    const routingSchema = z.object({
        next: z.enum(["FINISH", ...AGENT_NAMES]).describe("The next worker to route to, or FINISH.")
    });

    const structuredModel = model.withStructuredOutput(routingSchema);

    return async (state: IAgentState): Promise<{ next: RouteDestination }> => {

        const filteredMessages = state.messages.filter(msg => msg.getType() === "human");

        const messages = [
            new SystemMessage(SUPERVISOR_PROMPT),
            ...filteredMessages,
        ];

        const response = await structuredModel.invoke(messages);
        logger.info(`[SupervisorNode] Decided next step: ${response.next}`);
        
        return {
            next: response.next as RouteDestination
        };
    };
};
