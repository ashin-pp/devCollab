import { AdminLayout } from "../../layouts/AdminLayout";
import {
  BadgeCheck,
  Ban,
  CreditCard,
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
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

export const AdminPlanManagementPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
      const errMsg = extractError(err, "Failed to fetch plans");
      toast.error(errMsg);
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
      toast.success("Plan created");
      setForm(emptyForm);
      setShowForm(false);
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
      title: nextStatus ? "Activate plan?" : "Deactivate plan?",
      text: `${plan.name} will become ${nextStatus ? "visible" : "hidden"} for users.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: nextStatus ? "#10b981" : "#ef4444",
      cancelButtonColor: "#30363d",
      confirmButtonText: nextStatus ? "Activate" : "Deactivate",
      background: "#161b22",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    try {
      await AdminService.togglePlanStatus(plan.id, nextStatus);
      toast.success(`Plan ${nextStatus ? "activated" : "deactivated"}`);
      await fetchPlans();
    } catch (err: unknown) {
      toast.error(extractError(err, "Failed to update plan status"));
    }
  };

  const FeaturePill = ({ label, on }: { label: string; on: boolean }) => (
    <span
      className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${
        on
          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
          : "border-[#30363d] text-slate-500 bg-[#0d1117]"
      }`}
    >
      {label}
    </span>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-amber-500 uppercase mb-2">
              Billing // Catalog
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">PLAN MANAGEMENT</h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Create subscription tiers and control which plans users can purchase.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold tracking-widest text-xs px-5 py-3 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showForm ? "CLOSE FORM" : "NEW PLAN"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="border border-[#30363d] bg-[#161b22] rounded-lg p-6 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Pro"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Price</span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Currency</span>
                <input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Duration (days)</span>
                <input
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Max workspaces</span>
                <input
                  type="number"
                  min={1}
                  value={form.maxWorkspaces}
                  onChange={(e) => setForm({ ...form, maxWorkspaces: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Max members / workspace</span>
                <input
                  type="number"
                  min={1}
                  value={form.maxMembersPerWorkspace}
                  onChange={(e) => setForm({ ...form, maxMembersPerWorkspace: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Message retention (days)</span>
                <input
                  type="number"
                  min={1}
                  value={form.messageRetentionDays}
                  onChange={(e) => setForm({ ...form, messageRetentionDays: Number(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  ["aiAssistantEnabled", "AI Assistant"],
                  ["videoCallsEnabled", "Video Calls"],
                  ["multiAiAgents", "Multi AI Agents"],
                  ["pinBoardEnabled", "Pin Board"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 border border-[#30363d] rounded-md px-3 py-2 cursor-pointer hover:border-amber-500/40"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span className="text-xs font-bold tracking-wider text-slate-300">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold tracking-widest text-xs px-5 py-3 rounded-md"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                CREATE PLAN
              </button>
            </div>
          </form>
        )}

        <div className="border border-[#30363d] bg-[#161b22] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest text-white">ALL PLANS</h2>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">
              {plans.length} records
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              No plans yet. Create your first plan above.
            </div>
          ) : (
            <div className="divide-y divide-[#30363d]">
              {plans.map((plan) => (
                <div key={plan.id} className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest px-2 py-1 rounded ${
                          plan.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {plan.isActive ? <BadgeCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {plan.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="text-amber-500 font-bold tracking-wider">
                      {plan.currency} {plan.price} / {plan.durationDays} days
                    </p>
                    <p className="text-xs text-slate-500">
                      {plan.maxWorkspaces} workspaces · {plan.maxMembersPerWorkspace} members/workspace ·{" "}
                      {plan.messageRetentionDays}d message retention
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <FeaturePill label="AI" on={plan.aiAssistantEnabled} />
                      <FeaturePill label="VIDEO" on={plan.videoCallsEnabled} />
                      <FeaturePill label="MULTI_AI" on={plan.multiAiAgents} />
                      <FeaturePill label="PIN_BOARD" on={plan.pinBoardEnabled} />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(plan)}
                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-md border text-xs font-bold tracking-widest transition-colors ${
                      plan.isActive
                        ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                        : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    {plan.isActive ? (
                      <>
                        <ToggleLeft className="w-4 h-4" /> DEACTIVATE
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4" /> ACTIVATE
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
