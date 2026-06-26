import { ArrowRight, Star, User } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 px-8 flex flex-col items-center text-center overflow-hidden">
      {/* Background subtle gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
      
      {/* Badge */}
      <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-8 uppercase shadow-sm border border-blue-100">
        <Star className="w-3.5 h-3.5 fill-blue-600" />
        <span>DevCollab 2.0 is out</span>
      </div>

      {/* Main Content */}
      <h1 
        className="text-5xl md:text-[72px] font-[800] text-[#0B1C30] tracking-[-1.8px] max-w-4xl leading-[1.1] md:leading-[72px] mb-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Where Developers Meet <br className="hidden md:block" /> Innovation
      </h1>
      
      <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed font-medium">
        Unify your engineers with structured channels, direct messaging, live polls, and an AI coding assistant that lives directly inside your conversations.
      </p>

      {/* CTA Button */}
      <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200 mb-6 w-full sm:w-auto">
        Start for free
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
        Join 10,000+ teams already on DevCollab
      </p>

      {/* Animated Dashboard Mockup */}
      <div className="mt-20 relative w-full max-w-5xl mx-auto">
        {/* Glow effect behind the mockup */}
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full z-0"></div>
        
        {/* Main Application Window (Full Dashboard UI) */}
        <div className="relative z-10 w-full h-[600px] md:h-auto md:aspect-[16/10] bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200/80 flex flex-col overflow-hidden text-left">
          
          {/* Top Navbar */}
          <div className="hidden md:flex h-14 border-b border-slate-200 items-center justify-between px-4 bg-white shrink-0">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-600 tracking-tight">DevCollab</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium hover:bg-slate-50 px-2 py-1 rounded cursor-pointer border border-transparent hover:border-slate-200">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Workspaces
              </div>
            </div>
            {/* Center Search */}
            <div className="flex-1 max-w-xl px-4">
              <div className="relative flex items-center w-full h-9 rounded-md bg-slate-50 border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                <svg className="w-4 h-4 text-slate-400 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search development workspace..." className="w-full h-full bg-transparent pl-9 pr-4 text-sm outline-none text-slate-700 placeholder:text-slate-400" readOnly />
              </div>
            </div>
            {/* Right */}
            <div className="flex items-center gap-4 text-slate-500">
              <svg className="w-5 h-5 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <svg className="w-5 h-5 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <svg className="w-5 h-5 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Mobile Navbar Header */}
          <div className="md:hidden h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-blue-600 tracking-tight">DevCollab</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden bg-white">
            
            {/* Left Sidebar */}
            <div className="hidden lg:flex w-60 border-r border-slate-200 bg-slate-50 flex-col shrink-0">
              <div className="p-4 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">D</div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 leading-tight">DevCollab</div>
                    <div className="text-[11px] text-slate-500 font-medium">Enterprise Pro</div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* Channels Group */}
                <div>
                  <div className="flex justify-between items-center px-2 mb-2 group cursor-pointer">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Channels
                    </div>
                    <span className="text-slate-400 hover:text-slate-600">+</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-200/50 rounded-md text-sm font-medium cursor-pointer">
                      <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      My Channels
                    </div>
                    <div className="flex justify-between items-center px-2 py-1.5 bg-blue-100/50 text-blue-700 rounded-md text-sm font-semibold cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="opacity-60 font-normal">#</span> development
                      </div>
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="flex justify-between items-center px-2 py-1.5 text-slate-600 hover:bg-slate-200/50 rounded-md text-sm font-medium cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="opacity-40 font-normal">#</span> deployments
                      </div>
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">12</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-200/50 rounded-md text-sm font-medium cursor-pointer">
                      <span className="opacity-40 font-normal">#</span> code-reviews
                    </div>
                  </div>
                </div>

                {/* Other Nav Items */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center px-2 py-1.5 text-slate-600 hover:bg-slate-200/50 rounded-md text-sm font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      Direct Messages
                    </div>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1.5 text-slate-600 hover:bg-slate-200/50 rounded-md text-sm font-medium cursor-pointer">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Polls
                    </div>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-slate-600 hover:bg-slate-200/50 rounded-md text-sm font-medium cursor-pointer">
                    <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Members
                  </div>
                </div>
              </div>
              
              {/* Bottom Actions */}
              <div className="p-4 border-t border-slate-200/50 space-y-2 bg-slate-50">
                <button className="w-full bg-slate-500 hover:bg-slate-600 text-white text-sm font-medium py-2 rounded-md transition-colors shadow-sm">
                  Back to Dashboard
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition-colors shadow-sm">
                  Invite Members
                </button>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white min-w-0 border-r border-slate-200">
              
              {/* Chat Header */}
              <div className="h-20 border-b border-slate-200 px-6 py-4 flex flex-col justify-center shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      # development
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Central engineering and platform architecture discussions.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-white flex items-center justify-center text-[10px] font-bold text-blue-700">AL</div>
                      <div className="w-6 h-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] font-bold text-indigo-700">JD</div>
                      <div className="w-6 h-6 rounded-full bg-pink-100 border border-white flex items-center justify-center text-[10px] font-bold text-pink-700">SM</div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">+12</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Message 1 */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 mt-1">JD</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">Jordan Dale</span>
                      <span className="text-xs text-slate-400 font-medium">10:24 AM</span>
                    </div>
                    <div className="text-slate-700 text-[15px] leading-relaxed">
                      Hey team, I'm seeing some unusual latency in the authentication middleware. I've been tracing the <code className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-sm font-mono">auth-service/core</code> recently?
                    </div>
                  </div>
                </div>

                {/* Message 2 */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 mt-1">AL</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">Alex Lee</span>
                      <span className="text-xs text-slate-400 font-medium">10:26 AM</span>
                    </div>
                    <div className="text-slate-700 text-[15px] leading-relaxed mb-3">
                      I think I found the bottleneck in the validation loop. It looks like we're doing an unnecessary DB lookup inside the loop:
                    </div>
                    {/* Code Snippet */}
                    <div className="bg-[#282a36] rounded-lg overflow-hidden border border-slate-700 shadow-md max-w-3xl">
                      <div className="flex items-center justify-between px-4 py-2 bg-[#21222c] border-b border-slate-700/50">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">auth_middleware.go</span>
                        <span className="text-[10px] font-mono text-slate-400">GO</span>
                      </div>
                      <div className="p-4 font-mono text-[13px] leading-relaxed overflow-x-auto text-slate-300">
                        <div className="flex gap-4">
                          <span className="text-slate-500 select-none w-6 text-right">78</span>
                          <span><span className="text-pink-400">for</span> _, token := <span className="text-pink-400">range</span> tokens {'{'}</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <span className="text-slate-500 select-none w-6 text-right">79</span>
                          <span className="pl-4 text-emerald-400 italic">// This lookup should be outside the loop</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <span className="text-slate-500 select-none w-6 text-right">80</span>
                          <span className="pl-4">user, err := db.GetUser(token.UserID)</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <span className="text-slate-500 select-none w-6 text-right">81</span>
                          <span className="pl-4"><span className="text-pink-400">if</span> err != <span className="text-purple-400">nil</span> {'{'} <span className="text-pink-400">continue</span> {'}'}</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <span className="text-slate-500 select-none w-6 text-right">82</span>
                          <span className="pl-4">validate(token, user)</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                          <span className="text-slate-500 select-none w-6 text-right"></span>
                          <span>{'}'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message 3 */}
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0 mt-1">SM</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">Sarah Miller</span>
                      <span className="text-xs text-slate-400 font-medium">10:28 AM</span>
                    </div>
                    <div className="text-slate-700 text-[15px] leading-relaxed">
                      Oops! That was definitely intended for the staging debug build only. Reverting it immediately. Thanks for the catch, Copilot.
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="border border-slate-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all bg-white flex flex-col">
                  {/* AI Commands Bar */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-lg overflow-x-auto">
                    <span className="text-[10px] font-bold text-slate-400 mr-1 shrink-0">AI COMMANDS:</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer hover:bg-blue-200 shrink-0">@task</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 shrink-0">@notify</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 shrink-0">@remind</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 shrink-0">@info</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 shrink-0">@schedule</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 shrink-0">@summary</span>
                  </div>
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 text-slate-400">
                    <span className="font-serif font-bold text-sm cursor-pointer hover:text-slate-700">B</span>
                    <span className="font-serif italic text-sm cursor-pointer hover:text-slate-700">I</span>
                    <span className="font-mono font-bold text-sm cursor-pointer hover:text-slate-700">&lt;&gt;</span>
                    <svg className="w-4 h-4 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    <svg className="w-4 h-4 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </div>
                  {/* Textarea */}
                  <textarea 
                    className="w-full bg-transparent p-3 outline-none resize-none text-[15px] text-slate-700 placeholder:text-slate-400 min-h-[80px]" 
                    placeholder="Message #development (Use @task, @notify, @remind, @info, @schedule, @summary or type /fix for AI assistant)..."
                    readOnly
                  ></textarea>
                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3 text-slate-400">
                      <svg className="w-5 h-5 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <svg className="w-5 h-5 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <svg className="w-5 h-5 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors">
                      Send
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar (Thread) */}
            <div className="hidden xl:flex w-72 bg-white flex-col shrink-0 border-l border-slate-200">
              <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Thread</h3>
                  <p className="text-[11px] text-slate-500"># development</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Original Thread Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">JD</div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-[13px]">Jordan Dale</span>
                      <span className="text-[10px] text-slate-400 font-medium">10:24 AM</span>
                    </div>
                    <div className="text-slate-700 text-[13px] leading-relaxed">
                      Hey team, I'm seeing some unusual latency in the authentication middleware. Has anyone touched the <code className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-xs font-mono">auth-service/core</code> recently?
                    </div>
                  </div>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-start"><span className="bg-white pr-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">3 REPLIES</span></div>
                </div>

                {/* Replies */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">SM</div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-[13px]">Sarah Miller</span>
                        <span className="text-[10px] text-slate-400 font-medium">10:28 AM</span>
                      </div>
                      <div className="text-slate-700 text-[13px] leading-relaxed">
                        Checking the logs now. I see a few spikes in the staging environment as well.
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">AL</div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-[13px]">Alex Lee</span>
                        <span className="text-[10px] text-slate-400 font-medium">10:30 AM</span>
                      </div>
                      <div className="text-slate-700 text-[13px] leading-relaxed mb-2">
                        I might have found it. Is this the block you're talking about?
                      </div>
                      <div className="bg-[#282a36] rounded p-2 text-[10px] font-mono text-slate-300 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
                        <span className="text-slate-500">// middleware.go:84</span><br/>
                        <span className="text-pink-400">time.Sleep</span>(50 * ms)
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">JD</div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-[13px]">Jordan Dale</span>
                        <span className="text-[10px] text-slate-400 font-medium">10:32 AM</span>
                      </div>
                      <div className="text-slate-700 text-[13px] leading-relaxed">
                        Yes, exactly! That shouldn't be in prod.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thread Input */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                <div className="bg-white border border-slate-300 rounded-md p-2 shadow-sm focus-within:ring-1 focus-within:ring-blue-400">
                  <textarea 
                    className="w-full bg-transparent outline-none resize-none text-[13px] text-slate-700 placeholder:text-slate-400 h-16" 
                    placeholder="Reply to thread..."
                    readOnly
                  ></textarea>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-2 text-slate-400">
                      <svg className="w-4 h-4 cursor-pointer hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <svg className="w-4 h-4 cursor-pointer hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Widgets / Glassmorphism Cards */}
        
        {/* Floating Card 1: Direct Messaging */}
        <div className="hidden md:block absolute -left-12 bottom-24 z-20 bg-white/80 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] w-64 animate-[bounce_6s_infinite] shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Direct Messaging
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 relative">
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Jane Doe</div>
              <div className="text-xs text-slate-500 truncate w-36">I fixed the form issue, check it! 🔥</div>
            </div>
          </div>
        </div>

        {/* Floating Card 2: Active Poll */}
        <div className="hidden lg:block absolute -right-16 top-32 z-20 bg-white/90 backdrop-blur-xl border border-white p-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] w-72 animate-[bounce_7s_infinite_1s] shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📊</div>
            <div>
              <div className="text-sm font-bold text-slate-800">Active Poll</div>
              <div className="text-xs text-slate-500">Frontend Architecture</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>React</span>
                <span>64%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-[64%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Vue</span>
                <span>32%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-300 h-2 rounded-full w-[32%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
