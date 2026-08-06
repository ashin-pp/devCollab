import { UserService } from '../api/user/user.service';
import { PlanService, type Plan } from '../api/plan/plan.service';

/** Resolve the user's effective plan (selected, else Starter, else first active). */
export async function resolveUserPlan(): Promise<Plan | null> {
  try {
    const [profileRes, plans] = await Promise.all([
      UserService.getProfile(),
      PlanService.getActivePlans(),
    ]);
    const planId = profileRes?.data?.planId;
    return (
      (typeof planId === 'string' && plans.find((p) => p.id === planId)) ||
      plans.find((p) => p.name.toLowerCase().includes('starter')) ||
      plans[0] ||
      null
    );
  } catch {
    return null;
  }
}
