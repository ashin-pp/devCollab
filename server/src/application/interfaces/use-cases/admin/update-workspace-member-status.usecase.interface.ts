import { MemberStatus } from "../../../../domain/enums/MemberStatus";

export interface IUpdateWorkspaceMemberStatusUseCase {
    execute(payload: {workspaceId: string, userId: string, status: MemberStatus}): Promise<void>;
}
