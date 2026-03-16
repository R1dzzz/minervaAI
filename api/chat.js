export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await response.json();

    // Debug log (lihat di Vercel logs kalau ada masalah)
    console.log("Gemini response:", data);

    if (data.error) {
      return res.status(500).json({
        error: data.error.message || "Gemini API error"
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    return res.status(200).json({ text });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Failed to contact AI service"
    });

  }

        }
