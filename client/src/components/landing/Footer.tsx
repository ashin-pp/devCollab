export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-100 py-12 px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">DevCollab</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-left max-w-xs">
            The ultimate collaboration platform built by engineers, for engineers.
          </p>
        </div>

        <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Security</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Status</a>
        </div>

        <div className="text-xs font-medium text-slate-400">
          © {new Date().getFullYear()} DevCollab Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
