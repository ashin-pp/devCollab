export interface UserProfileResponseDto {
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
