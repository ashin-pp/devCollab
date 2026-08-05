import { container } from "tsyringe";
import { USECASE_TOKENS } from "../usecase.tokens";
import { GetPlansUseCase } from "../../../application/use-cases/plan/get-plans.usecase";
import { GetAllPlansUseCase } from "../../../application/use-cases/plan/get-all-plans.usecase";
import { CreatePlanUseCase } from "../../../application/use-cases/plan/create-plan.usecase";
import { UpdatePlanUseCase } from "../../../application/use-cases/plan/update-plan.usecase";
import { DeletePlanUseCase } from "../../../application/use-cases/plan/delete-plan.usecase";
import { TogglePlanStatusUseCase } from "../../../application/use-cases/plan/toggle-plan-status.usecase";

export function registerPlanUseCases() {
    container.register(USECASE_TOKENS.IGetPlansUseCase, { useClass: GetPlansUseCase });
    container.register(USECASE_TOKENS.IGetAllPlansUseCase, { useClass: GetAllPlansUseCase });
    container.register(USECASE_TOKENS.ICreatePlanUseCase, { useClass: CreatePlanUseCase });
    container.register(USECASE_TOKENS.IUpdatePlanUseCase, { useClass: UpdatePlanUseCase });
    container.register(USECASE_TOKENS.IDeletePlanUseCase, { useClass: DeletePlanUseCase });
    container.register(USECASE_TOKENS.ITogglePlanStatusUseCase, { useClass: TogglePlanStatusUseCase });
}
