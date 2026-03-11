module.exports = async (req, res) => {
  // ── CORS ────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      messages,
      temperature = 0.7,
      max_tokens  = 1000,
      json_mode   = false
    } = req.body;

    // ── Validate ─────────────────────────────────────────────
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A non-empty messages array is required.' });
    }

    // ── Model selection ──────────────────────────────────────
    // json_mode tasks (insights/topic notes) need the bigger, smarter model
    // Regular BrainX chat uses the fast 70b model for high quality responses
    const model = json_mode
      ? 'llama-3.3-70b-versatile'   // structured JSON — needs accuracy + big context
      : 'llama-3.3-70b-versatile';  // chat — use same strong model for max intelligence

    // ── Token budget ─────────────────────────────────────────
    // json_mode: up to 4000 tokens (insights can be long)
    // chat mode: up to 2000 tokens per reply
    const maxAllowed = json_mode ? 4000 : 2000;
    const safeTokens = Math.min(Math.max(parseInt(max_tokens) || 1000, 500), maxAllowed);

    // ── Inject BrainX system prompt if not already present ───
    // This ensures BrainX always behaves intelligently even if frontend forgets
    const BRAINX_SYSTEM = `You are BrainX — a world-class AI study assistant built into StudyHub. You are deeply knowledgeable, razor-sharp, and genuinely invested in helping students learn. Your personality: warm but highly intellectual, encouraging but never dumbing things down.

When answering questions:
- Give thorough, well-structured responses. Use headings (##), bullet points, and bold text (**bold**) to organize long answers.
- Always explain the WHY behind things, not just the what.
- Use real-world examples, analogies, and step-by-step breakdowns for complex topics.
- If a student seems confused, rephrase clearly and simply before going deeper.
- For exam prep: highlight key facts, common mistakes, and memory tricks.
- Never give a lazy one-line answer to a deep question. Always go the full depth the question deserves.
- Be encouraging. Celebrate progress. Push students to think critically.`;

    let processedMessages = [...messages];

    // If no system message at position 0, inject BrainX system prompt
    if (!json_mode && (processedMessages[0]?.role !== 'system')) {
      processedMessages = [
        { role: 'system', content: BRAINX_SYSTEM },
        ...processedMessages
      ];
    }

    // ── Build request ────────────────────────────────────────
    const requestBody = {
      model,
      messages: processedMessages,
      temperature: json_mode ? 0.3 : temperature, // lower temp for JSON = more reliable output
      max_tokens: safeTokens,
    };

    if (json_mode) {
      requestBody.response_format = { type: 'json_object' };
    }

    // ── Call Groq ────────────────────────────────────────────
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!groqRes.ok) {
      let errData = {};
      try { errData = await groqRes.json(); } catch (_) {}
      console.error('Groq API error:', errData);
      return res.status(groqRes.status).json({
        error: errData?.error?.message || `Groq API returned ${groqRes.status}`,
        details: errData
      });
    }

    const data = await groqRes.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error('Unexpected Groq response shape:', JSON.stringify(data));
      return res.status(500).json({ error: 'Unexpected response from AI provider.' });
    }

    // ── Return ───────────────────────────────────────────────
    return res.status(200).json({
      text: data.choices[0].message.content,
      model: data.model,
      usage: data.usage // helpful for debugging token usage
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error.',
      message: error.message
    });
  }
};
