import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';
import { UserService } from '../../api/user/user.service';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

interface ProfileImageUploadProps {
  profileImage: string;
  onImageUpdated: (newImageUrl: string) => void;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ profileImage, onImageUpdated }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        onImageUpdated(response.data.profileImage);
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
    if (!profileImage) return;

    setIsUploadingImage(true);
    try {
      const response = await UserService.deleteProfileImage();
      if (response.success) {
        onImageUpdated('');
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4">Profile Image</h3>
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center mb-4 bg-slate-50">
        <div className="w-24 h-24 rounded-lg mb-4 shadow-sm border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative">
          {isUploadingImage && (
            <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center z-10">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
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
            disabled={isUploadingImage || !profileImage}
            className="flex-1 bg-white border border-slate-300 hover:border-red-500 text-red-600 font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 text-center">JPG, GIF or PNG. Max size of 5MB</p>
    </div>
  );
};
