export default async function handler(req, res) {

  // hanya izinkan POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages required" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  contents: [
    {
      role: "user",
      parts: [
        { text: messages }
      ]
    }
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024
  }
})
      }
    );

    const data = await response.json();

    let text = "No response from AI";

if (data.candidates && data.candidates.length > 0) {
  const parts = data.candidates[0].content?.parts;

  if (parts && parts.length > 0) {
    text = parts.map(p => p.text).join("");
  }
}

    return res.status(200).json({ text });

  } catch (error) {

    console.error("Gemini error:", error);

    return res.status(500).json({
      error: "AI request failed"
    });

  }

}
