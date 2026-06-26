import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { 
  ArrowLeft, Mail, Calendar, Shield, User, MapPin, Phone, Globe, 
  MessageCircle, MoreHorizontal,
  Activity, Loader2, Code, Briefcase, ExternalLink
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/index';
import { WorkspaceService } from '../../api/workspace/workspace.service';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import type { MemberData } from '../../types/workspace.types';

export const MemberProfilePage = () => {
  const { workspaceId, userId } = useParams<{ workspaceId: string; userId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [member, setMember] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);

  useEffect(() => {
    if (workspaceId && userId) {
      fetchMemberProfile();
    }
  }, [workspaceId, userId]);

  const fetchMemberProfile = async () => {
    if (!workspaceId || !userId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch workspace members with full profile data
      const membersData = await WorkspaceService.getWorkspaceMembers(workspaceId, true);
      const allMembers = membersData.data || [];
      
      // Find the specific member
      const targetMember = allMembers.find((m: MemberData) => m.userId === userId);
      if (!targetMember) {
        toast.error('Member not found');
        navigate(`/workspace/${workspaceId}/members`);
        return;
      }

      // Map the social media fields from backend format to expected format
      if (targetMember.user) {
        const user = targetMember.user as any;
        
        // Map social media fields
        if (user.github && !targetMember.user.githubUrl) {
          targetMember.user.githubUrl = user.github.startsWith('http') ? user.github : `https://github.com/${user.github}`;
        }
        if (user.linkedin && !targetMember.user.linkedinUrl) {
          targetMember.user.linkedinUrl = user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`;
        }
        if (user.twitter && !targetMember.user.twitterUrl) {
          targetMember.user.twitterUrl = user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter}`;
        }
      }
      
      setMember(targetMember);
      
      // Check if current user is owner
      const currentMember = allMembers.find((m: MemberData) => m.userId === currentUser?.id);
      setIsCurrentUserOwner(currentMember?.role === 'owner');
      
    } catch (error) {
      console.error('Failed to fetch member profile', error);
      toast.error('Failed to load member profile');
      navigate(`/workspace/${workspaceId}/members`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!workspaceId || !userId || !member) return;
    
    try {
      const result = await Swal.fire({
        title: 'Remove Member?',
        text: `Are you sure you want to remove ${member.user?.name} from the workspace?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, Remove'
      });

      if (result.isConfirmed) {
        await WorkspaceService.removeMember(workspaceId, userId);
        toast.success('Member removed successfully');
        navigate(`/workspace/${workspaceId}/members`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleBlockMember = async (action: 'block' | 'unblock') => {
    if (!workspaceId || !userId || !member) return;
    
    try {
      const isBlocking = action === 'block';
      const result = await Swal.fire({
        title: isBlocking ? 'Block Member?' : 'Unblock Member?',
        text: `Are you sure you want to ${action} ${member.user?.name}?`,
        icon: isBlocking ? 'error' : 'question',
        showCancelButton: true,
        confirmButtonColor: isBlocking ? '#000000' : '#10b981',
        confirmButtonText: isBlocking ? 'Yes, Block' : 'Yes, Unblock'
      });

      if (result.isConfirmed) {
        if (isBlocking) {
          await WorkspaceService.blockMember(workspaceId, userId);
        } else {
          await WorkspaceService.unblockMember(workspaceId, userId);
        }
        toast.success(`Member ${action}ed successfully`);
        fetchMemberProfile(); // Refresh profile
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${action} member`);
    }
  };

  const handleStartDM = async () => {
    if (!workspaceId || !userId) return;
    try {
      const { DMService } = await import('../../api/dm/dm.service');
      const res = await DMService.startConversation(workspaceId, userId);
      const conversation = res.data?.data;
      navigate(`/workspace/${workspaceId}/dm/${conversation.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start conversation');
    }
  };

  if (isLoading) {
    return (
      <WorkspaceLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </WorkspaceLayout>
    );
  }

  if (!member) {
    return (
      <WorkspaceLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Member Not Found</h2>
            <p className="text-slate-500 mb-4">The requested member could not be found.</p>
            <button
              onClick={() => navigate(`/workspace/${workspaceId}/members`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Members
            </button>
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        
        {/* Header with cover */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Back button */}
          <button
            onClick={() => navigate(`/workspace/${workspaceId}/members`)}
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Members
          </button>

          {/* Admin actions */}
          {isCurrentUserOwner && member.role !== 'owner' && (
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <button
                onClick={() => handleBlockMember(member.status === 'blocked' ? 'unblock' : 'block')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  member.status === 'blocked'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                {member.status === 'blocked' ? 'Unblock' : 'Block'}
              </button>
              <button
                onClick={handleRemoveMember}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
          
          {/* Profile Image */}
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-xl overflow-hidden">
              {member.user?.profileImage ? (
                <img 
                  src={member.user.profileImage} 
                  alt={member.user?.name || 'User'} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-4xl">
                    {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="max-w-6xl mx-auto px-8 pb-8">
          
          {/* Basic Info */}
          <div className="pt-20 pb-8 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl font-bold text-slate-900">
                    {member.user?.name || 'Unknown User'}
                  </h1>
                  {member.role === 'owner' && (
                    <span className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 text-sm font-bold uppercase tracking-wider rounded-full border border-purple-200">
                      <Shield className="w-4 h-4" />
                      Workspace Owner
                    </span>
                  )}
                </div>

                {/* Title/Position */}
                {member.user?.title && (
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <Briefcase className="w-5 h-5" />
                    <span className="text-lg font-semibold">{member.user.title}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <span>{member.user?.email || 'No email provided'}</span>
                  </div>
                  
                  {member.joinedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>Joined {format(new Date(member.joinedAt), 'MMMM dd, yyyy')}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      member.status === 'blocked' 
                        ? 'bg-red-50 text-red-700' 
                        : member.status === 'pending'
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {member.status === 'blocked' ? 'Blocked' : member.status === 'pending' ? 'Pending' : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Bio - only show if user has actual bio */}
                {member.user?.bio && (
                  <p className="text-slate-700 text-lg leading-relaxed max-w-3xl mb-4">
                    {member.user.bio}
                  </p>
                )}

                {/* Social Links - Always show the section */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  {member.user?.githubUrl || (member.user as any)?.github ? (
                    <a
                      href={member.user.githubUrl || ((member.user as any).github?.startsWith('http') ? (member.user as any).github : `https://github.com/${(member.user as any).github}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      GitHub
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                      <ExternalLink className="w-4 h-4" />
                      GitHub - Not provided
                    </div>
                  )}
                  
                  {member.user?.linkedinUrl || (member.user as any)?.linkedin ? (
                    <a
                      href={member.user.linkedinUrl || ((member.user as any).linkedin?.startsWith('http') ? (member.user as any).linkedin : `https://linkedin.com/in/${(member.user as any).linkedin}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      LinkedIn
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                      <ExternalLink className="w-4 h-4" />
                      LinkedIn - Not provided
                    </div>
                  )}
                  
                  {member.user?.twitterUrl || (member.user as any)?.twitter ? (
                    <a
                      href={member.user.twitterUrl || ((member.user as any).twitter?.startsWith('http') ? (member.user as any).twitter : `https://twitter.com/${(member.user as any).twitter}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Twitter
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                      <ExternalLink className="w-4 h-4" />
                      Twitter - Not provided
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button onClick={handleStartDM} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  <MessageCircle className="w-5 h-5" />
                  Send Message
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold">
                  <MoreHorizontal className="w-5 h-5" />
                  More Actions
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            
            {/* Contact Information */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">Email Address</h3>
                      <p className="text-slate-600">{member.user?.email || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  {member.user?.location && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
                        <p className="text-slate-600">{member.user.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {member.user?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Phone Number</h3>
                        <p className="text-slate-600">{member.user.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {member.user?.website && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Website</h3>
                        <a 
                          href={member.user.website.startsWith('http') ? member.user.website : `https://${member.user.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {member.user.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* If no additional contact info */}
                {!member.user?.location && !member.user?.phone && !member.user?.website && (
                  <div className="text-center py-8 text-slate-500">
                    <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No additional contact information available.</p>
                  </div>
                )}
              </div>

              {/* Skills Section - Always show */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <Code className="w-6 h-6 text-blue-600" />
                  Skills & Expertise
                </h2>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  {(member.user?.skills && member.user.skills.length > 0) ? (
                    <div className="flex flex-wrap gap-3">
                      {member.user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100 hover:bg-blue-100 transition-colors cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>No skills added yet.</p>
                      <p className="text-slate-400 text-sm mt-1">This member hasn't listed their skills.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Workspace Activity */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-600" />
                Workspace Info
              </h2>
              
              <div className="space-y-4">
                
                {/* Member Status */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-4">Member Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Role</span>
                      <span className="font-semibold text-slate-900">
                        {member.role === 'owner' ? 'Workspace Owner' : 'Team Member'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Status</span>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        member.status === 'blocked' 
                          ? 'bg-red-50 text-red-700' 
                          : member.status === 'pending'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {member.status === 'blocked' ? 'Blocked' : member.status === 'pending' ? 'Pending' : 'Active'}
                      </span>
                    </div>
                    {member.joinedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Joined</span>
                        <span className="font-semibold text-slate-900">
                          {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </WorkspaceLayout>
  );
};