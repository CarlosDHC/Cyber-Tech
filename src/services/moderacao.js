// src/services/moderacao.js

export const moderarConteudo = async (titulo = "", texto = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("ERRO: Chave da API do Groq não encontrada!");
    return true; 
  }

  // --- CENÁRIO 1: O utilizador enviou uma hiperligação de imagem ---
  if (linkImagem && linkImagem.trim() !== "") {
    const promptVisao = `
      Aja como moderador. Analise o título: "${titulo}", o texto: "${texto}" e a IMAGEM em anexo.
      Se a imagem contiver nudez, armas, sangue, violência, hentai ou animes considerados inapropriados, pornografia, preconceito, rasista, palavras inapropriadas na imagem ou gestos obscenos.
      Se o texto ou a imagem violarem regras de respeito, responda APENAS "BLOQUEADO".
      Se for seguro, responda APENAS "APROVADO".
    `;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          // Modelo Multimodal mais recente suportado pela Groq
          model: "meta-llama/llama-4-scout-17b-16e-instruct", 
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptVisao },
                { type: "image_url", image_url: { url: linkImagem } }
              ]
            }
          ],
          temperature: 0,
          max_tokens: 10
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
      console.log("Moderação (Visão):", resultadoIA);
      return resultadoIA.includes("APROVADO");

    } catch (error) {
      console.error("Erro na moderação visual:", error);
      return true; // Em caso de erro da API, não bloqueamos a utilização do fórum
    }
  }

  // --- CENÁRIO 2: É apenas texto (ex: um comentário sem imagem) ---
  const promptTexto = `
    Aja como um moderador. Analise o texto:
    Título: ${titulo}
    Texto: ${texto}
    
    Se houver discurso de ódio, assédio, palavras obscenas ou insultos, responda APENAS "BLOQUEADO".
    Se for inofensivo, responda APENAS "APROVADO".
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // Modelo rápido de texto da Groq
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "user", content: promptTexto }],
        temperature: 0,
        max_tokens: 10
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
    console.log("Moderação (Texto):", resultadoIA);
    return resultadoIA.includes("APROVADO");

  } catch (error) {
    console.error("Erro na requisição de texto:", error);
    return true; 
  }
};