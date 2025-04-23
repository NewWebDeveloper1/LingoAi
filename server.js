import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import ServerlessHttp from "serverless-http";

dotenv.config();

const app = express();

const apiKey = process.env.MY_SECRET_API_KEY;

const port = process.env.PORT;

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const openaiRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assisstant that only translates the words from on language to another. Format replies like:\nOriginal :<original>\nTranslation:<translated>. For any other queries reply, I can only translate languages let me know if you want anything to be translated.",
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

    console.log("OpenRouter response data:", openaiRes.data);

    const choices = openaiRes.data?.choices;
    if (!choices || choices.length === 0) {
      throw new Error("OpenAI response has no choices");
    }

    const assisstantReply = JSON.stringify(choices[0].message.content);
    console.log(assisstantReply);
    res.status(200).json({ reply: assisstantReply });
  } catch (error) {
    console.error(
      "Error from OpenAI : ",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to get response from OpenAI",
    });
  }
});

// app.listen(port, () => {
//   console.log(`Server started at port : ${port}`);
// });

export default ServerlessHttp(app);
