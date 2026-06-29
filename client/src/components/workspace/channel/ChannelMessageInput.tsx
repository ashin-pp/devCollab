import { useRef } from 'react';
import { Smile, Bold, Italic, AtSign, BarChart2, Image as ImageIcon, X, Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface ChannelMessageInputProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
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
}

export const ChannelMessageInput = ({
  fileInputRef,
  handleFileSelect,
  isUploading,
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
  handleSendMessage
}: ChannelMessageInputProps) => {
  return (
    <div className="p-4 bg-white">
      <div className="border border-slate-300 rounded-2xl overflow-visible focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm bg-slate-50 relative">

        {/* AI Commands Bar - Minimal Pill Style */}
        <div className="px-4 pt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">AI</span>
          <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@task</button>
          <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@notify</button>
          <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@remind</button>
          <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@info</button>
          <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@schedule</button>
          <button className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">@summary</button>
        </div>

        <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="image/*" />
        
        {isUploading && (
          <div className="px-4 py-3 text-sm text-slate-500">Uploading image...</div>
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

        <div
          ref={textareaRef}
          contentEditable
          onInput={(e) => {
            handleTyping(e as any);
            setMessage(e.currentTarget.innerHTML);
            checkFormatting();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={checkFormatting}
          onMouseUp={checkFormatting}
          className="w-full resize-none px-4 py-3 min-h-[60px] max-h-[200px] text-[15px] focus:outline-none text-slate-800 bg-transparent overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          data-placeholder="Message #channel..."
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
            <button className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors" title="Mention"><AtSign className="w-4 h-4" /></button>
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
            disabled={(!message.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() && !attachedImageUrl) || isUploading}
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
