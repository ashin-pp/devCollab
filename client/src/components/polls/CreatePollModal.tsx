import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { pollApi } from '../../api/poll/poll.service';
import { addPoll } from '../../store/slices/pollSlice';
import toast from 'react-hot-toast';
import {
  getValidPollOptions,
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  validateCreatePoll,
} from '../../validation';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  channelId?: string;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ isOpen, onClose, workspaceId, channelId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiresAt, setExpiresAt] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < POLL_MAX_OPTIONS) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > POLL_MIN_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pollError = validateCreatePoll({ question, options, startsAt, expiresAt });
    if (pollError) {
      toast.error(pollError);
      return;
    }

    const validOptions = getValidPollOptions(options);

    try {
      setLoading(true);
      const poll = await pollApi.create({
        workspaceId,
        channelId,
        question: question.trim(),
        options: validOptions,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      
      dispatch(addPoll(poll));
      toast.success('Poll created successfully');
      setQuestion('');
      setOptions(['', '']);
      setStartsAt('');
      setExpiresAt('');
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string, response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200/60 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center justify-between p-6 border-b border-slate-100 relative z-10 bg-white/80 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Create {channelId ? 'Channel ' : ''}Poll
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Ask a question and gather feedback</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800 mb-1">
              Options
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400"
                  />
                  {options.length > POLL_MIN_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < POLL_MAX_OPTIONS && (
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors mt-2"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add another option
              </button>
            )}
          </div>

          <div className={`grid gap-4 ${!channelId ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {!channelId && (
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Start Time <span className="text-slate-400 font-medium">(Optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={startsAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900 transition-all outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Expiry Time <span className="text-slate-400 font-medium">(Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                min={startsAt || new Date().toISOString().slice(0, 16)}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900 transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
