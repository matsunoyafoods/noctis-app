export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !apiKey.startsWith('sk-')) return res.status(401).json({ error: 'APIキーが未設定です' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const openaiBody = {
      model: 'gpt-4o',
      max_tokens: body.max_tokens || 800,
      messages: body.messages
    };
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify(openaiBody)
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ type: 'text', text: text }] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
