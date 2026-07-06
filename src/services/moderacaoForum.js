// src/services/moderacaoForum.js
export const verificarSeguranca = async (titulo, texto, linkImagem) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return true;

  const prompt = `Aja como moderador. Analise este post. Responda APENAS "0" (seguro) ou "1" (impróprio/violento/golpe).
Título: "${titulo}"
Texto: "${texto}"`;

  try {
    const payload = linkImagem ? {
      model: "llama-3.2-11b-vision-preview",
      messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: linkImagem } }] }],
      temperature: 0, max_tokens: 2
    } : {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0, max_tokens: 2
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.choices[0].message.content.trim() !== "1";
  } catch (e) { return true; }
};