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

async function handleChat(req, resp) {
  if (req.method !== 'POST') {
    resp.setStatusCode(405);
    resp.json({ error: 'Method not allowed' });
    return;
  }
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      resp.setStatusCode(500);
      resp.json({ error: 'API key not configured' });
      return;
    }
    const { messages, temperature, max_tokens } = req.body || {};
    const dashMessages = messages.map(toDashScopeMsg);
    const response = await fetch(
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
    if (!response.ok) {
      const err = await response.text();
      resp.setStatusCode(response.status);
      resp.json({ error: err });
      return;
    }
    const data = await response.json();
    const output = data.output;
    let text = '';
    if (output.choices && output.choices[0]) {
      const msg = output.choices[0].message;
      text = Array.isArray(msg.content)
        ? msg.content.filter(p => p.text).map(p => p.text).join('')
        : (msg.content || '');
    } else if (output.text) {
      text = output.text;
    }
    resp.setStatusCode(200);
    resp.json({ choices: [{ message: { role: 'assistant', content: text } }] });
  } catch (error) {
    resp.setStatusCode(500);
    resp.json({ error: error.message });
  }
}

async function handleTTS(req, resp) {
  if (req.method !== 'POST') {
    resp.setStatusCode(405);
    resp.json({ error: 'Method not allowed' });
    return;
  }
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      resp.setStatusCode(500);
      resp.json({ error: 'API key not configured' });
      return;
    }
    const { text, voice } = req.body || {};
    const modelVoice = TTS_VOICES[voice] || 'longxiaochun';
    const response = await fetch(
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
    if (!response.ok) {
      const err = await response.text();
      resp.setStatusCode(response.status);
      resp.json({ error: err });
      return;
    }
    const data = await response.json();
    const audioBase64 = data.output?.audio?.data || data.output?.audio_url;
    if (!audioBase64) {
      resp.setStatusCode(500);
      resp.json({ error: 'No audio data' });
      return;
    }
    resp.setStatusCode(200);
    resp.json({ audio: audioBase64 });
  } catch (error) {
    resp.setStatusCode(500);
    resp.json({ error: error.message });
  }
}

exports.handler = async (req, resp, context) => {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  resp.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  resp.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') {
    resp.setStatusCode(204);
    resp.send('');
    return;
  }
  const path = req.path || '';
  if (path === '/api/chat') {
    await handleChat(req, resp);
  } else if (path === '/api/tts') {
    await handleTTS(req, resp);
  } else {
    resp.setStatusCode(404);
    resp.json({ error: 'Not found', path: path });
  }
};