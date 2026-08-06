import type { IPlanRepository } from "../interfaces/repositories/plan.repository.interface";
import { User } from "../../domain/entities/user.entity";
import { ErrorMessage } from "../../domain/enums/ErrorMessage";
import { HttpStatusCode } from "../../domain/enums/HttpStatusCode";
import { SubscriptionStatus } from "../../domain/enums/SubscriptionStatus";
import { AppError } from "../../domain/errors/AppError";

/** Assign active Starter and start the free-trial clock at account creation. */
export async function assignStarterTrial(
    user: User,
    planRepository: IPlanRepository,
    now: Date = new Date()
): Promise<void> {
    const starter = await planRepository.findActiveByNameContains(SubscriptionStatus.STARTER);
    if (!starter?.id) {
        throw new AppError(ErrorMessage.STARTER_PLAN_NOT_CONFIGURED, HttpStatusCode.INTERNAL_SERVER);
    }
    user.selectPlan(starter.id, SubscriptionStatus.STARTER, now);
}
