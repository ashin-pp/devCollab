export const ReplyVisibility = {
    EVERYONE: 'everyone',
    AUTHOR: 'author',
} as const;

export type ReplyVisibilityType = typeof ReplyVisibility[keyof typeof ReplyVisibility];
