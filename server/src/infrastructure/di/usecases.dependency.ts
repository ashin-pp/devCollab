import { container } from 'tsyringe';
import { TOKENS } from './tokens';

// Use Cases that need explicit interface/token registration
import { CreateAIReminderUseCase } from '../../application/use-cases/ai/create-ai-reminder.usecase';

export function registerUseCases() {
    container.registerSingleton(TOKENS.ICreateReminderDependency, CreateAIReminderUseCase);
}
