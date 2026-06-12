import { useEffect, useState } from 'react';
import { UserLayout } from "../../layouts/UserLayout";
import { Link, useNavigate } from 'react-router-dom';
import { Edit2, Globe, User as UserIcon, MapPin } from "lucide-react";
import { UserService } from '../../api/user/user.service';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  twitter?: string;
  location?: string;
  title?: string;
}

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.2 5.2 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.2 5.2 0 0 0-.1 3.8A5.5 5.5 0 0 0 3 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await UserService.getProfile();
        if (response.success) {
          setProfile(response.data);
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
        {/* Active Plan Banner */}
        <div className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded border border-blue-100 uppercase tracking-wider mb-2">
          Your Active Plan &rarr; Professional
        </div>

        {/* Top Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex items-start justify-between shadow-sm">
          <div className="flex gap-8">
            <div className="w-32 h-32 rounded-2xl bg-blue-50 border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
               {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
               ) : (
                 <UserIcon className="w-16 h-16 text-blue-300" />
               )}
               <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="pt-2">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">{profile?.name || 'User'}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile?.title ? (
                  profile.title.split(',').map((t, index) => {
                    const trimmedTitle = t.trim();
                    return trimmedTitle ? (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-100">
                        {trimmedTitle}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-md border border-slate-200">Professional Title Not Set</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile?.skills && profile.skills.length > 0 ? (
                   profile.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{skill}</span>
                   ))
                ) : (
                  <>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">Add Skills</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Link 
            to="/profile/edit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General Information */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-[#f8fafc] px-6 py-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">General Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Display Name</label>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
                    {profile?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">Email Address</label>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
                    {profile?.email}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Location</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {profile?.location || 'Not specified'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Bio</label>
                <div className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm leading-relaxed min-h-[100px]">
                  {profile?.bio || 'No bio provided. Click Edit Profile to add one.'}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="bg-[#f8fafc] border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2 bg-white">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Professional Links</h2>
            </div>
            
            <div className="p-6 space-y-4 flex-1">
              <a 
                href={profile?.github || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="block bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0">
                    <GithubIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm">GitHub</h3>
                    <p className="text-xs text-slate-500 truncate">{profile?.github ? profile.github.replace('https://', '') : 'Not connected'}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </a>

              <a 
                href={profile?.twitter || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="block bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm">Portfolio</h3>
                    <p className="text-xs text-slate-500 truncate">{profile?.twitter ? profile.twitter.replace('https://', '') : 'Not connected'}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit2 className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </a>

              <a 
                href={profile?.linkedin || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="block bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0a66c2] text-white rounded-lg flex items-center justify-center shrink-0">
                    <LinkedinIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm">LinkedIn</h3>
                    <p className="text-xs text-slate-500 truncate">{profile?.linkedin ? profile.linkedin.replace('https://', '') : 'Not connected'}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        

      </div>
    </UserLayout>
  );
};
