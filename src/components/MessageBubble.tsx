import { ChatMessage, SocraticType } from '../types';
import { Bot, User, Lightbulb, Search, Brain, Target, Volume2 } from 'lucide-react';;
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const typeConfig: Record<SocraticType, { icon: typeof Lightbulb; color: string; label: string; bg: string }> = {
  clarification: { icon: Search, color: 'text-blue-500', label: '澄清', bg: 'bg-blue-50 border-blue-100' },
  hint: { icon: Lightbulb, color: 'text-amber-500', label: '提示', bg: 'bg-amber-50 border-amber-100' },
  reflection: { icon: Brain, color: 'text-emerald-500', label: '反思', bg: 'bg-emerald-50 border-emerald-100' },
  challenge: { icon: Target, color: 'text-purple-500', label: '挑战', bg: 'bg-purple-50 border-purple-100' },
};

interface Props { message: ChatMessage; }

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  const cleanEmoji = (t: string) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{FE00}-\u{FE0F}\u{200D}\u{20D0}-\u{20FF}]/gu, '').replace(/\s+/g, ' ').trim();
  
  const speak = async (text: string) => {
    const cleaned = cleanEmoji(text);
    if (!cleaned) return;
    try {
      const voice = (window as any).__ttsVoice || 'xiaochun';
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned, voice })
      });
      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();
      const audio = new Audio('data:audio/mp3;base64,' + data.audio);
      await audio.play();
    } catch (e) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(cleaned);
        u.lang = 'zh-CN';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    }
  };

;

  if (isUser) {
    return (
      <div className="flex gap-4 justify-end">
        <div className="flex flex-col items-end gap-2">
          <div className="p-4 rounded-3xl rounded-tr-sm bg-slate-800 text-white text-[15px] leading-relaxed shadow-sm max-w-xl">
            {message.type === 'image' && message.fileData && (
              <img src={message.fileData} alt="upload" className="max-w-[200px] rounded-xl mb-2" />
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shadow-md flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  const socraticType = message.socraticType || 'clarification';
  const config = typeConfig[socraticType];
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="flex flex-col gap-2 max-w-2xl">
        {message.socraticType && (
          <div className={'text-[11px] px-2.5 py-1 rounded-full border font-semibold tracking-wide uppercase inline-flex items-center gap-1 w-fit ' + config.color + ' ' + config.bg}>
            <Icon className="w-3 h-3" />
            {config.label}
            <button onClick={() => speak(message.content)} className="ml-1 hover:opacity-70" title="朗读">
              <Volume2 className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="p-4 rounded-3xl rounded-tl-sm bg-white border border-slate-100 text-slate-700 text-[15px] leading-relaxed shadow-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
