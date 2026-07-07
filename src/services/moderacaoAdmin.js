// src/services/moderacaoAdmin.js

export const analisarDenunciaComIA = async (motivo, detalhes, textoOriginal = "", linkImagem = "") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("Erro: API Key do Groq não configurada no .env");
    return "ANALISAR";
  }

  const prompt = `Você é um sistema automatizado de moderação estrita.
Sua única função é classificar o conteúdo denunciado retornando APENAS UMA PALAVRA.

Motivo da Denúncia: "${motivo}"
Detalhes fornecidos: "${detalhes}"
CONTEÚDO ORIGINAL DENUNCIADO: "${textoOriginal}"

REGRAS DE PUNIÇÃO:
- Se o conteúdo (texto ou imagem) mostrar xingamentos (mesmo disfarçados), nudez, pornografia, hentai, ecchi, violência extrema, armas, racismo, palavras de baixo calão ou gestos obscenos: responda "GRAVE".
- Se a denúncia for visivelmente falsa, um engano ou o conteúdo for 100% inofensivo e adequado: responda "DESCARTAR".
- Se for uma dúvida técnica, uma discussão normal ou requerer contexto humano: responda "ANALISAR".`;

  try {
    let payload;
    
    // Valida de forma segura se é uma hiperligação de imagem
    const linkSeguro = linkImagem ? linkImagem.trim() : "";
    const possuiImagemValida = linkSeguro.startsWith("http");

    if (possuiImagemValida) {
      payload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct", 
        messages: [{ 
          role: "user", 
          content: [ 
            { type: "text", text: prompt }, 
            { type: "image_url", image_url: { url: linkSeguro } } 
          ] 
        }],
        temperature: 0.1, 
        max_tokens: 10
      };
    } else {
      // Se for apenas texto (comentário normal ou post sem imagem)
      payload = {
        model: "llama-3.3-70b-versatile", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, 
        max_tokens: 10
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${apiKey}` 
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Se a imagem for pornográfica/explícita e bater no filtro 400 nativo da API, nós DELETAMOS!
      if (response.status === 400) {
          console.warn("[Admin IA] A imagem foi bloqueada pelo filtro de segurança da API. Marcando como GRAVE.");
          return "GRAVE"; 
      }
      
      console.error(`Erro retornado pelo Groq (${response.status}):`, await response.text());
      return "ANALISAR"; // Em caso de falha de servidor (500), deixa para o humano rever
    }

    const data = await response.json();
    const resultadoIA = data.choices[0].message.content.trim().toUpperCase();
    
    console.log(`Veredicto da IA Admin: ${resultadoIA}`);

    if (resultadoIA.includes("GRAVE")) return "GRAVE";
    if (resultadoIA.includes("DESCARTAR")) return "DESCARTAR";
    
    // Se a IA se recusar a responder devido aos filtros de segurança (ex: ler um xingamento),
    // assumimos que é uma violação grave e deletamos.
    if (resultadoIA.includes("CANNOT") || resultadoIA.includes("SORRY") || resultadoIA.includes("I CAN'T") || resultadoIA.includes("APOLOGIZE")) {
        return "GRAVE"; 
    }

    return "ANALISAR"; 
  } catch (error) { 
    console.error("Falha na comunicação com a IA Admin:", error);
    return "ANALISAR"; 
  }
};

// Mantido um atalho caso você ainda esteja a usar o nome antigo no seu Denuncia.jsx
export const classificarDenuncia = analisarDenunciaComIA;