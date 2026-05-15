import { useAppStore } from './store/useAppStore';
import { ChatWindow } from './components/ChatWindow';
import { InputArea } from './components/InputArea';
import { TimelinePanel } from './components/TimelinePanel';
import { RadarChart } from './components/RadarChart';
import { ReportGenerator } from './components/ReportGenerator';
import { Bot, Sparkles, Target, Activity, Award, Volume2, VolumeX, Mic } from 'lucide-react';
import { useState } from 'react';
import { generateEvaluation } from './utils/api';

function App() {
  const messages = useAppStore((s) => s.messages);
  const timelineNodes = useAppStore((s) => s.timelineNodes);
  const radarData = useAppStore((s) => s.radarData);
  const persona = useAppStore((s) => s.persona);
  const setPersona = useAppStore((s) => s.setPersona);
  const isLoading = useAppStore((s) => s.isLoading);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [ttsVoice, setTtsVoice] = useState('xiaochun');
  const [showVoices, setShowVoices] = useState(false);
  if (typeof window !== 'undefined') { (window as any).__autoSpeak = autoSpeak; (window as any).__ttsVoice = ttsVoice; }

  const handleEvaluate = async () => {
    try {
      const r = await generateEvaluation(messages);
      setEvalResult(r);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800">
      {/* Left: Main Chat */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white border-x border-slate-100 shadow-xl">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-800 text-lg">苏格拉底式 AI 导师</h1>
              <p className="text-xs text-slate-400 font-medium">SOCRATIC LEARNING ENGINE</p>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setPersona('patient')}
              className={'px-4 py-1.5 text-sm font-medium rounded-lg transition-all ' + (persona === 'patient' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500')}
            >耐心模式</button>
            <button
              onClick={() => setPersona('humorous')}
              className={'px-4 py-1.5 text-sm font-medium rounded-lg transition-all ' + (persona === 'humorous' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500')}
            >幽默模式</button>
            <div className="relative">
              <button
                onClick={() => setShowVoices(!showVoices)}
                className={'ml-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ' + (autoSpeak ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600')}
              >
                <Mic className="w-3.5 h-3.5" />
                {ttsVoice === 'xiaochun' ? '小春' : ttsVoice === 'xiaoxia' ? '小夏' : ttsVoice === 'xiaoyue' ? '小月' : ttsVoice === 'laotie' ? '老铁' : '诚哥'}
              </button>
              {showVoices && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 min-w-[140px]">
                    <button
                      key="xiaochun"
                      onClick={() => { setTtsVoice('xiaochun'); setShowVoices(false); }}
                      className={'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ' + (ttsVoice === 'xiaochun' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <span>小春</span>
                      <span className="text-xs text-slate-400 ml-1">温柔女</span>
                    </button>
                    <button
                      key="xiaoxia"
                      onClick={() => { setTtsVoice('xiaoxia'); setShowVoices(false); }}
                      className={'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ' + (ttsVoice === 'xiaoxia' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <span>小夏</span>
                      <span className="text-xs text-slate-400 ml-1">活泼女</span>
                    </button>
                    <button
                      key="xiaoyue"
                      onClick={() => { setTtsVoice('xiaoyue'); setShowVoices(false); }}
                      className={'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ' + (ttsVoice === 'xiaoyue' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <span>小月</span>
                      <span className="text-xs text-slate-400 ml-1">知性女</span>
                    </button>
                    <button
                      key="laotie"
                      onClick={() => { setTtsVoice('laotie'); setShowVoices(false); }}
                      className={'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ' + (ttsVoice === 'laotie' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <span>老铁</span>
                      <span className="text-xs text-slate-400 ml-1">沉稳男</span>
                    </button>
                    <button
                      key="chengge"
                      onClick={() => { setTtsVoice('chengge'); setShowVoices(false); }}
                      className={'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ' + (ttsVoice === 'chengge' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <span>诚哥</span>
                      <span className="text-xs text-slate-400 ml-1">温暖男</span>
                    </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={'ml-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ' + (autoSpeak ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600')}
              title={autoSpeak ? '自动朗读已开启' : '开启自动朗读'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {autoSpeak ? '朗读中' : '朗读'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Sparkles className="w-12 h-12 text-slate-200" />
              <p className="text-lg font-medium text-slate-500">准备好开始今天的探索了吗？</p>
              <p className="text-sm">抛出一个你正在思考的问题吧。</p>
            </div>
          )}
          <ChatWindow />
        </div>

        <InputArea />
      </div>

      {/* Right: Analysis Panel */}
      <div className="w-96 bg-slate-50 border-l border-slate-200 flex flex-col p-6 overflow-y-auto">
        {messages.length > 0 && (
          <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <Target className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold">能力维度分析</h2>
              </div>
              <div className="h-56 w-full">
                <RadarChart data={radarData} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex-1">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h2 className="font-semibold">引导轨迹</h2>
              </div>
              <TimelinePanel nodes={timelineNodes} />
            </div>
          </>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <button
            onClick={handleEvaluate}
            disabled={messages.length < 2 || isLoading}
            className="w-full py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            <Award className="w-5 h-5" />
            生成阶段评估报告
          </button>

          {evalResult && (
            <div className="mt-6 space-y-4 text-sm">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-800 border border-emerald-100">
                <strong className="block mb-1 text-emerald-900">亮点优势</strong>
                {evalResult.strengths}
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-800 border border-amber-100">
                <strong className="block mb-1 text-amber-900">提升空间</strong>
                {evalResult.improvements}
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-800 border border-indigo-100">
                <strong className="block mb-1 text-indigo-900">综合评价</strong>
                {evalResult.overall}
              </div>
              <div className="pt-2">
                <ReportGenerator />
              </div>
            </div>
          )}
          {!evalResult && messages.length > 1 && (
            <div className="pt-3">
              <ReportGenerator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
