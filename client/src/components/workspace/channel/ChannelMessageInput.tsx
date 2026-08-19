import { useState } from 'react';
import { Smile, Bold, Italic, AtSign, BarChart2, Image as ImageIcon, X, Send, Lock } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { ChannelMemberData } from '../../../types/channel.types';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

interface ChannelMessageInputProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  isProcessingAi?: boolean;
  attachedImageUrl: string | null;
  setAttachedImageUrl: (url: string | null) => void;
  textareaRef: React.RefObject<HTMLDivElement | null>;
  handleTyping: (e: any) => void;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  message: string;
  checkFormatting: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  isBoldActive: boolean;
  isItalicActive: boolean;
  handleFormat: (command: string) => void;
  setIsCreatePollModalOpen: (open: boolean) => void;
  handleSendMessage: () => void;
  channelMembers: ChannelMemberData[];
  onAiCommandClick?: (command: string) => void;
  aiAssistantEnabled?: boolean;
}

export const ChannelMessageInput = ({
  fileInputRef,
  handleFileSelect,
  isUploading,
  isProcessingAi,
  attachedImageUrl,
  setAttachedImageUrl,
  textareaRef,
  handleTyping,
  setMessage,
  message,
  checkFormatting,
  handleKeyDown,
  showEmojiPicker,
  setShowEmojiPicker,
  isBoldActive,
  isItalicActive,
  handleFormat,
  setIsCreatePollModalOpen,
  handleSendMessage,
  channelMembers,
  onAiCommandClick,
  aiAssistantEnabled = true,
}: ChannelMessageInputProps) => {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [aiCommandSearch, setAiCommandSearch] = useState<string | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  const promptAiUpgrade = () => {
    toast.error('AI Assistant is locked on this workspace plan. Upgrade to enable it.');
    navigate('/billing');
  };

  const handleAiChipClick = (command: string) => {
    if (!aiAssistantEnabled) {
      promptAiUpgrade();
      return;
    }
    onAiCommandClick?.(command);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    let html = e.currentTarget.innerHTML;

    // Clear stuck formatting (like bold) when the user deletes the content
    if (e.currentTarget.textContent === '') {
      if (html !== '') {
        e.currentTarget.innerHTML = '';
        html = '';
      }
      if (document.queryCommandState('bold')) document.execCommand('bold', false, undefined);
      if (document.queryCommandState('italic')) document.execCommand('italic', false, undefined);
    }
    
    // Find if the cursor is currently typing a mention
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCursorText = range.startContainer.textContent?.slice(0, range.startOffset) || '';
      const match = preCursorText.match(/@([a-zA-Z0-9_]*)$/);
      if (match) {
        setMentionSearch(match[1]);
        setAiCommandSearch(null);
      } else {
        const aiCommandMatch = preCursorText.match(/\/([a-zA-Z0-9_]*)$/);
        if (aiCommandMatch) {
          if (aiAssistantEnabled) {
            setAiCommandSearch(aiCommandMatch[1]);
            setMentionSearch(null);
          } else {
            setAiCommandSearch(null);
            setMentionSearch(null);
          }
        } else {
          setMentionSearch(null);
          setAiCommandSearch(null);
        }
      }
    }

    handleTyping(e as any);
    setMessage(html);
    checkFormatting();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const insertMention = (member: ChannelMemberData) => {
    if (!textareaRef.current || !member.user) return;
    
    textareaRef.current.focus();
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textContent = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const preCursorText = textContent.slice(0, offset);
        
        const match = preCursorText.match(/@([a-zA-Z0-9_]*)$/);
        
        if (match) {
          const matchLength = match[0].length;
          range.setStart(range.startContainer, offset - matchLength);
          range.deleteContents();
          
          const mentionEl = document.createElement('span');
          mentionEl.className = 'text-blue-600 font-semibold bg-blue-50 px-1 rounded-md';
          mentionEl.dataset.mentionId = member.userId;
          mentionEl.textContent = `@${member.user.name}`;
          mentionEl.contentEditable = 'false';
          
          const spaceEl = document.createTextNode('\u00A0');
          
          range.insertNode(spaceEl);
          range.insertNode(mentionEl);
          
          range.setStartAfter(spaceEl);
          range.setEndAfter(spaceEl);
          
          selection.removeAllRanges();
          selection.addRange(range);
          
          setMessage(textareaRef.current.innerHTML);
          setMentionSearch(null);
          return;
        }
      }
    }

    // Fallback if selection didn't match (e.g. lost focus)
    const html = textareaRef.current.innerHTML;
    const searchStr = mentionSearch ? `@${mentionSearch}` : '@';
    const lastIdx = html.lastIndexOf(searchStr);
    
    if (lastIdx !== -1) {
      const mentionHtml = `<span class="text-blue-600 font-semibold bg-blue-50 px-1 rounded-md" data-mention-id="${member.userId}" contenteditable="false">@${member.user.name}</span>&nbsp;`;
      const newHtml = html.substring(0, lastIdx) + mentionHtml + html.substring(lastIdx + searchStr.length);
      textareaRef.current.innerHTML = newHtml;
      setMessage(newHtml);
      setMentionSearch(null);
      
      const range = document.createRange();
      range.selectNodeContents(textareaRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const insertAiCommand = (command: string) => {
    if (!textareaRef.current) return;
    
    textareaRef.current.focus();
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textContent = range.startContainer.textContent || '';
        const offset = range.startOffset;
        const preCursorText = textContent.slice(0, offset);
        
        const match = preCursorText.match(/\/([a-zA-Z0-9_]*)$/);
        
        if (match) {
          const matchLength = match[0].length;
          range.setStart(range.startContainer, offset - matchLength);
          range.deleteContents();
          
          const textNode = document.createTextNode(`/${command} `);
          range.insertNode(textNode);
          
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          
          selection.removeAllRanges();
          selection.addRange(range);
          
          setMessage(textareaRef.current.innerHTML);
          setAiCommandSearch(null);
          return;
        }
      }
    }
  };

  const handleMentionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (textareaRef.current) {
      textareaRef.current.focus();
      const selection = window.getSelection();
      let range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      if (!range || !textareaRef.current.contains(range.commonAncestorContainer)) {
        range = document.createRange();
        range.selectNodeContents(textareaRef.current);
        range.collapse(false);
      }

      const textNode = document.createTextNode('@');
      range.insertNode(textNode);
      
      // Move cursor after the inserted '@'
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      const newHtml = textareaRef.current.innerHTML;
      setMessage(newHtml);
      setMentionSearch('');
    }
  };

  const filteredMembers = channelMembers?.filter(member => 
    member.userId !== currentUser?.id && member.user?.name?.toLowerCase().includes(mentionSearch?.toLowerCase() || '')
  ) || [];

  const AI_COMMANDS = [
    { id: 'task', label: 'Create Task', icon: '📝' },
    { id: 'notify', label: 'Notify User', icon: '🔔' },
    { id: 'remind', label: 'Set Reminder', icon: '⏰' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'summary', label: 'Summarize Chat', icon: '✨' },
  ];

  const filteredAiCommands = AI_COMMANDS.filter(cmd => 
    cmd.id.toLowerCase().includes(aiCommandSearch?.toLowerCase() || '')
  );

  return (
    <div className="p-4 bg-white">
      <div className="border border-slate-300 rounded-2xl overflow-visible focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm bg-slate-50 relative">

        {/* AI Commands Bar - Minimal Pill Style */}
        <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            AI
            {!aiAssistantEnabled && <Lock className="w-3 h-3 text-slate-400" />}
          </span>
          {(['/task', '/notify', '/remind', '/schedule', '/summary'] as const).map((cmd) => (
            <button
              key={cmd}
              type="button"
              title={aiAssistantEnabled ? `Insert ${cmd}` : 'AI locked — upgrade plan'}
              onClick={() => handleAiChipClick(cmd)}
              className={
                aiAssistantEnabled
                  ? 'text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm'
                  : 'text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full cursor-not-allowed flex items-center gap-1'
              }
            >
              {!aiAssistantEnabled && <Lock className="w-2.5 h-2.5" />}
              {cmd}
            </button>
          ))}
          {!aiAssistantEnabled && (
            <button
              type="button"
              onClick={promptAiUpgrade}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2 shrink-0"
            >
              Upgrade
            </button>
          )}
        </div>

        <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="image/*" />
        
        {isUploading && (
          <div className="px-4 py-3 text-sm text-slate-500">Uploading image...</div>
        )}
        
        {isProcessingAi && (
          <div className="px-4 py-3 text-sm text-blue-500 font-semibold flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            AI is processing your command...
          </div>
        )}

        {attachedImageUrl && (
          <div className="px-4 py-3 relative inline-block">
            <img src={attachedImageUrl} alt="Attachment preview" className="h-32 rounded-lg object-cover border border-slate-200" />
            <button
              onClick={() => setAttachedImageUrl(null)}
              className="absolute top-4 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* --- PREMIUM MENTION POPUP --- */}
        {mentionSearch !== null && (
          <div className="absolute bottom-full mb-3 left-4 w-72 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 transform origin-bottom-left transition-all duration-200 ease-out">
            
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                  <AtSign className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 tracking-wide">Mention User</span>
              </div>
              <button 
                onClick={() => setMentionSearch(null)} 
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* List */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member: ChannelMemberData) => member.user && (
                  <button
                    key={member.id}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(member); }}
                    className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-blue-50 focus:bg-blue-50 focus:outline-none group flex items-center gap-3 transition-all duration-200 border border-transparent hover:border-blue-100"
                  >
                    <div className="relative shrink-0">
                      {member.user.profileImage ? (
                          <img src={member.user.profileImage} alt={member.user.name} className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all" />
                      ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {member.user.name}
                        </span>
                        {member.role === 'admin' && (
                          <span className="text-[9px] uppercase tracking-wider font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-md">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 truncate block group-hover:text-blue-500/70 transition-colors">
                        {member.user.email}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-2">
                    <AtSign className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">No members found</span>
                  <span className="text-xs text-slate-400 mt-1">Try a different name</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* --- AI COMMAND POPUP --- */}
        {aiAssistantEnabled && aiCommandSearch !== null && (
          <div className="absolute bottom-full mb-3 left-4 w-72 bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden z-50 transform origin-bottom-left transition-all duration-200 ease-out">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/80 to-white border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600 flex items-center justify-center font-bold text-xs">
                  /
                </div>
                <span className="text-xs font-bold text-slate-700 tracking-wide">AI Commands</span>
              </div>
              <button 
                onClick={() => setAiCommandSearch(null)} 
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredAiCommands.length > 0 ? (
                filteredAiCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onMouseDown={(e) => { e.preventDefault(); insertAiCommand(cmd.id); }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none group flex items-center gap-3 transition-all duration-200 border border-transparent hover:border-indigo-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-sm shadow-sm ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                      {cmd.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-800 block group-hover:text-indigo-700 transition-colors">
                        /{cmd.id}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate group-hover:text-indigo-500/70 transition-colors">
                        {cmd.label}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm font-medium text-slate-500">No AI commands found</div>
              )}
            </div>
          </div>
        )}
        {/* ------------------- */}

        <div
          ref={textareaRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onKeyUp={checkFormatting}
          onMouseUp={checkFormatting}
          className="w-full resize-none px-4 py-3 min-h-[60px] max-h-[200px] text-[15px] focus:outline-none text-slate-800 bg-transparent overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          data-placeholder={
            aiAssistantEnabled
              ? 'Message #channel...'
              : 'Message #channel... (AI commands locked on this plan)'
          }
        />

        <div className="px-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl rounded-xl bg-white border border-slate-200 overflow-hidden">
                  <div className="flex justify-between items-center p-2 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Emojis</span>
                    <button onClick={() => setShowEmojiPicker(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setMessage(prev => prev + emojiData.emoji);
                      if (textareaRef.current) {
                        textareaRef.current.innerHTML += emojiData.emoji;
                      }
                      setShowEmojiPicker(false);
                    }}
                    width={320}
                    height={400}
                  />
                </div>
              )}
            </div>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} className={`p-1.5 rounded-lg transition-colors ${isBoldActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} title="Format Bold"><Bold className="w-4 h-4" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} className={`p-1.5 rounded-lg transition-colors ${isItalicActive ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} title="Format Italic"><Italic className="w-4 h-4" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={handleMentionClick} className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors" title="Mention"><AtSign className="w-4 h-4" /></button>
            <div className="w-px h-5 bg-slate-300 mx-1.5"></div>
            <button
              onClick={() => setIsCreatePollModalOpen(true)}
              className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"
              title="Create Poll"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors" title="Add Image"><ImageIcon className="w-4 h-4" /></button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={(!message.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() && !attachedImageUrl) || isUploading || isProcessingAi}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${message.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() || attachedImageUrl
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
