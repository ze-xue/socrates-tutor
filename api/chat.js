const C = (h) => String.fromCharCode(parseInt(h, 16));

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const { messages, temperature, max_tokens } = req.body;
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
      return res.status(response.status).json({ error: err });
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

    res.json({ choices: [{ message: { role: 'assistant', content: text } }] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
