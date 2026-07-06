import 'reflect-metadata';
import { registerRepositories } from './repositories.dependency';
import { registerServices } from './services.dependency';
import { registerUseCases } from './usecases.dependency';

export function registerDependencies() {
    registerRepositories();
    registerServices();
    registerUseCases();
}
