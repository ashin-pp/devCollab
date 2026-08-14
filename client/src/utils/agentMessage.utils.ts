/** Channel client-injected agent replies use this sender id. */
export const AI_SYSTEM_SENDER_ID = 'ai-system';

export const isAgentMessage = (msg: {
  senderId?: string;
  messageType?: string;
}): boolean =>
  msg.messageType === 'ai' || msg.senderId === AI_SYSTEM_SENDER_ID;
