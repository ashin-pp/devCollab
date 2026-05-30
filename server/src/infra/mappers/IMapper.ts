export interface IMapper<TDomain, TModel> {
    toDomain(persistence: TModel): TDomain;
    toPersistence(domain: Partial<TDomain>): any;
}
