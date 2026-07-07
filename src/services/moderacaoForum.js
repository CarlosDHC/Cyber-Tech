// ============================================================================
// FUNÇÃO 1: MODERAÇÃO DE POSTS E COMENTÁRIOS
// ============================================================================
export const moderarConteudo = async (titulo = "", texto = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) return true; // Se não tem chave, permite a publicação para não travar o fórum

  const configBase = {
    temperature: 0.1,
    max_tokens: 15
  };

  try {
    // Valida de forma segura a URL da imagem
    const linkSeguro = linkImagem ? linkImagem.trim() : "";
    const possuiImagem = linkSeguro.startsWith("http");

    // --- CENÁRIO 1: O utilizador enviou uma hiperligação de imagem ---
    if (possuiImagem) {
      const promptVisao = `Analise a imagem e o texto:
      Título: "${titulo}" | Texto: "${texto}"
      Regras: Se houver nudez, pornografia, hentai, ecchi, violência extrema, armas, racismo, palavras de baixo calão ou gestos obscenos: responda "BLOQUEADO".
      Se for seguro e apropriado para um ambiente educacional: responda "APROVADO".
      Responda APENAS com uma dessas duas palavras.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          // O modelo que você confirmou que funciona perfeitamente
          model: "meta-llama/llama-4-scout-17b-16e-instruct", 
          messages: [{
            role: "user",
            content: [
              { type: "text", text: promptVisao },
              { type: "image_url", image_url: { url: linkSeguro } }
            ]
          }],
          ...configBase
        })
      });

      if (!response.ok) {
        // Se o modelo bloquear a imagem na porta da API (Erro 400), nós bloqueamos a publicação!
        if (response.status === 400) {
            console.warn("[Segurança] Imagem barrada pelo filtro nativo da API.");
            return false; 
        }
        return true; // Outros erros de servidor (ex: 500) deixam passar para não travar o site
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
      console.log("Moderação (Visão):", resultadoIA);
      
      return !resultadoIA.includes("BLOQUEADO");
    }

    // --- CENÁRIO 2: É apenas texto ---
    const promptTexto = `Analise o seguinte texto:
    Título: "${titulo}"
    Texto: "${texto}"
    
    Regras: Se contiver palavrões, xingamentos, ódio, assédio, racismo ou insultos: responda "BLOQUEADO".
    Se for inofensivo e normal, responda "APROVADO".
    Responda APENAS com uma dessas duas palavras.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptTexto }],
        ...configBase
      })
    });

    if (!response.ok) return true;

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
    console.log("Moderação (Texto):", resultadoIA);
    
    return !resultadoIA.includes("BLOQUEADO");

  } catch (error) {
    console.error("Erro na moderação:", error);
    // Retorna true em caso de falha técnica para não impedir os alunos de postarem
    return true; 
  }
};

export const verificarSeguranca = moderarConteudo;