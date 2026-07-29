export interface MarkNotificationReadRequestDto {
    action: 'single' | 'all';
    id?: string;
    userId?: string;
}
