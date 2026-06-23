// src/services/moderacao.js

// ============================================================================
// FUNÇÃO 1: MODERAÇÃO DE POSTS E COMENTÁRIOS NO FÓRUM
// ============================================================================
export const moderarConteudo = async (titulo = "", texto = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return true;

  // Prompt atualizado para apanhar palavrões disfarçados e abreviações
  const promptTexto = `Aja como um moderador implacável.
Analise o seguinte conteúdo:
Título: "${titulo}"
Texto: "${texto}"
Regras:
Se contiver palavrões (mesmo disfarçados, censurados ou abreviados como 'merd@', 'Caralh=o', 'fdp', etc.), discurso de ódio, racismo, apologia a crimes, assédio, violência, pornografia ou golpes, responda APENAS com o número 1.
Se for inofensivo, seguro ou uma dúvida educacional normal sem linguagem ofensiva, responda APENAS com o número 0.
NÃO ESCREVA NENHUMA OUTRA PALAVRA. APENAS 0 OU 1.`;

  // Prompt atualizado para apanhar gestos com as mãos e símbolos de ódio nas imagens
  const promptVisao = `Aja como um moderador implacável.
Analise a imagem e o texto associado:
Título: "${titulo}"
Texto: "${texto}"
Regras:
Se a imagem ou o texto contiverem nudez, pornografia, hentai, ecchi, imagens de anime com conotação sexual, violência, racismo, palavras de baixo calão (mesmo disfarçadas como 'merd@'), ou gestos obscenos (como o dedo do meio, símbolos de ódio ou apologias raciais/nazistas), responda APENAS com o número 1.
Se a imagem e o texto forem totalmente inofensivos e seguros, responda APENAS com o número 0.
NÃO ESCREVA NENHUMA OUTRA PALAVRA. APENAS 0 OU 1.`;

  try {
    let payload;

    if (linkImagem && linkImagem.trim() !== "") {
      payload = {
        model: "llama-3.2-11b-vision-preview", 
        messages: [{ role: "user", content: [ { type: "text", text: promptVisao }, { type: "image_url", image_url: { url: linkImagem } } ] }],
        temperature: 0, 
        max_tokens: 2
      };
    } else {
      payload = {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: promptTexto }],
        temperature: 0, 
        max_tokens: 2
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const resultadoIA = data.choices[0].message.content.trim();
    
    // Se a IA responder "1", bloqueamos.
    if (resultadoIA === "1") return false;
    
    // Se responder "0", aprovamos.
    return true; 

  } catch (error) { 
    return true; // Fail-safe: aprova em caso de erro da API para não travar o fórum
  }
};


// ============================================================================
// FUNÇÃO 2: TRIAGEM DE DENÚNCIAS NO ADMIN
// ============================================================================
export const analisarDenunciaComIA = async (motivo, detalhes, textoOriginal = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return "ANALISAR";

  // Regras de triagem apertadas para o Admin
  const prompt = `Aja como o Administrador de Moderação.
Avalie esta denúncia:
Motivo: "${motivo}"
Detalhes da Denúncia: "${detalhes}"
CONTEÚDO ORIGINAL DENUNCIADO: "${textoOriginal}"

Regras de punição (RESPONDA APENAS 1 PALAVRA, NADA MAIS):
- Se o CONTEÚDO (texto ou imagem) mostrar xingamentos (incluindo palavras disfarçadas ou abreviadas como 'merd@', 'Caralh=o'), nudez, hentai, ecchi, animes obscenos, gestos obscenos (como dedo do meio, símbolos de ódio, apologias raciais), racismo, violência extrema ou golpes: responda "GRAVE".
- Se a denúncia for falsa, um engano do usuário, ou o conteúdo for inofensivo e adequado: responda "DESCARTAR".
- Se for uma dúvida técnica ou precisar de verificação humana: responda "ANALISAR".`;

  try {
    let payload;
    
    if (linkImagem && linkImagem.trim() !== "") {
      payload = {
        model: "llama-3.2-11b-vision-preview", 
        messages: [{ role: "user", content: [ { type: "text", text: prompt }, { type: "image_url", image_url: { url: linkImagem } } ] }],
        temperature: 0, 
        max_tokens: 10
      };
    } else {
      payload = {
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0, 
        max_tokens: 10
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

    if (resultadoIA.includes("GRAVE")) return "GRAVE";
    if (resultadoIA.includes("DESCARTAR")) return "DESCARTAR";
    if (resultadoIA.includes("CANNOT") || resultadoIA.includes("SORRY")) return "GRAVE"; 

    return "ANALISAR"; 
  } catch (error) { 
    return "ANALISAR"; 
  }
};