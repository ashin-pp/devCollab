import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, Icon }) => {
  return (
    <div className="bg-slate-50 rounded-3xl p-10 flex flex-col h-full border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
};
