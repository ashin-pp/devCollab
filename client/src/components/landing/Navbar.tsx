import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 pt-4 transition-all duration-300">
      <nav 
        className={`flex items-center justify-between transition-all duration-500 ease-out bg-white/80 backdrop-blur-lg border border-slate-200/60 shadow-sm ${
          scrolled 
            ? 'w-[95%] max-w-7xl rounded-[2rem] px-8 py-3 mt-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)]' 
            : 'w-full max-w-full rounded-none px-8 py-4 mt-0 border-transparent shadow-none bg-transparent backdrop-blur-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">DevCollab</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/login" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Sign in</a>
          <a href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-blue-200">
            Start for free
          </a>
        </div>
      </nav>
    </div>
  );
};
