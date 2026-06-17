import { useState, useEffect, useRef } from 'react';
import { UserLayout } from "../../layouts/UserLayout";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Link as LinkIcon, X, Shield, ArrowLeft } from "lucide-react";
import { UserService } from '../../api/user/user.service';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromWorkspace = location.state?.fromWorkspace;

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
    location: '',
    title: '',
    skills: [] as string[],
    profileImage: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [newSkill, setNewSkill] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await UserService.getProfile();
        if (response.success && response.data) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            bio: response.data.bio || '',
            github: response.data.github || '',
            linkedin: response.data.linkedin || '',
            twitter: response.data.twitter || '',
            location: response.data.location || '',
            title: response.data.title || '',
            skills: response.data.skills || [],
            profileImage: response.data.profileImage || ''
          });
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
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
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await UserService.uploadProfileImage(file);
      if (response.success && response.data) {
        setFormData(prev => ({ ...prev, profileImage: response.data.profileImage }));
        dispatch(updateUser({ profileImage: response.data.profileImage }));
        toast.success("Profile image updated successfully");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.profileImage) return;

    setIsUploadingImage(true);
    try {
      const response = await UserService.deleteProfileImage();
      if (response.success) {
        setFormData(prev => ({ ...prev, profileImage: '' }));
        dispatch(updateUser({ profileImage: '' }));
        toast.success("Profile image removed");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to remove image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmailToChange.trim() || newEmailToChange === formData.email) {
      toast.error("Please enter a valid new email address");
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
    if (!emailOtp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    setEmailChangeLoading(true);
    try {
      await UserService.verifyEmailChange({ newEmail: newEmailToChange, otp: emailOtp });
      toast.success("Email changed successfully!");
      setFormData(prev => ({ ...prev, email: newEmailToChange }));
      closeEmailModal();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailModalStep('email');
    setNewEmailToChange('');
    setEmailOtp('');
    setResendTimer(0);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    setIsChangingPassword(true);
    try {
      await UserService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await UserService.updateProfile({
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        location: formData.location,
        title: formData.title,
      });
      if (response.success) {
        dispatch(updateUser({ name: formData.name }));
        toast.success("Profile updated successfully");
        navigate('/profile', { state: { fromWorkspace } });
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">

        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Edit Profile</h1>
            <p className="text-slate-500 text-sm">Manage your public presence and professional details.</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/profile"
              state={{ fromWorkspace }}
              className="px-6 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="space-y-8 lg:col-span-1">

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Profile Image</h3>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center mb-4 bg-slate-50">
                <div className="w-24 h-24 rounded-lg mb-4 shadow-sm border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative">
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center z-10">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12" />
                  )}
                </div>
                <div className="flex gap-2 w-full">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex-1 bg-white border border-slate-300 hover:border-blue-500 text-blue-600 font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage || !formData.profileImage}
                    className="flex-1 bg-white border border-slate-300 hover:border-red-500 text-red-600 font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">JPG, GIF or PNG. Max size of 5MB</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map(skill => (
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
          </div>

          <div className="space-y-8 lg:col-span-2">

            <div className="bg-blue-600 rounded-xl p-6 text-white flex items-center gap-4 shadow-md">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{formData.name || 'Your Name'}</h2>
                {formData.title ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.title.split(',').map((t, index) => {
                      const trimmedTitle = t.trim();
                      return trimmedTitle ? (
                        <span key={index} className="px-2 py-0.5 bg-white/10 text-blue-50 text-xs font-medium rounded-md border border-white/20">
                          {trimmedTitle}
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-blue-100 text-sm mt-1">Professional Title Not Set</p>
                )}
              </div>
            </div>

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
                      onChange={handleInputChange}
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
                        onClick={() => setIsEmailModalOpen(true)}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    placeholder="e.g. MERN Stack Developer, DevOps Engineer"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-[#f8fafc] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">Security</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Password</h3>
                    <p className="text-xs text-slate-500">Update your password to keep your account secure.</p>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-300 shadow-sm"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {isEmailModalOpen && (
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
      )}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isChangingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
};
