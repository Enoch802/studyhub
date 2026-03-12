module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, temperature = 0.7, max_tokens = 1000 } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages array required' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, temperature, max_tokens })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'API error' });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.choices[0].message.content, choices: data.choices });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
