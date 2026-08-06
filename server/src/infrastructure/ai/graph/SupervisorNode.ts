import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage } from "@langchain/core/messages";
import { envConfig } from "../../../config/envConfig";
import { AGENT_NAMES, AgentName, RouteDestination } from "../constants/AgentConstants";
import { SUPERVISOR_PROMPT } from "../constants/AgentPrompts";
import { IAgentState } from "./AgentState";
import { logger } from "../../../infrastructure/di/container";

/** Prefer slash-command routing so Groq cannot mis-route /task → SummaryAgent. */
function stripForRouting(text: string): string {
    return String(text || "")
        .replace(/&nbsp;/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\u200b/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function routeFromSlashCommand(text: string): AgentName | null {
    const cleaned = stripForRouting(text);
    // Allow optional leading @mentions before the slash command.
    const match = cleaned.match(/^(?:@\S+\s+)*\/(task|notify|remind|schedule|summary)\b/i);
    if (!match) return null;

    switch (match[1].toLowerCase()) {
        case "task":
            return "TaskAgent";
        case "notify":
            return "NotifyAgent";
        case "remind":
            return "RemindAgent";
        case "schedule":
            return "ScheduleAgent";
        case "summary":
            return "SummaryAgent";
        default:
            return null;
    }
}

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
        const lastHuman = filteredMessages[filteredMessages.length - 1];
        const lastText = typeof lastHuman?.content === "string" ? lastHuman.content : "";

        const forced = routeFromSlashCommand(lastText);
        if (forced) {
            logger.info(`[SupervisorNode] Slash-command route: ${forced}`);
            return { next: forced };
        }

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
