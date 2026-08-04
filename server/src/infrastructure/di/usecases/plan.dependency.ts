import { container } from "tsyringe";
import { USECASE_TOKENS } from "../usecase.tokens";
import { GetPlansUseCase } from "../../../application/use-cases/plan/get-plans.usecase";
import { GetAllPlansUseCase } from "../../../application/use-cases/plan/get-all-plans.usecase";
import { CreatePlanUseCase } from "../../../application/use-cases/plan/create-plan.usecase";
import { TogglePlanStatusUseCase } from "../../../application/use-cases/plan/toggle-plan-status.usecase";

export function registerPlanUseCases() {
    container.register(USECASE_TOKENS.IGetPlansUseCase, { useClass: GetPlansUseCase });
    container.register(USECASE_TOKENS.IGetAllPlansUseCase, { useClass: GetAllPlansUseCase });
    container.register(USECASE_TOKENS.ICreatePlanUseCase, { useClass: CreatePlanUseCase });
    container.register(USECASE_TOKENS.ITogglePlanStatusUseCase, { useClass: TogglePlanStatusUseCase });
}
