import { Brain, Trash2, VolumeX, Volume2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PersonaRole } from '../types';
import { useState, useEffect, useCallback } from 'react';

let autoSpeakEnabled = false;

export function setAutoSpeak(v: boolean) { autoSpeakEnabled = v; }
export function getAutoSpeak() { return autoSpeakEnabled; }

export function speakText(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh')) || voices[0];
  if (zhVoice) utterance.voice = zhVoice;
  window.speechSynthesis.speak(utterance);
}

export function Header() {
  const persona = useAppStore((s) => s.persona);
  const setPersona = useAppStore((s) => s.setPersona);
  const clearAll = useAppStore((s) => s.clearAll);
  const messages = useAppStore((s) => s.messages);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak(v => {
      const newVal = !v;
      setAutoSpeak(newVal);
      return newVal;
    });
  }, []);

  useEffect(() => {
    autoSpeakEnabled = autoSpeak;
  }, [autoSpeak]);

  return (
    <header className="bg-wisdom text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <Brain className="w-7 h-7 text-gold" />
        <h1 className="text-xl font-bold tracking-wide">
          苏格拉底式<span className="text-gold">AI导师</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Auto-speak toggle */}
        <button
          onClick={toggleAutoSpeak}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all ${
            autoSpeak ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'
          }`}
          title={autoSpeak ? '自动朗读已开启' : '开启自动朗读'}
        >
          {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {autoSpeak ? '朗读中' : '朗读'}
        </button>

        {/* Persona selector */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-300">角色:</span>
          {(['patient', 'humorous'] as PersonaRole[]).map((p) => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                persona === p
                  ? 'bg-gold text-wisdom shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {p === 'patient' ? '🧘 耐心导师' : '😄 幽默导师'}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {messages.length > 0 && (
          <button
            onClick={() => { if (confirm('确定要清空所有对话吗？')) clearAll(); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        )}
      </div>
    </header>
  );
}
