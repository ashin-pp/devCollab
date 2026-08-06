import { injectable } from "tsyringe";
import { IPlanRepository } from "../../../application/interfaces/repositories/plan.repository.interface";
import { Plan } from "../../../domain/entities/plan.entity";
import { PlanModel } from "../models/plan.model";
import { PlanMapper } from "../mappers/plan.mapper";

@injectable()
export class PlanRepository implements IPlanRepository {
    private _mapper: PlanMapper;

    constructor() {
        this._mapper = new PlanMapper();
    }

    async create(plan: Partial<Plan>): Promise<Plan> {
        const doc = new PlanModel(this._mapper.toPersistence(plan));
        const saved = await doc.save();
        return this._mapper.toDomain(saved);
    }

    async findById(id: string): Promise<Plan | null> {
        const planDoc = await PlanModel.findById(id);
        return planDoc ? this._mapper.toDomain(planDoc) : null;
    }

    async findActiveByNameContains(namePart: string): Promise<Plan | null> {
        const planDoc = await PlanModel.findOne({
            is_active: true,
            name: { $regex: namePart, $options: "i" },
        }).sort({ price: 1 });
        return planDoc ? this._mapper.toDomain(planDoc) : null;
    }

    async findAllActive(): Promise<Plan[]> {
        const plans = await PlanModel.find({ is_active: true }).sort({ price: 1 });
        return plans.map((p) => this._mapper.toDomain(p));
    }

    async findAll(): Promise<Plan[]> {
        const plans = await PlanModel.find().sort({ price: 1 });
        return plans.map((p) => this._mapper.toDomain(p));
    }

    async update(id: string, updateData: Partial<Plan>): Promise<Plan | null> {
        const updated = await PlanModel.findByIdAndUpdate(
            id,
            this._mapper.toPersistence(updateData),
            { new: true }
        );
        return updated ? this._mapper.toDomain(updated) : null;
    }
}
