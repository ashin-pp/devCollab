export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    logo?: string;
    createdBy: string;
    privacy?: 'public' | 'private';
    maxMembers?: number;
}
