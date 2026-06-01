import { useState, useRef } from 'react';
import { Box, Hash, Sparkles, RefreshCw, ArrowLeft, Mail } from 'lucide-react';

export const OtpVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Panel - Dark Theme */}
      <div className="hidden lg:flex w-[45%] bg-[#0a0f1c] relative flex-col justify-between p-12 overflow-hidden text-white">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0a0f1c] to-[#0a0f1c] pointer-events-none"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DevCollab</span>
          </div>

          <h2 className="text-xl font-medium text-slate-400 mb-2">The workspace built for</h2>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] mb-12">
            Build the future<br />together
          </h1>

          {/* Features */}
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Structured technical discussions</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Deep dive into architecture and algorithms.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Integrated AI coding assistant</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Your 10x coding companion for rapid iteration.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 mb-1">Real-time synchronization</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Collaborative environments for global teams.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-16 bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm max-w-sm">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            "The most powerful developer ecosystem I've used in a decade."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sarah Jenkins</div>
              <div className="text-[10px] text-slate-400">CTO at NovaFlow</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - OTP Form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-8 sm:p-12 relative bg-white">
        
        {/* Form Container */}
        <div className="w-full max-w-[420px] text-center">
          
          {/* Icon */}
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Mail className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Verify your email</h2>
          <p className="text-sm text-slate-500 mb-10 leading-relaxed">
            We've sent a 6-digit code to your email. Enter it below to continue.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <div className="flex justify-center gap-2 sm:gap-4 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 border border-slate-300 rounded-xl text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="-"
                />
              ))}
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200 mb-6">
              Verify & Continue
            </button>
          </form>

          <div className="text-sm text-slate-500 font-medium mb-12">
            Didn't receive the code? <button className="text-blue-600 font-bold hover:text-blue-700 transition-colors ml-1">0:59 Resend</button>
          </div>

          <a href="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to register
          </a>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            &copy; 2024 DevCollab. Precision for developers.
          </p>
        </div>
      </div>
    </div>
  );
};
