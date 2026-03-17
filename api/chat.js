export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Messages are required" });
    }

    // Convert format dari Gemini → OpenRouter (OpenAI style)
    const formattedMessages = messages.map(m => ({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.parts?.[0]?.text || ""
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto", 
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    console.log("OpenRouter response:", data);

    if (data.error) {
      return res.status(500).json({
        error: data.error.message || "OpenRouter API error"
      });
    }

    const text =
      data?.choices?.[0]?.message?.content ||
      "No response from AI";

    return res.status(200).json({ text });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Failed to contact AI service"
    });

  }

}
