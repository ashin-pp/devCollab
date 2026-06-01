import { useState, useRef } from 'react';
import { ShieldAlert, Terminal, AlertTriangle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

export const AdminVerifyOtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center font-mono relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBWMGgtMXYzOWgtMzl2MXoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz4KPC9zdmc+')] pointer-events-none"></div>

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-amber-500" />
        <span className="text-amber-500 font-bold tracking-widest text-sm">DEVCOLLAB // ADMIN</span>
      </div>

      {/* Top Right */}
      <div className="absolute top-6 right-6">
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs font-bold tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" />
          SYSTEM RECOVERY
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl shadow-black/50 relative z-10 overflow-hidden">
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-amber-500"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wider mb-1 uppercase">IDENTITY_VERIFY</h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Awaiting Authorization Code</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center text-amber-500">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>

          <p className="text-sm text-slate-400 font-sans mb-8">
            Enter the 6-digit secure code transmitted to <strong className="text-slate-200">admin@devcollab.com</strong>.
          </p>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 md:w-12 md:h-14 bg-[#010409] border border-[#30363d] rounded text-center text-lg font-bold text-amber-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner font-sans"
                  placeholder="-"
                />
              ))}
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded font-bold text-sm tracking-widest transition-colors mt-6 uppercase">
              VERIFY_CODE
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-8 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            NO CODE RECEIVED? <button className="text-amber-500 hover:text-amber-400 ml-1 transition-colors flex items-center justify-center gap-1 mx-auto mt-2"><RefreshCw className="w-3 h-3" /> RE-TRANSMIT (0:59)</button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#010409] border-t border-[#30363d] p-3 px-8 flex items-center justify-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
          SECURE CONNECTION ESTABLISHED
        </div>
      </div>
    </div>
  );
};
