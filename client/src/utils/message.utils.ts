export const getMessageId = (message: { id?: string; _id?: unknown }): string => {
  return String(message.id || message._id || '');
};
