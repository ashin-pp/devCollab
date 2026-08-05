import { AdminLayout } from "../../layouts/AdminLayout";
import { ChevronDown, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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

type PlanFormState = {
  name: string;
  price: number | "";
  currency: string;
  durationDays: number;
  maxWorkspaces: number | "";
  maxMembersPerWorkspace: number | "";
  messageRetentionDays: number;
  aiAssistantEnabled: boolean;
  videoCallsEnabled: boolean;
  multiAiAgents: boolean;
  pinBoardEnabled: boolean;
  isActive: boolean;
};

const emptyForm: PlanFormState = {
  name: "",
  price: "",
  currency: "INR",
  durationDays: 30,
  maxWorkspaces: "",
  maxMembersPerWorkspace: "",
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

const CYCLE_PRESETS = [
  { days: 7, label: "Weekly (7 days)", short: "Weekly" },
  { days: 30, label: "Monthly (30 days)", short: "Monthly" },
  { days: 90, label: "Quarterly (90 days)", short: "Quarterly" },
  { days: 365, label: "Yearly (365 days)", short: "Yearly" },
] as const;

const isCyclePreset = (days: number) => CYCLE_PRESETS.some((p) => p.days === days);

const RETENTION_PRESETS = [
  { days: 7, label: "7 Days" },
  { days: 30, label: "30 Days" },
  { days: 90, label: "90 Days" },
  { days: 365, label: "365 Days" },
] as const;

const isRetentionPreset = (days: number) => RETENTION_PRESETS.some((p) => p.days === days);

const formatCycle = (days: number) => {
  const preset = CYCLE_PRESETS.find((p) => p.days === days);
  if (preset) return `${preset.short} · ${days}d`;
  return `Custom · ${days}d`;
};

const formatRetention = (days: number) => {
  if (isRetentionPreset(days)) return `${days}d keep`;
  return `Custom · ${days}d`;
};

const formatPrice = (plan: Plan) => {
  const symbol = plan.currency === "INR" ? "₹" : plan.currency === "USD" ? "$" : `${plan.currency} `;
  return `${symbol}${Number(plan.price).toFixed(2)}`;
};

const formatUnitLimit = (plan: Plan) => {
  if (plan.maxWorkspaces >= 9999) return "Unlimited";
  return String(plan.maxWorkspaces).padStart(2, "0") + " Units";
};

const formatMembersLimit = (plan: Plan) => {
  if (plan.maxMembersPerWorkspace >= 9999) return "Unlimited";
  return String(plan.maxMembersPerWorkspace);
};

const planToForm = (plan: Plan): PlanFormState => ({
  name: plan.name,
  price: plan.price,
  currency: plan.currency || "INR",
  durationDays: plan.durationDays,
  maxWorkspaces: plan.maxWorkspaces,
  maxMembersPerWorkspace: plan.maxMembersPerWorkspace,
  messageRetentionDays: plan.messageRetentionDays,
  aiAssistantEnabled: plan.aiAssistantEnabled,
  videoCallsEnabled: plan.videoCallsEnabled,
  multiAiAgents: plan.multiAiAgents,
  pinBoardEnabled: plan.pinBoardEnabled,
  isActive: plan.isActive,
});

const parseOptionalNumber = (value: string): number | "" => {
  if (value === "") return "";
  const next = Number(value);
  return Number.isNaN(next) ? "" : next;
};

type PlanFieldsProps = {
  form: PlanFormState;
  setForm: Dispatch<SetStateAction<PlanFormState>>;
};

const PlanFields = ({ form, setForm }: PlanFieldsProps) => {
  const cycleSelectValue = isCyclePreset(form.durationDays) ? String(form.durationDays) : "custom";

  return (
  <div className="space-y-5">
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
      <span className={labelClass}>Plan Price ({form.currency})</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
          {form.currency === "INR" ? "₹" : "$"}
        </span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseOptionalNumber(e.target.value) })}
          className={`${inputClass} pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          placeholder="e.g. 999"
          required
        />
      </div>
    </label>

    <div className="space-y-2">
      <span className={labelClass}>Billing Cycle / Expiry</span>
      <div className="relative">
        <select
          value={cycleSelectValue}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              setForm({
                ...form,
                durationDays: isCyclePreset(form.durationDays) ? 45 : form.durationDays,
              });
              return;
            }
            setForm({ ...form, durationDays: Number(value) });
          }}
          className={`${inputClass} appearance-none pr-10`}
        >
          {CYCLE_PRESETS.map((preset) => (
            <option key={preset.days} value={preset.days}>
              {preset.label}
            </option>
          ))}
          <option value="custom">Custom days…</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {cycleSelectValue === "custom" && (
        <label className="block space-y-2 pt-1">
          <span className="text-[10px] font-medium text-slate-500">
            Custom expiry (days after user selects the plan)
          </span>
          <input
            type="number"
            min={1}
            value={form.durationDays}
            onChange={(e) => {
              const next = Number(e.target.value);
              setForm({
                ...form,
                durationDays: Number.isFinite(next) && next >= 1 ? next : 1,
              });
            }}
            className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            placeholder="e.g. 45"
            required
          />
        </label>
      )}

      <p className="text-[10px] text-slate-600 leading-relaxed">
        Plan access expires this many days after selection
        {cycleSelectValue !== "custom"
          ? ` (${form.durationDays} days for this cycle).`
          : "."}
      </p>
    </div>

    <div className="space-y-2">
      <span className={labelClass}>Message Retention</span>
      <div className="relative">
        <select
          value={
            isRetentionPreset(form.messageRetentionDays)
              ? String(form.messageRetentionDays)
              : "custom"
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              setForm({
                ...form,
                messageRetentionDays: isRetentionPreset(form.messageRetentionDays)
                  ? 14
                  : form.messageRetentionDays,
              });
              return;
            }
            setForm({ ...form, messageRetentionDays: Number(value) });
          }}
          className={`${inputClass} appearance-none pr-10`}
        >
          {RETENTION_PRESETS.map((preset) => (
            <option key={preset.days} value={preset.days}>
              {preset.label}
            </option>
          ))}
          <option value="custom">Custom days…</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {!isRetentionPreset(form.messageRetentionDays) && (
        <label className="block space-y-2 pt-1">
          <span className="text-[10px] font-medium text-slate-500">
            Custom keep window (days)
          </span>
          <input
            type="number"
            min={1}
            value={form.messageRetentionDays}
            onChange={(e) => {
              const next = Number(e.target.value);
              setForm({
                ...form,
                messageRetentionDays: Number.isFinite(next) && next >= 1 ? next : 1,
              });
            }}
            className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            placeholder="e.g. 14"
            required
          />
        </label>
      )}

      <p className="text-[10px] text-slate-600 leading-relaxed">
        Channel and DM history older than this is hidden (kept in DB). Current window:{" "}
        {form.messageRetentionDays} days.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <label className="block space-y-2">
        <span className={labelClass}>Workspace Units</span>
        <input
          type="number"
          min={1}
          value={form.maxWorkspaces}
          onChange={(e) => setForm({ ...form, maxWorkspaces: parseOptionalNumber(e.target.value) })}
          className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          placeholder="e.g. 1"
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
            setForm({ ...form, maxMembersPerWorkspace: parseOptionalNumber(e.target.value) })
          }
          className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          placeholder="e.g. 5"
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
        onClick={() => setForm({ ...form, aiAssistantEnabled: !form.aiAssistantEnabled })}
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
        onClick={() => setForm({ ...form, videoCallsEnabled: !form.videoCallsEnabled })}
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
  </div>
  );
};

export const AdminPlanManagementPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState<PlanFormState>(emptyForm);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setEditForm(planToForm(plan));
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setEditingPlan(null);
    setEditForm(emptyForm);
  };

  const validateNumericFields = (state: PlanFormState): string | null => {
    if (state.price === "" || Number(state.price) < 0) {
      return "Enter a valid price (0 or more)";
    }
    if (state.maxWorkspaces === "" || Number(state.maxWorkspaces) < 1) {
      return "Workspace units must be at least 1";
    }
    if (state.maxMembersPerWorkspace === "" || Number(state.maxMembersPerWorkspace) < 1) {
      return "Members limit must be at least 1";
    }
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    const numericError = validateNumericFields(form);
    if (numericError) {
      toast.error(numericError);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    if (!editForm.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    const numericError = validateNumericFields(editForm);
    if (numericError) {
      toast.error(numericError);
      return;
    }

    setIsUpdating(true);
    try {
      await AdminService.updatePlan(editingPlan.id, {
        ...editForm,
        name: editForm.name.trim(),
        price: Number(editForm.price),
        durationDays: Number(editForm.durationDays),
        maxWorkspaces: Number(editForm.maxWorkspaces),
        maxMembersPerWorkspace: Number(editForm.maxMembersPerWorkspace),
        messageRetentionDays: Number(editForm.messageRetentionDays),
      });
      toast.success("Plan updated");
      setEditingPlan(null);
      setEditForm(emptyForm);
      await fetchPlans();
    } catch (err: unknown) {
      toast.error(extractError(err, "Failed to update plan"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    const result = await Swal.fire({
      title: "Delete plan?",
      text: `"${plan.name}" will be removed from new sign-ups. Current subscribers keep this plan until their period expires.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#30363d",
      confirmButtonText: "Delete plan",
      background: "#161b22",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      await AdminService.deletePlan(plan.id);
      toast.success("Plan deleted");
      await fetchPlans();
    } catch (err: unknown) {
      toast.error(extractError(err, "Failed to delete plan"));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          PLAN MANAGEMENT
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
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
                      <th className="px-5 py-4 font-bold">Retention</th>
                      <th className="px-5 py-4 font-bold">Unit Limit</th>
                      <th className="px-5 py-4 font-bold">Max Members</th>
                      <th className="px-5 py-4 font-bold">Actions</th>
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
                          {formatRetention(plan.messageRetentionDays)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-300 whitespace-nowrap">
                          {formatUnitLimit(plan)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-300 whitespace-nowrap">
                          {formatMembersLimit(plan)}
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(plan)}
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-sm border border-[#484f58] text-slate-300 hover:border-amber-500/60 hover:text-amber-400 transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            {!plan.name.toLowerCase().includes("starter") && (
                              <button
                                type="button"
                                onClick={() => handleDeletePlan(plan)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-sm border border-red-900/60 text-red-400 hover:border-red-500/70 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="border border-[#30363d] bg-[#161b22] rounded-sm p-5 xl:sticky xl:top-4">
            <h2 className="text-xs font-bold tracking-[0.25em] text-white uppercase mb-6">
              New_Plan_Configurator
            </h2>

            <form onSubmit={handleCreate} className="space-y-5">
              <PlanFields form={form} setForm={setForm} />

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

      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-plan-title"
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#30363d] bg-[#161b22] rounded-sm shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
              <div>
                <h2 id="edit-plan-title" className="text-xs font-bold tracking-[0.25em] text-white uppercase">
                  Edit_Plan
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">{editingPlan.name}</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="p-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-5 space-y-5">
              <PlanFields form={editForm} setForm={setEditForm} />

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                  className="px-4 py-2.5 text-xs font-bold tracking-[0.15em] uppercase border border-[#484f58] text-slate-300 hover:bg-[#0d1117] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold tracking-[0.15em] text-xs uppercase px-5 py-2.5 rounded-sm transition-colors"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
