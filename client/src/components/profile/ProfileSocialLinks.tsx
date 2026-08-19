import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

interface ProfileSocialLinksProps {
  formData: {
    github: string;
    linkedin: string;
    twitter: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileSocialLinks: React.FC<ProfileSocialLinksProps> = ({ formData, onChange }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-[#f8fafc] px-6 py-4 flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Professional Links</h2>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">GitHub</label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={onChange}
            placeholder="https://github.com/..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Portfolio</label>
          <input
            type="url"
            name="twitter"
            value={formData.twitter}
            onChange={onChange}
            placeholder="https://yourdomain.com"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={onChange}
            placeholder="https://linkedin.com/in/..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
