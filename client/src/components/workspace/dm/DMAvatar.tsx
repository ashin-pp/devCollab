interface DMAvatarProps {
  user?: { name?: string; profileImage?: string; id?: string };
  size?: 'sm' | 'md' | 'lg';
}

const getInitials = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const avatarColors = [
  'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-pink-500',
];

const getAvatarColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length];

export const DMAvatar = ({ user, size = 'md' }: DMAvatarProps) => {
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }[size];
  const color = getAvatarColor(user?.id || '0');
  
  return user?.profileImage ? (
    <img src={user.profileImage} alt={user.name} className={`${sizeClass} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${sizeClass} rounded-full ${color} text-white font-bold flex items-center justify-center shrink-0 select-none`}>
      {getInitials(user?.name)}
    </div>
  );
};
