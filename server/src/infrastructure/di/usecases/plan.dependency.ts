import { container } from "tsyringe";
import { USECASE_TOKENS } from "../usecase.tokens";
import { GetPlansUseCase } from "../../../application/use-cases/plan/get-plans.usecase";

export function registerPlanUseCases() {
    container.register(USECASE_TOKENS.IGetPlansUseCase, { useClass: GetPlansUseCase });
}
