import { Plan } from "../../../domain/entities/plan.entity";

export interface IPlanRepository {
    create(plan: Partial<Plan>): Promise<Plan>;
    findById(id: string): Promise<Plan | null>;
    findActiveByNameContains(namePart: string): Promise<Plan | null>;
    findAllActive(): Promise<Plan[]>;
    findAll(): Promise<Plan[]>;
    update(id: string, updateData: Partial<Plan>): Promise<Plan | null>;
}
