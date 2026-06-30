import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { RouteDestination } from "../constants/AgentConstants";

export interface IAgentContext {
    workspaceId: string;
    channelId: string;
    userId: string;
}

export const AgentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (current, next) => current.concat(next),
        default: () => [],
    }),
    next: Annotation<RouteDestination>({
        reducer: (current, next) => next ?? current ?? "FINISH",
        default: () => "FINISH",
    }),
    context: Annotation<IAgentContext>({
        reducer: (current, next) => next ?? current,
        default: () => ({ workspaceId: "", channelId: "", userId: "" })
    })
});

export type IAgentState = typeof AgentState.State;
