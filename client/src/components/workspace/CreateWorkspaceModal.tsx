import React, { useEffect, useState } from 'react';
import { X, Upload, Globe, Lock } from 'lucide-react';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import type { CreateWorkspaceData } from '../../types/workspace.types';
import type { CreateWorkspaceModalProps } from '../../types/component.types';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { validateWorkspaceName, validateWorkspaceTeamSize, validateWorkspaceIconFile, WORKSPACE_NAME_MAX } from '../../validation';
import { resolveUserPlan } from '../../utils/plan-limits.utils';

const isWorkspaceLimitError = (message: string) =>
    /workspace limit/i.test(message) || /WORKSPACE_PLAN_LIMIT_REACHED/i.test(message);

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    existingWorkspaceNames = [],
    onLimitReached,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [teamSize, setTeamSize] = useState('');
    const [planMemberLimit, setPlanMemberLimit] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const [teamSizeError, setTeamSizeError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setDescription('');
            setLogo('');
            setPrivacy('public');
            setTeamSize('');
            setNameError(null);
            setTeamSizeError(null);
            setIsLoading(false);
            setPlanMemberLimit(null);
            return;
        }

        let cancelled = false;
        (async () => {
            const plan = await resolveUserPlan();
            if (!cancelled) {
                setPlanMemberLimit(plan?.maxMembersPerWorkspace ?? null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNameChange = (value: string) => {
        setName(value);
        setNameError(validateWorkspaceName(value, existingWorkspaceNames));
    };

    const handleTeamSizeChange = (value: string) => {
        setTeamSize(value);
        setTeamSizeError(
            validateWorkspaceTeamSize(value, {
                maxAllowed: planMemberLimit ?? undefined,
            })
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateWorkspaceName(name, existingWorkspaceNames);
        if (validationError) {
            setNameError(validationError);
            return;
        }

        const sizeError = validateWorkspaceTeamSize(teamSize, {
            maxAllowed: planMemberLimit ?? undefined,
        });
        if (sizeError) {
            setTeamSizeError(sizeError);
            toast.error(sizeError);
            return;
        }

        setIsLoading(true);
        try {
            const data: CreateWorkspaceData = {
                name: name.trim(),
                description: description.trim(),
                logo,
                privacy,
            };

            if (teamSize.trim()) {
                data.maxMembers = parseInt(teamSize, 10);
            }

            const response = await WorkspaceService.createWorkspace(data);

            Swal.fire('Success', 'Workspace created successfully!', 'success');
            onSuccess(response.data);
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; error?: { message?: string; code?: string } } } };
            const message =
                err.response?.data?.message ||
                err.response?.data?.error?.message ||
                'Failed to create workspace';
            const errorCode = err.response?.data?.error?.code || '';

            if (isWorkspaceLimitError(message) || errorCode === 'WORKSPACE_PLAN_LIMIT_REACHED') {
                onClose();
                onLimitReached?.();
                return;
            }

            if (/already exists/i.test(message) || /name/i.test(message)) {
                setNameError(message);
            }
            if (/member/i.test(message) && /plan|limit|exceed/i.test(message)) {
                setTeamSizeError(message);
            }
            Swal.fire('Error', message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileError = validateWorkspaceIconFile(file);
        if (fileError) {
            if (fileError.includes('image')) {
                Swal.fire('Error', fileError, 'error');
            } else {
                toast.error(fileError);
            }
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogo(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Create New Workspace</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Set up a dedicated environment for your team's high-performance engineering workflow.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto" noValidate>
                    <div className="flex items-center gap-4">
                        <label className="relative w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-colors overflow-hidden">
                            {logo ? (
                                <img src={logo} alt="Logo preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 mb-1" />
                                    <span className="text-[9px] font-bold tracking-wider uppercase">Upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                            />
                        </label>
                        <div>
                            <p className="text-sm font-bold text-slate-900 mb-0.5">Workspace Icon</p>
                            <p className="text-xs text-slate-500">Recommended: 256x256px, Max file size: 2MB.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Workspace Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            maxLength={WORKSPACE_NAME_MAX}
                            placeholder="e.g. Engineering Squad Alpha"
                            aria-invalid={!!nameError}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                nameError
                                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        />
                        {nameError ? (
                            <p className="mt-1.5 text-xs font-medium text-rose-600">{nameError}</p>
                        ) : (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                                {name.trim().length}/{WORKSPACE_NAME_MAX} · Must be unique
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe the purpose of this workspace..."
                            rows={3}
                            maxLength={500}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Privacy Settings
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPrivacy('public')}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                                    privacy === 'public'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <Globe className={`w-5 h-5 mt-0.5 ${privacy === 'public' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <div>
                                    <p className={`text-sm font-bold ${privacy === 'public' ? 'text-blue-900' : 'text-slate-700'}`}>Public</p>
                                    <p className={`text-[10px] ${privacy === 'public' ? 'text-blue-600' : 'text-slate-500'}`}>visible to all on search</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPrivacy('private')}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                                    privacy === 'private'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                                <Lock className={`w-5 h-5 mt-0.5 ${privacy === 'private' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <div>
                                    <p className={`text-sm font-bold ${privacy === 'private' ? 'text-blue-900' : 'text-slate-700'}`}>Private</p>
                                    <p className={`text-[10px] ${privacy === 'private' ? 'text-blue-600' : 'text-slate-500'}`}>invite-only access</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Team Size
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={planMemberLimit ?? undefined}
                            value={teamSize}
                            onChange={(e) => handleTeamSizeChange(e.target.value)}
                            placeholder={
                                planMemberLimit
                                    ? `Max ${planMemberLimit} on your plan`
                                    : 'e.g. 15'
                            }
                            aria-invalid={!!teamSizeError}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                teamSizeError
                                    ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                        />
                        {teamSizeError ? (
                            <p className="mt-1.5 text-xs font-medium text-rose-600">{teamSizeError}</p>
                        ) : planMemberLimit ? (
                            <p className="mt-1.5 text-[11px] text-slate-400">
                                Your plan allows up to {planMemberLimit} members per workspace
                                {teamSize.trim() ? '' : '. Leave empty to use the plan max.'}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !!nameError || !!teamSizeError || !name.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Workspace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
