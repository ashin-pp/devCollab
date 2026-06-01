import { Hash, BarChart2, MessageSquare, Users } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const Features = () => {
  const features = [
    {
      title: "Organized Channels",
      description: "Keep discussions focused. Create public spaces for company announcements or private rooms for sensitive projects with granular access control.",
      Icon: Hash
    },
    {
      title: "Live Polls",
      description: "Make decisions faster. Create polls in any channel and watch results update in real-time with visual analytics.",
      Icon: BarChart2
    },
    {
      title: "Direct Messaging",
      description: "Secure, private 1-on-1s and small group chats with rich media support and read receipts.",
      Icon: MessageSquare
    },
    {
      title: "Member Directory & Presence",
      description: "See who's online, manage roles, and control access with granular permissions across your entire workspace.",
      Icon: Users
    }
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Everything you need to collaborate
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          A powerful suite of tools designed specifically for engineering workflows, now faster and more intuitive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            title={feature.title}
            description={feature.description}
            Icon={feature.Icon}
          />
        ))}
      </div>
    </section>
  );
};
