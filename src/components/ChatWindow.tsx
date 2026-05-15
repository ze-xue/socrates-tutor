import { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';

export function ChatWindow() {
  const messages = useAppStore((s) => s.messages);
  const isLoading = useAppStore((s) => s.isLoading);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          </div>
          <div className="flex items-center gap-1.5 px-4 py-3 rounded-3xl bg-white border border-slate-100">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
