/** Free plans never require Razorpay — Starter by name, or any plan priced at 0. */
export const isFreePlan = (plan: { price: number; name: string }): boolean => {
    const price = Number(plan.price);
    if (Number.isFinite(price) && price <= 0) return true;
    return plan.name.toLowerCase().includes("starter");
};
