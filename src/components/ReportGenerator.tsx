import { useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateEvaluation } from '../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function esc(s: any): string {
  if (!s || typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const FONT = '"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';

function buildReportHtml(
  date: string, question: string,
  messages: any[], timeline: any[],
  radar: any, evaluation: any
): string {
  const sec = (emoji: string, title: string) =>
    '<div style="margin:24px 0 12px 0;border-bottom:2px solid #2C3E50;padding-bottom:8px;"><span style="font-size:18px;">' + emoji + '</span> <strong style="font-size:18px;color:#2C3E50;">' + title + '</strong></div>';
  const card = (bg: string, content: string) =>
    '<div style="background:' + bg + ';border-radius:10px;padding:16px 20px;margin-bottom:12px;">' + content + '</div>';
  const tag = (text: string, color?: string) =>
    '<span style="color:' + (color || '#2C3E50') + ';font-weight:700;">' + text + '</span>';

  let conv = '';
  for (const m of messages) {
    const isUser = m.role === 'user';
    conv += '<div style="margin-bottom:12px;">' +
      '<div style="font-size:10px;color:' + (isUser ? '#D4A843' : '#2C3E50') + ';margin-bottom:3px;font-weight:600;">' + (isUser ? '学生' : '导师') + '</div>' +
      '<div style="display:inline-block;background:' + (isUser ? '#2C3E50' : '#f0f4f8') + ';color:' + (isUser ? '#fff' : '#333') + ';padding:10px 14px;border-radius:' + (isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px') + ';font-size:13px;line-height:1.7;max-width:90%">' + esc(m.content) + '</div></div>';
  }

  let flow = '<div style="display:flex;align-items:flex-start;overflow-x:auto;padding:8px 0;min-height:70px;">';
  const typeColors: Record<string, string> = { clarification: '#3B82F6', hint: '#F97316', reflection: '#10B981', challenge: '#8B5CF6' };
  const typeNames: Record<string, string> = { clarification: '澄清', hint: '提示', reflection: '反思', challenge: '挑战' };
  for (let i = 0; i < timeline.length; i++) {
    const t = timeline[i];
    const c = typeColors[t.type] || '#3B82F6';
    const tn = typeNames[t.type] || t.type;
    flow += '<div style="display:flex;flex-direction:column;align-items:center;min-width:110px;">' +
      '<div style="width:12px;height:12px;border-radius:50%;background:' + c + ';"></div><div style="width:2px;height:14px;background:#ddd;"></div>' +
      '<div style="padding:6px 8px;background:#fff;border:1px solid ' + c + ';border-radius:8px;text-align:center;max-width:120px;">' +
      '<div style="font-size:9px;color:' + c + ';font-weight:600;">' + tn + '</div>' +
      '<div style="font-size:10px;color:#555;line-height:1.3;">' + esc(t.fullLabel.slice(0, 36)) + '</div></div></div>';
    if (i < timeline.length - 1) {
      flow += '<div style="display:flex;align-items:center;padding:0 4px;"><div style="width:20px;height:2px;background:#ccc;"></div><div style="width:0;height:0;border-left:5px solid #ccc;border-top:4px solid transparent;border-bottom:4px solid transparent;"></div></div>';
    }
  }
  flow += '</div>';

  let kp = '';
  const kpLabels = ['审题分析', '知识运用', '逻辑推理', '验证反思'];
  for (const label of kpLabels) {
    const val = (radar && radar[label]) || 0;
    const pct = Math.round(val * 100);
    const barColor = val >= 0.7 ? '#10B981' : val >= 0.4 ? '#F59E0B' : '#EF4444';
    kp += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
      '<span style="width:64px;font-size:13px;font-weight:500;">' + label + '</span>' +
      '<div style="flex:1;height:10px;background:#eee;border-radius:5px;"><div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:5px;"></div></div>' +
      '<span style="width:36px;font-size:12px;font-weight:600;color:' + barColor + ';text-align:right;">' + pct + '%</span></div>';
  }

  const evalSec = (title: string, text: string, color?: string) =>
    '<div style="margin-bottom:14px;">' + tag(title, color || '#2C3E50') +
    '<p style="font-size:13px;color:#555;line-height:1.8;margin:4px 0 0 0;">' + esc(text) + '</p></div>';

  const safe = evaluation || {};

  return [
    '<div style="text-align:center;padding:30px 0 24px 0;">',
    '<div style="font-size:40px;margin-bottom:12px;">\ud83c\udf99\ufe0f</div>',
    '<h1 style="font-size:28px;color:#2C3E50;margin:0 0 6px 0;">' + '苏格拉底式学习报告' + '</h1>',
    '<p style="font-size:14px;color:#999;margin:0;">' + date + '</p>',
    '<div style="width:50px;height:3px;background:#D4A843;margin:14px auto 0 auto;border-radius:2px;"></div>',
    '</div>',
    sec('\ud83d\udcdd', '题目回顾'),
    card('#f0f4f8', '<p style="font-size:14px;line-height:1.8;margin:0;">' + esc(question) + '</p>'),
    sec('\ud83e\udde0', '思维演进'),
    card('#fafafa', flow),
    sec('\ud83d\udcca', '知识评估'),
    card('#f8fafc', kp),
    sec('\ud83d\udcac', '完整对话'),
    card('#fff', conv),
    sec('\ud83c\udfaf', '生成性评价'),
    card('#fef9e7',
      evalSec('\u2705 ' + '表现亮点', safe.strengths, '#10B981') +
      evalSec('\ud83d\udccc ' + '提升方向', safe.improvements, '#F59E0B') +
      evalSec('\ud83d\udcad ' + '综合评价', safe.overall) +
      evalSec('\ud83d\udca1 ' + '学习建议', safe.suggestions, '#8B5CF6')
    ),
    '<div style="text-align:center;margin-top:28px;padding:14px 0;border-top:1px solid #eee;">' +
    '<span style="font-size:11px;color:#bbb;">' + '苏格拉底式AI导师·启发思维，不给答案' + '</span></div>',
  ].join('');
}

export function ReportGenerator() {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const messages = useAppStore((s: any) => s.messages);
  const timelineNodes = useAppStore((s: any) => s.timelineNodes);
  const radarData = useAppStore((s: any) => s.radarData);

  const handleGenerate = async () => {
    setGenerating(true);
    setDone(false);
    try {
      const evaluation = await generateEvaluation(messages);
      const firstUserMsg = messages.find((m: any) => m.role === 'user');
      const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

      const el = document.createElement('div');
      el.style.cssText = 'width:794px;padding:40px 50px;background:#fff;font-family:' + FONT + ';color:#333;position:absolute;left:-9999px;top:0;';
      el.innerHTML = buildReportHtml(date, firstUserMsg?.content || '无', messages, timelineNodes, radarData, evaluation);
      document.body.appendChild(el);

      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      document.body.removeChild(el);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const iw = pw;
      const ih = (canvas.height * iw) / canvas.width;

      let left = ih, pos = 0, page = 1;
      pdf.addImage(imgData, 'PNG', 0, pos, iw, ih);
      left -= ph;
      while (left > 0) {
        pos = -ph * page;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, pos, iw, ih);
        left -= ph;
        page++;
      }

      pdf.save('报告_' + new Date().toISOString().slice(0, 10) + '.pdf');
      setDone(true);
    } catch (err: any) {
      console.error('Report error:', err);
      alert('生成报告失败: ' + (err.message || '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold text-wisdom rounded-xl font-semibold text-sm hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
    >
      {generating ? (
        <><Loader2 className="w-4 h-4 animate-spin" />{'生成报告中...'}</>
      ) : done ? (
        <><Download className="w-4 h-4" />{'再次生成报告'}</>
      ) : (
        <><FileText className="w-4 h-4" />{'生成报告 (PDF)'}</>
      )}
    </button>
  );
}
