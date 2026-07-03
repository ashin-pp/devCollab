import { useState, useEffect } from 'react';
import { UserLayout } from "../../layouts/UserLayout";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Shield } from "lucide-react";
import { UserService } from '../../api/user/user.service';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

import { ProfileImageUpload } from '../../components/profile/ProfileImageUpload';
import { ProfileSkills } from '../../components/profile/ProfileSkills';
import { ProfileBasicInfoForm } from '../../components/profile/ProfileBasicInfoForm';
import { ProfileSocialLinks } from '../../components/profile/ProfileSocialLinks';
import { ProfilePasswordModal } from '../../components/profile/ProfilePasswordModal';
import { ProfileEmailModal } from '../../components/profile/ProfileEmailModal';

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

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

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
            <ProfileImageUpload 
              profileImage={formData.profileImage} 
              onImageUpdated={(url) => setFormData(prev => ({ ...prev, profileImage: url }))} 
            />
            <ProfileSkills 
              skills={formData.skills} 
              onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))} 
            />
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

            <ProfileBasicInfoForm 
              formData={formData} 
              onChange={handleInputChange} 
              onChangeEmailClick={() => setIsEmailModalOpen(true)} 
            />

            <ProfileSocialLinks 
              formData={formData} 
              onChange={handleInputChange} 
            />

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

      <ProfileEmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        currentEmail={formData.email} 
        onEmailChanged={(newEmail) => setFormData(prev => ({ ...prev, email: newEmail }))} 
      />
      
      <ProfilePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </UserLayout>
  );
};
