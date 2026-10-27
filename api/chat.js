
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    
    return res.status(500).json({ error: 'Falta configurar la clave de Gemini en el servidor.' });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Escribe un mensaje.' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "Eres Snoopy, una IA amigable, cariñosa, divertida y respetuosa. Habla español, responde de forma natural y cercana." }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message.slice(0, 4000) }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 700
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error de Gemini:", data);
      return res.status(502).json({ error: "Gemini no pudo responder. Inténtalo de nuevo." });
    }

    const reply = 
      data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("") || "Guau! No pude responder esta vez.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Error del servidor:", error);
    return res.status(500).json({ error: "Ocurrió un error al responder." });
  }
}
