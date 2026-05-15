const TTS_VOICES = {
  'xiaochun': 'longxiaochun',
  'xiaoxia': 'longxiaoxia',
  'xiaoyue': 'longyue',
  'laotie': 'longlaotie',
  'chengge': 'longcheng',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const { text, voice } = req.body;
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
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const audioBase64 = data.output?.audio?.data || data.output?.audio_url;
    if (!audioBase64) return res.status(500).json({ error: 'No audio data' });

    res.json({ audio: audioBase64 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
