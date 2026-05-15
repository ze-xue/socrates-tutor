import axios from 'axios';
import { ChatMessage, AIResponse } from '../types';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';

function extractJson(raw: any): string {
  if (!raw || typeof raw !== 'string') return '';
  const s = raw.trim();
  const match = s.match(/\{[\s\S]*\}/);
  if (match) {
    let json = match[0];
    json = json.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return json.trim();
  }
  return s;
}

function fixLatexEscapes(text: string): string {
  return text
    .replace(/\t([a-zA-Z])/g, "\\t$1")
    .replace(/\x08([a-zA-Z])/g, "\\b$1")
    .replace(/\x0c([a-zA-Z])/g, "\\f$1");
}

export async function sendToDeepSeek(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<AIResponse> {
  const apiMessages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of messages) {
    if (msg.role === 'user' && msg.type === 'image' && msg.fileData) {
      const contentArray: any[] = [];
      if (msg.content) {
        contentArray.push({ type: 'text', text: msg.content });
      }
      contentArray.push({
        type: 'image_url',
        image_url: { url: msg.fileData }
      });
      apiMessages.push({ role: 'user', content: contentArray });
    } else if (msg.role === 'user' && msg.type === 'file' && msg.fileData) {
      const fc = '[文件: ' + msg.fileName + ']\n' + (msg.content || '') + '\n\n文件内容：\n' + msg.fileData;
      apiMessages.push({ role: 'user', content: fc });
    } else if (msg.role === 'user' && msg.type === 'file' && !msg.fileData) {
      apiMessages.push({ role: 'user', content: '[文件: ' + msg.fileName + '] ' + msg.content });
    } else {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  const response = await axios.post(API_BASE + '/api/chat', {
    messages: apiMessages,
    temperature: 0.7,
    max_tokens: 1024
  });

  const aiContent = response.data.choices[0].message.content;
  const jsonStr = extractJson(aiContent);
  let parsed: AIResponse;
  try {
    parsed = JSON.parse(jsonStr);
    parsed.message = fixLatexEscapes(parsed.message);
  } catch {
    parsed = {
      message: fixLatexEscapes(typeof aiContent === 'string' ? aiContent : JSON.stringify(aiContent)),
      socratic_type: 'clarification' as const,
      knowledge_points: { '审题分析': 0.5, '知识运用': 0.5, '逻辑推理': 0.5, '验证反�?: 0.5 },
      next_expectation: '继续思�?
    };
  }
  return parsed;
}

export async function generateEvaluation(
  messages: ChatMessage[]
): Promise<{ strengths: string; improvements: string; overall: string; suggestions: string }> {
  const transcript = messages.map((m: any) => {
    const role = m.role === 'user' ? '学生' : '导师';
    return role + '�? + m.content;
  }).join('\n\n');

  const prompt = '你是教育评估专家。根据对话生成评估报告。返回JSON：{\"strengths\":\"优点\",\"improvements\":\"方向\",\"overall\":\"总体评价\",\"suggestions\":\"建议\"}。\n\n对话：\n' + transcript;

  const response = await axios.post(API_BASE + '/api/chat', {
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 800
  });

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) {
    return { strengths: '-', improvements: '-', overall: '评估失败', suggestions: '-' };
  }

  const jsonStr = extractJson(raw);
  try {
    const result = JSON.parse(jsonStr);
    result.strengths = fixLatexEscapes(result.strengths || '');
    result.improvements = fixLatexEscapes(result.improvements || '');
    result.overall = fixLatexEscapes(result.overall || '');
    result.suggestions = fixLatexEscapes(result.suggestions || '');
    return result;
  } catch {
    return {
      strengths: '积极参与思�?,
      improvements: '可深入反思验�?,
      overall: '展现良好思考习惯，继续加油�?,
      suggestions: '建议多练习类似题�?
    };
  }
}
