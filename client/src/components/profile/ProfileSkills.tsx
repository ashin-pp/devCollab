import React, { useState } from 'react';
import { X } from 'lucide-react';
import { normalizeSkillToAdd } from '../../validation';

interface ProfileSkillsProps {
  skills: string[];
  onSkillsChange: (newSkills: string[]) => void;
}

export const ProfileSkills: React.FC<ProfileSkillsProps> = ({ skills, onSkillsChange }) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    const skill = normalizeSkillToAdd(newSkill, skills);
    if (skill) {
      onSkillsChange([...skills, skill]);
    }
    setNewSkill('');
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Skills</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map(skill => (
          <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-md border border-blue-100 flex items-center gap-1">
            {skill}
            <button onClick={() => removeSkill(skill)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleAddSkill}
          placeholder="Type and press Enter or click Add..."
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={addSkill}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-300 shadow-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
};
