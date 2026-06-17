import React, { useState } from 'react';
import { X, Hash, Lock } from 'lucide-react';
import { ChannelService } from '../../api/workspace/channel.service';
import type { CreateChannelModalProps } from '../../types/component.types';
import Swal from 'sweetalert2';

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, workspaceId, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            Swal.fire('Error', 'Channel Name is required', 'error');
            return;
        }

        const formattedName = name.toLowerCase().replace(/\s+/g, '-');

        setIsLoading(true);
        try {
            const data = {
                name: formattedName,
                description,
                privacy,
            };

            const response = await ChannelService.createChannel(workspaceId, data);
            
            Swal.fire('Success', 'Channel created successfully!', 'success');
            onSuccess(response.data.data);
            setName('');
            setDescription('');
            setPrivacy('public');
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire('Error', err.response?.data?.message || 'Failed to create channel', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Create a channel</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Channels are where your team communicates. They're best when organized around a topic — #marketing, for example.
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                    {/* Channel Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Name
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">#</span>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. bug-reports" 
                                className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Channel Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                            <span>Description <span className="text-slate-400 font-normal">(optional)</span></span>
                        </label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this channel about?" 
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Privacy Settings */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Visibility
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
                                <Hash className={`w-5 h-5 mt-0.5 ${privacy === 'public' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <div>
                                    <p className={`text-sm font-bold ${privacy === 'public' ? 'text-blue-900' : 'text-slate-700'}`}>Public</p>
                                    <p className={`text-[10px] ${privacy === 'public' ? 'text-blue-600' : 'text-slate-500'}`}>anyone in workspace</p>
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
                                    <p className={`text-[10px] ${privacy === 'private' ? 'text-blue-600' : 'text-slate-500'}`}>invited members only</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Footer / Buttons */}
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
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
