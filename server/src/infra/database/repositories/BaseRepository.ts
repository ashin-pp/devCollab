import { Model, ClientSession } from "mongoose";
import { IBaseRepository } from "../../../application/repositories/IBaseRepository";
import { IMapper } from "../../../application/interfaces/IMapper";

export abstract class MongoBaseRepository<TDomain, TModel> implements IBaseRepository<TDomain, ClientSession> {
    protected model: Model<TModel>;
    protected _mapper: IMapper<TDomain, TModel>;
    protected session: ClientSession | null = null;

    constructor(model: Model<TModel>, mapper: IMapper<TDomain, TModel>) {
        this.model = model;
        this._mapper = mapper;
    }

    async create(data: TDomain): Promise<TDomain> {
        const toSave = this._mapper.toPersistence(data);
        const created = await this.model.create(toSave);
        return this._mapper.toDomain(created as unknown as TModel);
    }

    async findById(id: string): Promise<TDomain | null> {
        const found = await this.model.findById(id);
        return found ? this._mapper.toDomain(found as unknown as TModel) : null;
    }

    async update(id: string, data: Partial<TDomain>): Promise<TDomain | null> {
        const persistence = this._mapper.toPersistence(data);
        const updated = await this.model.findByIdAndUpdate(id, persistence, { returnDocument: "after" });
        return updated ? this._mapper.toDomain(updated as unknown as TModel) : null;
    }

    async delete(id: string): Promise<void> {
        await this.model.findByIdAndDelete(id);
    }

    setSession(session: ClientSession | null): void {
        this.session = session;
    }

    async findAll(): Promise<TDomain[]> {
        const docs = await this.model.find();
        return docs.map(d => this._mapper.toDomain(d as unknown as TModel));
    }
}
