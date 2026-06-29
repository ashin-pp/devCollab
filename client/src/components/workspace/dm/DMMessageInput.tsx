import { useRef, useState, useEffect } from 'react';
import { Smile, Bold, Italic, Send, X, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface DMMessageInputProps {
  newMessage: string;
  onChangeMessage: (msg: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  attachedImageUrl?: string | null;
  isUploading?: boolean;
  onFileSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAttachment?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  otherUserName?: string;
}

export const DMMessageInput = ({
  newMessage,
  onChangeMessage,
  onSendMessage,
  attachedImageUrl,
  isUploading,
  onFileSelect,
  onClearAttachment,
  fileInputRef,
  otherUserName
}: DMMessageInputProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const textareaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newMessage === '' && textareaRef.current) {
      textareaRef.current.innerHTML = '';
    }
  }, [newMessage]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChangeMessage(e.currentTarget.innerHTML);
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false, undefined);
    if (textareaRef.current) {
      onChangeMessage(textareaRef.current.innerHTML);
      textareaRef.current.focus();
    }
    checkFormatting();
  };

  const checkFormatting = () => {
    setIsBoldActive(document.queryCommandState('bold'));
    setIsItalicActive(document.queryCommandState('italic'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-4 bg-white shrink-0 border-t border-slate-100">
      <form onSubmit={onSendMessage} className="border border-slate-300 rounded-2xl overflow-visible focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm bg-slate-50 relative">
        <input type="file" ref={fileInputRef} hidden onChange={onFileSelect} accept="image/*" />
        
        {isUploading && (
          <div className="px-4 py-3 text-sm text-slate-500">Uploading image...</div>
        )}

        {attachedImageUrl && (
          <div className="px-4 py-3 relative inline-block">
            <img src={attachedImageUrl} alt="Attachment preview" className="h-32 rounded-lg object-cover border border-slate-200" />
            <button
              type="button"
              onClick={onClearAttachment}
              className="absolute top-4 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div
          ref={textareaRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={checkFormatting}
          onMouseUp={checkFormatting}
          className="w-full resize-none px-4 py-3 min-h-[60px] max-h-[150px] text-[15px] focus:outline-none text-slate-800 bg-transparent overflow-y-auto cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          data-placeholder={`Message ${otherUserName || ''}...`}
        />

        <div className="px-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-0.5 relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'bg-blue-200 text-blue-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl rounded-xl bg-white border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center p-2 border-b border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Emojis</span>
                  <button type="button" onClick={() => setShowEmojiPicker(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    onChangeMessage(newMessage + emojiData.emoji);
                    if (textareaRef.current) {
                      textareaRef.current.innerHTML += emojiData.emoji;
                    }
                    setShowEmojiPicker(false);
                  }}
                  width={300}
                  height={350}
                />
              </div>
            )}

            <button type="button" onClick={() => fileInputRef?.current?.click()} className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors" title="Add Image"><ImageIcon className="w-4 h-4" /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('bold')} className={`p-1.5 rounded-lg transition-colors ${isBoldActive ? 'bg-blue-200 text-blue-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} title="Format Bold"><Bold className="w-4 h-4" /></button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFormat('italic')} className={`p-1.5 rounded-lg transition-colors ${isItalicActive ? 'bg-blue-200 text-blue-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`} title="Format Italic"><Italic className="w-4 h-4" /></button>
          </div>

          <button
            type="submit"
            disabled={(!newMessage.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() && !attachedImageUrl) || isUploading}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${newMessage.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() || attachedImageUrl ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400'} disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
