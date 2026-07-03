export interface IAIRequest {
  input: string;
  workspaceId: string;
  channelId: string;
}

export interface IAIResponse {
  success: boolean;
  data: {
    response: string;
  };
}
