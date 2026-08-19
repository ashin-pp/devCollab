export interface IBaseUseCase<T, R, E = undefined> {
    execute(request: T, extra?: E): Promise<R> | R;
}
