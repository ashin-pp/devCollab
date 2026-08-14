export const isFreePlan = (plan: { price: number; name: string }): boolean => {
    const price = Number(plan.price);
    if (Number.isFinite(price) && price <= 0) return true;
    return plan.name.toLowerCase().includes("starter");
};
