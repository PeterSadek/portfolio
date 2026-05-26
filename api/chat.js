const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { systemPrompt, userMessage } = req.body;
  const prompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

  if (!systemPrompt || !userMessage) {
    return res
      .status(400)
      .json({ message: "Missing required fields: systemPrompt, userMessage" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (geminiError) {
    console.error("Gemini API Error:", geminiError);

    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY");
      }

      const groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });

      const response = await groqClient.responses.create({
        model: "openai/gpt-oss-20b",
        input: prompt,
      });

      res.status(200).json({ text: response.output_text });
    } catch (groqError) {
      console.error("Groq API Error:", groqError);
      res.status(500).json({ message: "Error from Gemini and Groq APIs." });
    }
  }
};
