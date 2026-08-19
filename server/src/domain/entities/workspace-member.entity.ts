import { MemberStatus } from "../enums/MemberStatus";
import { MemberRole } from "../enums/MemberRole";

export class WorkspaceMember {
    constructor(
        public workspaceId: string,
        public userId: string,
        public role: MemberRole = MemberRole.MEMBER,
        public status: MemberStatus = MemberStatus.APPROVED,
        public joinedAt?: Date,
        public id?: string
    ) {}

    public approve(): void {
        this.status = MemberStatus.APPROVED;
    }

    public block(): void {
        this.status = MemberStatus.BLOCKED;
    }

    public makeOwner(): void {
        this.role = MemberRole.OWNER;
    }
}
