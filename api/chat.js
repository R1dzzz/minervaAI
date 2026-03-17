export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Convert Gemini format → Claude format
    const lastUserMessage = messages
      .filter(m => m.role === "user")
      .map(m => m.parts[0].text)
      .join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: lastUserMessage
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Claude response:", data);

    if (data.error) {
      return res.status(500).json({
        error: data.error.message || "Claude API error"
      });
    }

    const text =
      data?.content?.[0]?.text ||
      "No response from AI";

    return res.status(200).json({ text });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Failed to contact AI service"
    });

  }

  }
