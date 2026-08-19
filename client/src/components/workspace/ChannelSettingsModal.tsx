import { useState, useEffect } from 'react';
import { X, Settings, Trash2, Lock, Globe } from 'lucide-react';
import { ChannelService } from '../../api/workspace/channel.service';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import type { ChannelSettingsModalProps } from '../../types/component.types';
import { normalizeChannelName, validateChannelName } from '../../validation';

export const ChannelSettingsModal = ({ 
  isOpen, 
  onClose, 
  workspaceId, 
  channelId, 
  initialName, 
  initialDescription = '', 
  initialPrivacy = 'public',
  onChannelUpdated,
  onChannelDeleted
}: ChannelSettingsModalProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [privacy, setPrivacy] = useState<'public' | 'private'>(initialPrivacy);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription || '');
      setPrivacy(initialPrivacy || 'public');
    }
  }, [isOpen, initialName, initialDescription, initialPrivacy]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validateChannelName(name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    const formattedName = normalizeChannelName(name);

    setIsSubmitting(true);
    try {
      const res = await ChannelService.updateChannel(workspaceId, channelId, {
        name: formattedName,
        description,
        privacy,
      });
      if (res.data?.success || res.status === 200) {
        toast.success('Channel settings updated');
        onChannelUpdated();
        onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Channel?',
      html: `Are you absolutely sure you want to delete <strong>#${name}</strong>?<br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 rounded-xl font-semibold',
        cancelButton: 'px-4 py-2 rounded-xl font-semibold'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await ChannelService.deleteChannel(workspaceId, channelId);
      if (res.data?.success || res.status === 200) {
        toast.success('Channel deleted');
        onChannelDeleted();
        onClose();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete channel');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Channel Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="channel-settings-form" onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Channel Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">#</span>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What's this channel about?"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Privacy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${privacy === 'public' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <Globe className={`w-5 h-5 ${privacy === 'public' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-sm">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${privacy === 'private' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <Lock className={`w-5 h-5 ${privacy === 'private' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="font-semibold text-sm">Private</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
          <button 
            type="submit"
            form="channel-settings-form"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-10"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Save Changes'}
          </button>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Danger Zone</h3>
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || name === 'general'}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={name === 'general' ? "The general channel cannot be deleted" : ""}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete Channel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
