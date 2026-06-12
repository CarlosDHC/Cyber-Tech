// src/services/moderacao.js

// ============================================================================
// FUNÇÃO 1: MODERAÇÃO DE POSTS E COMENTÁRIOS
// ============================================================================
export const moderarConteudo = async (titulo = "", texto = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return true;

  // --- CENÁRIO 1: Imagem e Texto ---
  if (linkImagem && linkImagem.trim() !== "") {
    const promptVisao = `
      Analise a imagem e o texto: Título: "${titulo}" | Texto: "${texto}"
      Se houver nudez, violência, armas, pornografia, racismo, palavras de baixo calão ou gestos obscenos: responda APENAS "BLOQUEADO".
      Se for inofensivo e seguro: responda APENAS "APROVADO".
    `;
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct", 
          messages: [{ role: "user", content: [ { type: "text", text: promptVisao }, { type: "image_url", image_url: { url: linkImagem } } ] }],
          temperature: 0, max_tokens: 10
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
      console.log("Moderação (Visão):", resultadoIA);
      
      // LÓGICA RIGOROSA: Só permite se a resposta tiver "APROVADO".
      if (resultadoIA.includes("APROVADO")) return true;
      return false; // Bloqueia tudo o resto (palavrões, recusas da IA, etc.)

    } catch (error) { 
      console.error("Erro na API Groq (Visão):", error);
      return false; // Se a imagem for inválida ou der erro, bloqueamos a publicação por segurança.
    }
  }

  // --- CENÁRIO 2: Apenas Texto ---
  const promptTexto = `
    Analise o seguinte texto: Título: ${titulo} | Texto: ${texto}
    Se contiver palavrões, xingamentos, ódio, assédio ou insultos, responda APENAS "BLOQUEADO".
    Se for inofensivo e normal, responda APENAS "APROVADO".
  `;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: promptTexto }],
        temperature: 0, max_tokens: 10
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
    console.log("Moderação (Texto):", resultadoIA);
    
    // LÓGICA RIGOROSA
    if (resultadoIA.includes("APROVADO")) return true;
    return false; 

  } catch (error) { 
    console.error("Erro na API Groq (Texto):", error);
    return false; 
  }
};


// ============================================================================
// FUNÇÃO 2: TRIAGEM DE DENÚNCIAS NO ADMIN
// ============================================================================
export const analisarDenunciaComIA = async (motivo, detalhes, textoOriginal = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return "ANALISAR";

  const prompt = `
    Avalie esta denúncia:
    Motivo: "${motivo}"
    Detalhes: "${detalhes}"
    CONTEÚDO DENUNCIADO: "${textoOriginal}"
    
    Regras estritas (APENAS 1 PALAVRA):
    - Se o CONTEÚDO DENUNCIADO ou os detalhes contiverem xingamentos, nudez, violência,hentai/ecchi,gestos obsenos, racismo, assédio ou golpes: responda "GRAVE".
    - Se for apenas spam sem sentido ou denúncia falsa: responda "DESCARTAR".
    - Se for inofensivo ou dúvida: responda "ANALISAR".
  `;

  try {
    let payload;
    
    // Se a denúncia tiver uma imagem, ativamos o modelo de visão!
    if (linkImagem && linkImagem.trim() !== "") {
      payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct", 
        messages: [{ role: "user", content: [ { type: "text", text: prompt }, { type: "image_url", image_url: { url: linkImagem } } ] }],
        temperature: 0, max_tokens: 10
      };
    } else {
      payload = {
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0, max_tokens: 10
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
    console.log("Veredicto Denúncia:", resultadoIA);

    if (resultadoIA.includes("GRAVE")) return "GRAVE";
    if (resultadoIA.includes("DESCARTAR")) return "DESCARTAR";
    if (resultadoIA.includes("CANNOT") || resultadoIA.includes("SORRY")) return "GRAVE"; // Recusou avaliar por ser nojento = GRAVE

    return "ANALISAR"; 
  } catch (error) { 
    return "ANALISAR"; 
  }
};