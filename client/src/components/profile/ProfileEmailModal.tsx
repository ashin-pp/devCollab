import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService } from '../../api/user/user.service';
import { validateEmailChangeOtp, validateNewEmail } from '../../validation';

interface ProfileEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onEmailChanged: (newEmail: string) => void;
}

export const ProfileEmailModal: React.FC<ProfileEmailModalProps> = ({ isOpen, onClose, currentEmail, onEmailChanged }) => {
  const [emailModalStep, setEmailModalStep] = useState<'email' | 'otp'>('email');
  const [newEmailToChange, setNewEmailToChange] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  const closeEmailModal = () => {
    onClose();
    setEmailModalStep('email');
    setNewEmailToChange('');
    setEmailOtp('');
    setResendTimer(0);
  };

  const handleRequestEmailChange = async () => {
    const emailError = validateNewEmail(newEmailToChange, currentEmail);
    if (emailError) {
      toast.error(emailError);
      return;
    }
    setEmailChangeLoading(true);
    try {
      await UserService.requestEmailChange({ newEmail: newEmailToChange });
      toast.success("OTP sent to your old email address!");
      setEmailModalStep('otp');
      setResendTimer(60);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to request email change");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    const otpError = validateEmailChangeOtp(emailOtp);
    if (otpError) {
      toast.error(otpError);
      return;
    }
    setEmailChangeLoading(true);
    try {
      await UserService.verifyEmailChange({ newEmail: newEmailToChange, otp: emailOtp });
      toast.success("Email changed successfully!");
      onEmailChanged(newEmailToChange);
      closeEmailModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Change Email Address</h3>
          <button onClick={closeEmailModal} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {emailModalStep === 'email' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Email Address</label>
                <input
                  type="email"
                  value={newEmailToChange}
                  onChange={(e) => setNewEmailToChange(e.target.value)}
                  placeholder="e.g. new-email@example.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleRequestEmailChange}
                disabled={emailChangeLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {emailChangeLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send OTP to Current Email'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                <p className="text-xs text-slate-500 mb-3">An OTP was sent to your current email address.</p>
                <input
                  type="text"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-center tracking-widest text-lg font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  maxLength={4}
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleVerifyEmailChange}
                  disabled={emailChangeLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {emailChangeLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify & Change Email'}
                </button>

                <button
                  onClick={handleRequestEmailChange}
                  disabled={resendTimer > 0 || emailChangeLoading}
                  className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
