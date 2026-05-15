const express = require('express');
const cors = require('cors');
const { resolve } = require('path');
const { readFileSync, existsSync } = require('fs');
const assets = require('./dist-assets.js');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const distPath = resolve(__dirname, 'dist');

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  let fp = resolve(distPath, req.path.slice(1) || 'index.html');
  if (!existsSync(fp)) fp = resolve(distPath, 'index.html');
  if (!existsSync(fp)) return next();
  try {
    const ext = require('path').extname(fp);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.send(readFileSync(fp));
  } catch (e) { next(); }
});

function toDashScopeMsg(msg) {
  const role = msg.role;
  if (typeof msg.content === 'string') return { role, content: [{ text: msg.content }] };
  if (Array.isArray(msg.content)) {
    return { role, content: msg.content.map(p => {
      if (p.type === 'text') return { text: p.text };
      if (p.type === 'image_url') return { image: p.image_url.url };
      return p;
    })};
  }
  return { role, content: [{ text: String(msg.content) }] };
}

const TTS_VOICES = {
  xiaochun: 'longxiaochun', xiaoxia: 'longxiaoxia', xiaoyue: 'longyue',
  laotie: 'longlaotie', chengge: 'longcheng',
};

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Set DEEPSEEK_API_KEY env var' });
    const { messages, temperature, max_tokens } = req.body;
    const dashMessages = messages.map(toDashScopeMsg);
    const r = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.5-omni-plus',
        input: { messages: dashMessages },
        parameters: { temperature: temperature || 0.7, max_tokens: max_tokens || 1024, result_format: 'message' }
      })
    });
    if (!r.ok) { const e = await r.text(); return res.status(r.status).json({ error: e }); }
    const d = await r.json();
    const o = d.output;
    let t = '';
    if (o.choices && o.choices[0]) {
      const m = o.choices[0].message;
      t = Array.isArray(m.content) ? m.content.filter(p => p.text).map(p => p.text).join('') : (m.content || '');
    } else if (o.text) t = o.text;
    res.json({ choices: [{ message: { role: 'assistant', content: t } }] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/voices', (req, res) => {
  res.json([
    { id: 'xiaochun', name: 'С��', desc: '����Ů��' },
    { id: 'xiaoxia', name: 'С��', desc: '����Ů��' },
    { id: 'xiaoyue', name: 'С��', desc: '֪��Ů��' },
    { id: 'laotie', name: '����', desc: '��������' },
    { id: 'chengge', name: '�ϸ�', desc: '��ů����' },
  ]);
});

app.post('/api/tts', async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Set DEEPSEEK_API_KEY env var' });
    const { text, voice } = req.body;
    const mv = TTS_VOICES[voice] || 'longxiaochun';
    const r = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-speech/generation', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen-tts',
        input: { text: (text || '').slice(0, 500) },
        parameters: { voice: mv, format: 'mp3', sample_rate: 16000 }
      })
    });
    if (!r.ok) { const e = await r.text(); return res.status(r.status).json({ error: e }); }
    const d = await r.json();
    const ab = d.output?.audio?.data || d.output?.audio_url;
    if (!ab) return res.status(500).json({ error: 'No audio' });
    res.json({ audio: ab });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/debug', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const files = [];
  function walk(dir, prefix) {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items.slice(0, 20)) {
        const fp = path.join(dir, item);
        try { const st = fs.statSync(fp); files.push(prefix + item + (st.isDirectory() ? '/' : '')) } catch(e) {}
      }
    } catch(e) { files.push(prefix + 'ERR: ' + e.message) }
  }
  walk(__dirname, '[root]/');
  walk(__dirname + '/dist', '[dist]/');
  walk(__dirname + '/dist/assets', '[dist/assets]/');
  res.json({ __dirname, distPath, files });
});

app.listen(PORT, () => {
  console.log('Socrates AI Tutor: http://localhost:' + PORT);
  
});