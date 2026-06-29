import React from 'react';
import { User } from 'lucide-react';

interface ProfileBasicInfoFormProps {
  formData: {
    name: string;
    email: string;
    location: string;
    title: string;
    bio: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onChangeEmailClick: () => void;
}

export const ProfileBasicInfoForm: React.FC<ProfileBasicInfoFormProps> = ({ formData, onChange, onChangeEmailClick }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-[#f8fafc] px-6 py-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">General Information</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Display Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                disabled
                className="flex-1 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
              />
              <button
                onClick={onChangeEmailClick}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-300 shadow-sm"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onChange}
            placeholder="e.g. San Francisco, CA"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Professional Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="e.g. MERN Stack Developer, DevOps Engineer"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={onChange}
            rows={4}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );
};
