import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Convert OpenAI-compatible message to DashScope native format
function toDashScopeMsg(msg) {
  const role = msg.role;
  
  // Content is a string -> wrap in text array
  if (typeof msg.content === 'string') {
    return { role, content: [{ text: msg.content }] };
  }
  
  // Content is an array (multimodal) -> convert type:image_url -> image
  if (Array.isArray(msg.content)) {
    const parts = msg.content.map(part => {
      if (part.type === 'text') {
        return { text: part.text };
      }
      if (part.type === 'image_url') {
        return { image: part.image_url.url };
      }
      return part;
    });
    return { role, content: parts };
  }
  
  return { role, content: [{ text: String(msg.content) }] };
}

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured.' });
    }

    const { messages, temperature, max_tokens } = req.body;

    // Convert all messages to DashScope native format
    const dashMessages = messages.map(toDashScopeMsg);

    const body = {
      model: 'qwen3.5-omni-plus',
      input: { messages: dashMessages },
      parameters: {
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1024,
        result_format: 'message'
      }
    };

    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Qwen API error:', err);
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    
    // DashScope native response -> OpenAI compatible
    const output = data.output;
    let text = '';
    
    if (output.choices && output.choices[0]) {
      const msg = output.choices[0].message;
      if (Array.isArray(msg.content)) {
        text = msg.content
          .filter(p => p.text)
          .map(p => p.text)
          .join('');
      } else {
        text = msg.content || '';
      }
    } else if (output.text) {
      text = output.text;
    }

    res.json({
      choices: [{ message: { role: 'assistant', content: text } }]
    });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});


// TTS voices available
const TTS_VOICES = {
  'xiaochun': 'longxiaochun',
  'xiaoxia': 'longxiaoxia',
  'xiaoyue': 'longyue',
  'laotie': 'longlaotie',
  'chengge': 'longcheng',
};

app.get('/api/voices', (req, res) => {
  res.json([
    { id: 'xiaochun', name: '小春', desc: '温柔女声' },
    { id: 'xiaoxia', name: '小夏', desc: '活泼女声' },
    { id: 'xiaoyue', name: '小月', desc: '知性女声' },
    { id: 'laotie', name: '老铁', desc: '沉稳男声' },
    { id: 'chengge', name: '诚哥', desc: '温暖男声' },
  ]);
});

app.post('/api/tts', async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured.' });

    const { text, voice } = req.body;
    const modelVoice = TTS_VOICES[voice] || 'longxiaochun';

    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-speech/generation',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen-tts',
          input: { text: text.slice(0, 500) },
          parameters: {
            voice: modelVoice,
            format: 'mp3',
            sample_rate: 16000,
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('TTS API error:', err);
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    // DashScope returns audio as base64 in output.audio.data
    const audioBase64 = data.output?.audio?.data || data.output?.audio_url;
    if (!audioBase64) {
      return res.status(500).json({ error: 'No audio data returned' });
    }
    
    res.json({ audio: audioBase64 });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('Socrates proxy running on http://localhost:' + PORT + ' (Qwen3.5 Omni Plus)');
});
