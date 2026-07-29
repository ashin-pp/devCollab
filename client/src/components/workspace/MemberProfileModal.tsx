import { X, Mail, Calendar, Shield, User, MapPin, Phone, Globe, Briefcase, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { MemberData } from '../../types/workspace.types';
import { getMemberDisplayName, getMemberEmail } from '../../utils/member.utils';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberData | null;
}

export const MemberProfileModal = ({ isOpen, onClose, member }: MemberProfileModalProps) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header with cover and close button */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Profile Image */}
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg overflow-hidden">
              {member.user?.profileImage ? (
                <img 
                  src={member.user.profileImage} 
                  alt={member.user?.name || 'User'} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-2xl">
                    {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 pb-6 px-6">
          
          {/* Basic Info */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {getMemberDisplayName(member)}
              </h2>
              {member.role === 'owner' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full border border-purple-200">
                  <Shield className="w-3 h-3" />
                  Owner
                </span>
              )}
            </div>

            {/* Title/Position */}
            {member.user?.title && (
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <Briefcase className="w-4 h-4" />
                <span className="font-semibold">{member.user.title}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{getMemberEmail(member) || 'No email provided'}</span>
            </div>
            
            {member.joinedAt && (
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Joined {format(new Date(member.joinedAt), 'MMM dd, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
              member.status === 'blocked' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : member.status === 'pending'
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                member.status === 'blocked' 
                  ? 'bg-red-500' 
                  : member.status === 'pending'
                  ? 'bg-orange-500'
                  : 'bg-emerald-500'
              }`}></div>
              {member.status === 'blocked' ? 'Blocked' : member.status === 'pending' ? 'Pending' : 'Active Member'}
            </span>
          </div>

          {/* Additional Profile Details (if available) */}
          {(member.user?.bio || member.user?.location || member.user?.phone || member.user?.website || member.user?.skills?.length) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Details
              </h3>
              
              <div className="space-y-3">
                {member.user?.bio && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Bio</p>
                    <p className="text-slate-700 text-sm leading-relaxed">{member.user.bio}</p>
                  </div>
                )}
                
                {member.user?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Location</p>
                      <p className="text-slate-700 text-sm">{member.user.location}</p>
                    </div>
                  </div>
                )}
                
                {member.user?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Phone</p>
                      <p className="text-slate-700 text-sm">{member.user.phone}</p>
                    </div>
                  </div>
                )}
                
                {member.user?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Website</p>
                      <a 
                        href={member.user.website.startsWith('http') ? member.user.website : `https://${member.user.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        {member.user.website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(member.user?.githubUrl || member.user?.linkedinUrl || member.user?.twitterUrl) && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Social Links</p>
                    <div className="flex items-center gap-2">
                      {member.user?.githubUrl && (
                        <a
                          href={member.user.githubUrl.startsWith('http') ? member.user.githubUrl : `https://${member.user.githubUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                          title="GitHub"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {member.user?.linkedinUrl && (
                        <a
                          href={member.user.linkedinUrl.startsWith('http') ? member.user.linkedinUrl : `https://${member.user.linkedinUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          title="LinkedIn"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {member.user?.twitterUrl && (
                        <a
                          href={member.user.twitterUrl.startsWith('http') ? member.user.twitterUrl : `https://${member.user.twitterUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                          title="Twitter"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {member.user?.skills && member.user.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {member.user.skills.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.user.skills.length > 6 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                          +{member.user.skills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Workspace Role Info */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Workspace Role</h4>
            <div className="flex items-center gap-2">
              {member.role === 'owner' ? (
                <div className="flex items-center gap-2 text-purple-700">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Workspace Owner</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Team Member</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};