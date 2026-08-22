import { useState } from 'react';
import { X, Search, Mail, Loader2, User, Send, CheckCircle2 } from 'lucide-react';
import { UserService } from '../../api/user/user.service';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import toast from 'react-hot-toast';
import { validateInviteEmail } from '../../validation';
import { HttpStatusCode } from '../../enums/HttpStatusCode';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
}

export const InviteMemberModal = ({ isOpen, onClose, workspaceId }: InviteMemberModalProps) => {
  const [emailQuery, setEmailQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const emailError = validateInviteEmail(emailQuery);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    setIsSearching(true);
    setSearchAttempted(true);
    setSearchResult(null);
    setUnregisteredEmail(null);
    setInviteSent(false);

    try {
      const response = await UserService.searchUserByEmail(emailQuery);
      if (response.success && response.data) {
        setSearchResult(response.data);
      } else {
        setUnregisteredEmail(emailQuery.trim().toLowerCase());
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; error?: { message?: string } };
        };
      };
      const apiMessage = err.response?.data?.message || err.response?.data?.error?.message || '';
      const looksLikeMissingUser =
        err.response?.status === HttpStatusCode.NOT_FOUND ||
        /not found|no user|does not exist/i.test(apiMessage);

      if (looksLikeMissingUser) {
        setUnregisteredEmail(emailQuery.trim().toLowerCase());
      } else {
        toast.error(apiMessage || 'Failed to search for user');
        setSearchResult(null);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendInvite = async (email: string) => {
    if (!workspaceId || !email) return;

    setIsSending(true);
    try {
      const response = await WorkspaceService.sendInviteEmail(workspaceId, email);
      setInviteSent(true);
      toast.success(response?.message || `Invitation sent to ${email}`);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmailQuery('');
    setSearchResult(null);
    setUnregisteredEmail(null);
    setSearchAttempted(false);
    setInviteSent(false);
    onClose();
  };

  const renderInviteActions = (email: string) => (
    inviteSent ? (
      <div className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-lg border border-emerald-200">
        <CheckCircle2 className="w-4 h-4" />
        Invitation Sent
      </div>
    ) : (
      <button
        onClick={() => handleSendInvite(email)}
        disabled={isSending}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {isSending ? 'Sending...' : 'Send Invitation Link'}
      </button>
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invite Member</h2>
            <p className="text-sm text-slate-500 mt-1">Search by email — registered or new users can be invited.</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">User Email Address</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={emailQuery}
                  onChange={(e) => setEmailQuery(e.target.value)}
                  placeholder="e.g., developer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !emailQuery.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center min-w-[100px]"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>

          <div className="min-h-[120px] flex flex-col justify-center">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center text-slate-400 py-4">
                <Search className="w-8 h-8 animate-pulse text-blue-300 mb-2" />
                <p className="text-sm">Searching directory...</p>
              </div>
            ) : searchResult ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                    {searchResult.profileImage ? (
                      <img src={searchResult.profileImage} alt={searchResult.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-lg">{searchResult.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{searchResult.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{searchResult.email}</p>
                  </div>
                </div>
                {renderInviteActions(searchResult.email)}
              </div>
            ) : unregisteredEmail ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-amber-100 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">No account yet</h3>
                    <p className="text-sm text-slate-600 mt-1 break-all">{unregisteredEmail}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      We’ll email an invite link. They can create an account and join this workspace from that link.
                    </p>
                  </div>
                </div>
                {renderInviteActions(unregisteredEmail)}
              </div>
            ) : searchAttempted ? (
              <div className="flex flex-col items-center justify-center text-slate-400 py-6 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
                <User className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Couldn’t look up that email</p>
                <p className="text-xs text-center mt-1 px-4">
                  Try again, or check the address and search once more.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 py-6">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-center">Search for an email to invite them to this workspace.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
