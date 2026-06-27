export interface PollOption {
    id: string;
    text: string;
    votes: string[]; // User IDs who voted
}

export class Poll {
    constructor(
        public workspaceId: string,
        public question: string,
        public options: PollOption[],
        public createdBy: string,
        public isActive: boolean = true,
        public channelId?: string,
        public expiresAt?: Date,
        public id?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}

    public addVote(userId: string, optionId: string, allowMultiple: boolean = false): void {
        if (!allowMultiple) {
            // Remove previous votes from this user
            this.options.forEach(opt => {
                opt.votes = opt.votes.filter(id => id !== userId);
            });
        }
        
        const option = this.options.find(opt => opt.id === optionId);
        if (option && !option.votes.includes(userId)) {
            option.votes.push(userId);
        }
    }

    public isExpired(): boolean {
        if (!this.expiresAt) return false;
        return new Date() > this.expiresAt;
    }

    public deactivate(): void {
        this.isActive = false;
    }
}
