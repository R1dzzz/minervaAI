/* ============================================================
   MinervaAI v2.0 — api.js
   Gemini API Communication via Vercel Serverless Function
   ============================================================ */

// ══ CONFIGURATION ══
// Endpoint serverless Vercel
// nanti akan menjadi:
// https://project-name.vercel.app/api/chat
const GEMINI_PROXY_URL = '/api/chat';


/* ══════════════════════════════════════
   CALL GEMINI VIA VERCEL PROXY
   Sends the conversation history
   to /api/chat which forwards
   request to Gemini API
   ══════════════════════════════════════ */
async function callGeminiProxy(conversationHistory) {
  try {

    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.text,
      error: null
    };

  } catch (err) {
    console.error('Gemini proxy error:', err);

    return {
      text: null,
      error: err.message
    };
  }
}


/* ══════════════════════════════════════
   OPTIONAL FALLBACK (DEV ONLY)
   Direct Gemini request
   DO NOT use in production
   ══════════════════════════════════════ */
async function callGeminiDirect(conversationHistory, apiKey) {

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    }
  );

  const data = await response.json();

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
}