import { useState, useRef } from 'react';
import { Send, Paperclip, Mic, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getSystemPrompt } from '../utils/systemPrompt';
import { sendToDeepSeek } from '../utils/api';
import { handleFileUpload } from '../utils/fileParser';
import { ChatMessage, AIResponse } from '../types';

let autoSpeak = false;


function cleanEmoji(t: string): string {
  return t.replace(/[🌀-🫿☀-➿⌀-⏿︀-️‍⃐-⃿]/gu, '').replace(/s+/g, ' ').trim();
}
function speakText(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.85;
  const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('zh'));
  const zh = voices.find(v => v.lang.startsWith('zh'));
  const prefer = voices.find(v => v.name.includes('Xiaoxiao') || v.name.includes('Yaoyao') || v.name.includes('Tingting'));
  u.voice = prefer || zh || voices[0];
  u.text = cleanEmoji(text);
  window.speechSynthesis.speak(u);
}

export function InputArea() {
  const [input, setInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    content: string; fileData: string; type: 'image' | 'file'; fileName: string;
  } | null>(null);
  const [fileError, setFileError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMessage = useAppStore((s) => s.addMessage);
  const popLastMessage = useAppStore((s) => s.popLastMessage);
  const addTimelineNode = useAppStore((s) => s.addTimelineNode);
  const updateRadar = useAppStore((s) => s.updateRadar);
  const setLoading = useAppStore((s) => s.setLoading);
  const isLoading = useAppStore((s) => s.isLoading);
  const persona = useAppStore((s) => s.persona);
  const messages = useAppStore((s) => s.messages);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !uploadedFile) return;
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text || (uploadedFile?.type === 'image' ? '[' + 'ͼƬ��Ŀ' + ']' : '[' + '�ļ�' + ': ' + (uploadedFile?.fileName || '') + ']'),
      type: uploadedFile?.type || 'text',
      fileData: uploadedFile?.fileData,
      fileName: uploadedFile?.fileName,
    };

    addMessage(userMsg);
    setInput('');
    setUploadedFile(null);
    setLoading(true);

    try {
      const systemPrompt = getSystemPrompt(persona);
      // Capture messages including the one just added
      const allMessages = [...messages, userMsg];
      const aiResponse: AIResponse = await sendToDeepSeek(allMessages, systemPrompt);

      const aiMsg: ChatMessage = {
        id: 'msg-' + Date.now() + '-ai',
        role: 'assistant',
        content: aiResponse.message,
        type: 'text',
        socraticType: aiResponse.socratic_type,
        rawAI: JSON.stringify(aiResponse),
      };

      addMessage(aiMsg);
      addTimelineNode(aiResponse.socratic_type, aiResponse.next_expectation);
      updateRadar(aiResponse.knowledge_points);

      if ((window as any).__autoSpeak) speakText(aiResponse.message);
    } catch (err: any) {
      popLastMessage();
      addMessage({
        id: 'msg-' + Date.now() + '-err',
        role: 'assistant',
        content: '❌ 出错了' + (err.message || ''),
        type: 'text',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError('');
    try {
      const result = await handleFileUpload(file);
      setUploadedFile({ ...result, fileName: file.name });
    } catch (err: any) {
      setFileError(err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { setIsListening(false); return; }
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    setIsListening(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100">
      {uploadedFile && (
        <div className="mb-3 flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2">
          {uploadedFile.type === 'image' ? (
            <img src={uploadedFile.fileData} alt="preview" className="w-10 h-10 object-cover rounded-xl" />
          ) : <span className="text-lg"></span>}
          <span className="text-xs text-slate-500 flex-1 truncate">{uploadedFile.fileName}</span>
          <button onClick={() => setUploadedFile(null)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
      )}
      {fileError && <div className="mb-2 text-xs text-red-500">{fileError}</div>}

      <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-3xl p-2 shadow-sm">
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept="image/*,.pdf,.docx,.txt" className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        <button
          onClick={toggleVoice}
          className={'p-2.5 rounded-2xl transition-colors ' + (isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50')}
        >
          <Mic className="w-5 h-5" />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的思考..."
          rows={1}
          className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 text-[15px] placeholder:text-slate-400"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (!input.trim() && !uploadedFile)}
          className="p-2.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-200"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
