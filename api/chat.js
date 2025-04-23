import axios from "axios";

const allowedOrigins = [
  "http://localhost:5173",
  "https://lingo-ai-frontend.vercel.app/",
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Allow CORS
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { message } = req.body;
  const apiKey = process.env.MY_SECRET_API_KEY;

  try {
    const openaiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that only translates the words from one language to another. Format replies like:\nOriginal: <original>\nTranslation: <translated>. For any other queries reply, I can only translate languages, let me know if you want anything to be translated.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      openaiRes.data?.choices?.[0]?.message?.content || "No response";
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
}
