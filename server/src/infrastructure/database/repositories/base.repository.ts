import { Model, ClientSession } from "mongoose";
import { IBaseRepository } from "../../../application/interfaces/repositories/base.repository.interface";
import { IMapper } from "../../../application/interfaces/IMapper";

export abstract class MongoBaseRepository<TDomain, TModel> implements IBaseRepository<TDomain, ClientSession> {
    protected _model: Model<TModel>;
    protected _mapper: IMapper<TDomain, TModel>;
    protected _session: ClientSession | null = null;

    constructor(model: Model<TModel>, mapper: IMapper<TDomain, TModel>) {
        this._model = model;
        this._mapper = mapper;
    }

    async create(data: TDomain): Promise<TDomain> {
        const toSave = this._mapper.toPersistence(data);
        const created = await this._model.create(toSave);
        return this._mapper.toDomain(created as unknown as TModel);
    }

    async findById(id: string): Promise<TDomain | null> {
        const found = await this._model.findById(id);
        return found ? this._mapper.toDomain(found as unknown as TModel) : null;
    }

    async update(id: string, data: Partial<TDomain>): Promise<TDomain | null> {
        const persistence = this._mapper.toPersistence(data);
        const updated = await this._model.findByIdAndUpdate(id, persistence, { returnDocument: "after" });
        return updated ? this._mapper.toDomain(updated as unknown as TModel) : null;
    }

    async delete(id: string): Promise<void> {
        await this._model.findByIdAndDelete(id);
    }

    setSession(session: ClientSession | null): void {
        this._session = session;
    }

    async findAll(): Promise<TDomain[]> {
        const docs = await this._model.find();
        return docs.map(d => this._mapper.toDomain(d as unknown as TModel));
    }

    async findPaginated(query: Record<string, unknown>, page: number, limit: number, sort?: Record<string, 1 | -1>): Promise<{ data: TDomain[]; total: number }> {
        const skip = (page - 1) * limit;
        
        let dbQuery = this._model.find(query).skip(skip).limit(limit);
        if (sort) {
            dbQuery = dbQuery.sort(sort);
        }
        
        const [docs, total] = await Promise.all([
            dbQuery.exec(),
            this._model.countDocuments(query).exec()
        ]);
        
        return {
            data: docs.map(d => this._mapper.toDomain(d as unknown as TModel)),
            total
        };
    }
}
