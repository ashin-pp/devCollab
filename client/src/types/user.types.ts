export interface UpdateProfileData {
    name?: string;
    bio?: string;
    skills?: string[];
    github?: string;
    linkedin?: string;
    twitter?: string;
    profileImage?: string;
    location?: string;
    email?: string;
    title?: string;
}

export interface ChangePasswordData {
    currentPassword?: string;
    newPassword?: string;
}

export interface UserProfile {
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
