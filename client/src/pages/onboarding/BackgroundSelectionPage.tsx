import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Box,
  Code2,
  Loader2,
  Palette,
  Ruler,
  Rocket,
  BarChart3,
  Settings2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { UserService } from '../../api/user/user.service';

const ROLES = [
  {
    id: 'Developer',
    title: 'Developer',
    description: 'Coding, debugging, and deployment workflows.',
    icon: Code2,
  },
  {
    id: 'Designer',
    title: 'Designer',
    description: 'Visual design, prototyping, and asset management.',
    icon: Palette,
  },
  {
    id: 'Product Manager',
    title: 'Product Manager',
    description: 'Strategy, roadmaps, and stakeholder alignment.',
    icon: Rocket,
  },
  {
    id: 'Architect',
    title: 'Architect',
    description: 'System design and infrastructure planning.',
    icon: Ruler,
  },
  {
    id: 'Data Scientist',
    title: 'Data Scientist',
    description: 'Analysis, model building, and visualization.',
    icon: BarChart3,
  },
  {
    id: 'DevOps',
    title: 'DevOps',
    description: 'CI/CD, automation, and cloud management.',
    icon: Settings2,
  },
  {
    id: 'Other',
    title: 'Other',
    description: 'Something else not yet shown.',
    icon: Box,
  },
] as const;

export const BackgroundSelectionPage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selected) {
      toast.error('Please select a role to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      await UserService.updateProfile({ title: selected });
      toast.success('Profile focus saved');
      navigate('/onboarding/plans');
    } catch (err: unknown) {
      let errMsg = 'Failed to save your role';
      if (isAxiosError(err)) {
        errMsg = err.response?.data?.error?.message || err.response?.data?.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-[Plus_Jakarta_Sans,sans-serif] flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DevCollab</span>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">Step 2 of 3</p>
          <div className="mt-1.5 w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-blue-600 rounded-full" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:py-12">
        <div className="max-w-2xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
            What&apos;s your focus?
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed">
            Select the role that best describes your daily work. We&apos;ll tailor your environment
            to the tools and workflows you use most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                className={`text-left rounded-2xl border p-5 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-md shadow-blue-100 ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{role.title}</h3>
                <p className="text-sm text-slate-500 leading-snug">{role.description}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting || !selected}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-blue-200"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Continue to Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-400">You can change these settings later in your profile.</p>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2024 DevCollab Infrastructure Inc.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
