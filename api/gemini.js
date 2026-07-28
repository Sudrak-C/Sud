// Serverless proxy for Gemini — keeps GEMINI_API_KEY on the server, never in
// browser-visible code. Reads the key from a Vercel Environment Variable.
//
// Call it from the browser with:
//   fetch('/api/gemini', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       prompt: 'your prompt here',
//       model: 'gemini-2.0-flash',   // optional, defaults below
//       json: false                  // optional — true forces JSON-only output
//     })
//   })
// Response: { text: '...' } on success, { error: '...' } on failure.

const DEFAULT_MODEL = 'gemini-2.0-flash';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server' });
    return;
  }

  const body = req.body || {};
  const prompt = body.prompt;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing "prompt" string in request body' });
    return;
  }
  const model = (typeof body.model === 'string' && body.model.trim()) || DEFAULT_MODEL;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  if (body.json) {
    requestBody.generationConfig = { responseMimeType: 'application/json' };
  }

  try {
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );
    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      res.status(geminiRes.status).json({ error: (data.error && data.error.message) || 'Gemini API error' });
      return;
    }
    const text =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text) || '';
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reach Gemini API' });
  }
};
