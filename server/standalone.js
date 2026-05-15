import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const distPath = resolve(__dirname, 'dist');
app.use(express.static(distPath));

function toDashScopeMsg(msg) {
  const role = msg.role;
  if (typeof msg.content === 'string') return { role, content: [{ text: msg.content }] };
  if (Array.isArray(msg.content)) {
    return {
      role,
      content: msg.content.map(p => {
        if (p.type === 'text') return { text: p.text };
        if (p.type === 'image_url') return { image: p.image_url.url };
        return p;
      })
    };
  }
  return { role, content: [{ text: String(msg.content) }] };
}

const TTS_VOICES = {
  xiaochun: 'longxiaochun',
  xiaoxia: 'longxiaoxia',
  xiaoyue: 'longyue',
  laotie: 'longlaotie',
  chengge: 'longcheng',
};

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY not set' });
    const { messages, temperature, max_tokens } = req.body;
    const dashMessages = messages.map(toDashScopeMsg);
    const resp = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3.5-omni-plus',
          input: { messages: dashMessages },
          parameters: { temperature: temperature || 0.7, max_tokens: max_tokens || 1024, result_format: 'message' }
        })
      }
    );
    if (!resp.ok) { const err = await resp.text(); return res.status(resp.status).json({ error: err }); }
    const data = await resp.json();
    const output = data.output;
    let text = '';
    if (output.choices && output.choices[0]) {
      const msg = output.choices[0].message;
      text = Array.isArray(msg.content) ? msg.content.filter(p => p.text).map(p => p.text).join('') : (msg.content || '');
    } else if (output.text) text = output.text;
    res.json({ choices: [{ message: { role: 'assistant', content: text } }] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/voices', (req, res) => {
  res.json([
    { id: 'xiaochun', name: 'Ð¡´º', desc: 'ÎÂÈáÅ®Éù' },
    { id: 'xiaoxia', name: 'Ð¡ÏÄ', desc: '»îÆÃÅ®Éù' },
    { id: 'xiaoyue', name: 'Ð¡ÔÂ', desc: 'ÖªÐÔÅ®Éù' },
    { id: 'laotie', name: 'ÀÏÌú', desc: '³ÁÎÈÄÐÉù' },
    { id: 'chengge', name: '³Ï¸ç', desc: 'ÎÂÅ¯ÄÐÉù' },
  ]);
});

app.post('/api/tts', async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY not set' });
    const { text, voice } = req.body;
    const modelVoice = TTS_VOICES[voice] || 'longxiaochun';
    const resp = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-speech/generation',
      {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen-tts',
          input: { text: (text || '').slice(0, 500) },
          parameters: { voice: modelVoice, format: 'mp3', sample_rate: 16000 }
        })
      }
    );
    if (!resp.ok) { const err = await resp.text(); return res.status(resp.status).json({ error: err }); }
    const data = await resp.json();
    const audioBase64 = data.output?.audio?.data || data.output?.audio_url;
    if (!audioBase64) return res.status(500).json({ error: 'No audio data' });
    res.json({ audio: audioBase64 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Socrates AI Tutor: http://localhost:' + PORT);
  const url = 'http://localhost:' + PORT;
  exec('start ' + url);
  exec('powershell -Command "Start-Process ' + url + '"');
});