import { AdminLayout } from "../../layouts/AdminLayout";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminService } from "../../api/admin/admin.service";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import Swal from "sweetalert2";

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  messageRetentionDays: number;
  aiAssistantEnabled: boolean;
  videoCallsEnabled: boolean;
  multiAiAgents: boolean;
  pinBoardEnabled: boolean;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  price: 0,
  currency: "INR",
  durationDays: 30,
  maxWorkspaces: 1,
  maxMembersPerWorkspace: 5,
  messageRetentionDays: 30,
  aiAssistantEnabled: false,
  videoCallsEnabled: false,
  multiAiAgents: false,
  pinBoardEnabled: false,
  isActive: true,
};

const inputClass =
  "w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors";

const labelClass = "text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase";

const formatCycle = (days: number) => {
  if (days === 30) return "Monthly";
  if (days === 365) return "Yearly";
  return `${days} Days`;
};

const formatPrice = (plan: Plan) => {
  const symbol = plan.currency === "INR" ? "₹" : plan.currency === "USD" ? "$" : `${plan.currency} `;
  return `${symbol}${Number(plan.price).toFixed(2)}`;
};

const formatUnitLimit = (plan: Plan) => {
  if (plan.maxWorkspaces >= 9999) return "Unlimited";
  return String(plan.maxWorkspaces).padStart(2, "0") + " Units";
};

export const AdminPlanManagementPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const extractError = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      return err.response?.data?.error?.message || err.response?.data?.message || fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
  };

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await AdminService.getPlans();
      const data = response.data ?? [];
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      toast.error(extractError(err, "Failed to fetch plans"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await AdminService.createPlan({
        ...form,
        name: form.name.trim(),
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        maxWorkspaces: Number(form.maxWorkspaces),
        maxMembersPerWorkspace: Number(form.maxMembersPerWorkspace),
        messageRetentionDays: Number(form.messageRetentionDays),
      });
      toast.success("Plan initialized");
      setForm(emptyForm);
      await fetchPlans();
    } catch (err: unknown) {
      toast.error(extractError(err, "Failed to create plan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    const nextStatus = !plan.isActive;
    const result = await Swal.fire({
      title: nextStatus ? "Activate plan?" : "Archive plan?",
      text: `${plan.name} will be marked ${nextStatus ? "ACTIVE" : "ARCHIVED"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#30363d",
      confirmButtonText: nextStatus ? "Activate" : "Archive",
      background: "#161b22",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      await AdminService.togglePlanStatus(plan.id, nextStatus);
      toast.success(`Plan ${nextStatus ? "activated" : "archived"}`);
      await fetchPlans();
    } catch (err: unknown) {
      toast.error(extractError(err, "Failed to update plan status"));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          PLAN MANAGEMENT
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          {/* Inventory table */}
          <section className="border border-[#30363d] bg-[#0d1117]/80 rounded-sm overflow-hidden min-h-[420px]">
            <div className="px-5 py-4 border-b border-[#30363d]">
              <h2 className="text-xs font-bold tracking-[0.25em] text-white uppercase">
                Plan_Inventory_Database
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24 text-slate-500 gap-2 text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                Loading inventory...
              </div>
            ) : plans.length === 0 ? (
              <div className="py-24 text-center text-slate-500 text-sm tracking-wide">
                No plans in inventory. Initialize one on the right.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#30363d] text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                      <th className="px-5 py-4 font-bold">Plan Name</th>
                      <th className="px-5 py-4 font-bold">Price</th>
                      <th className="px-5 py-4 font-bold">Cycle</th>
                      <th className="px-5 py-4 font-bold">Unit Limit</th>
                      <th className="px-5 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-[#21262d] last:border-0 hover:bg-[#161b22]/60 transition-colors"
                      >
                        <td className="px-5 py-5 text-sm font-semibold text-white whitespace-nowrap">
                          {plan.name}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-300 whitespace-nowrap">
                          {formatPrice(plan)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-300 whitespace-nowrap">
                          {formatCycle(plan.durationDays)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-300 whitespace-nowrap">
                          {formatUnitLimit(plan)}
                        </td>
                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(plan)}
                            title="Click to toggle status"
                            className={`text-[10px] font-bold tracking-[0.15em] px-3 py-1.5 rounded-sm uppercase transition-colors ${
                              plan.isActive
                                ? "bg-amber-500 text-black hover:bg-amber-400"
                                : "border border-[#484f58] text-slate-400 hover:border-amber-500/50 hover:text-amber-500"
                            }`}
                          >
                            {plan.isActive ? "Active" : "Archived"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Configurator panel */}
          <aside className="border border-[#30363d] bg-[#161b22] rounded-sm p-5 xl:sticky xl:top-4">
            <h2 className="text-xs font-bold tracking-[0.25em] text-white uppercase mb-6">
              New_Plan_Configurator
            </h2>

            <form onSubmit={handleCreate} className="space-y-5">
              <label className="block space-y-2">
                <span className={labelClass}>Plan Identifier</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Professional"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className={labelClass}>Monthly Operating Cost ({form.currency})</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    {form.currency === "INR" ? "₹" : "$"}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className={`${inputClass} pl-8`}
                    required
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className={labelClass}>Billing Cycle</span>
                <div className="relative">
                  <select
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value={30}>Monthly (30 days)</option>
                    <option value={90}>Quarterly (90 days)</option>
                    <option value={365}>Yearly (365 days)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </label>

              <label className="block space-y-2">
                <span className={labelClass}>Retention (Days)</span>
                <div className="relative">
                  <select
                    value={form.messageRetentionDays}
                    onChange={(e) =>
                      setForm({ ...form, messageRetentionDays: Number(e.target.value) })
                    }
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>365 Days</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className={labelClass}>Workspace Units</span>
                  <input
                    type="number"
                    min={1}
                    value={form.maxWorkspaces}
                    onChange={(e) => setForm({ ...form, maxWorkspaces: Number(e.target.value) })}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className={labelClass}>Members Limit</span>
                  <input
                    type="number"
                    min={1}
                    value={form.maxMembersPerWorkspace}
                    onChange={(e) =>
                      setForm({ ...form, maxMembersPerWorkspace: Number(e.target.value) })
                    }
                    className={inputClass}
                    required
                  />
                </label>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className={`${labelClass} normal-case tracking-widest`}>AI Assistant Access</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.aiAssistantEnabled}
                  onClick={() =>
                    setForm({ ...form, aiAssistantEnabled: !form.aiAssistantEnabled })
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.aiAssistantEnabled ? "bg-amber-500" : "bg-[#30363d]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      form.aiAssistantEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className={`${labelClass} normal-case tracking-widest`}>Video Calls</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.videoCallsEnabled}
                  onClick={() =>
                    setForm({ ...form, videoCallsEnabled: !form.videoCallsEnabled })
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.videoCallsEnabled ? "bg-amber-500" : "bg-[#30363d]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      form.videoCallsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold tracking-[0.2em] text-xs uppercase py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Initialize Plan
              </button>

              <p className="text-[9px] text-slate-600 tracking-widest text-center uppercase leading-relaxed">
                Protocol requires admin signature for deployment.
              </p>
            </form>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
};
