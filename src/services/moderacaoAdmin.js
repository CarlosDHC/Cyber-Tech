// src/services/moderacaoAdmin.js
export const classificarDenuncia = async (motivo, detalhes, textoOriginal, linkImagem) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return "ANALISAR";

  const prompt = `Analise a denúncia de um usuário. O conteúdo original é: "${textoOriginal}".
Motivo da denúncia: "${motivo} - ${detalhes}".
Responda APENAS UMA PALAVRA: GRAVE (excluir), DESCARTAR (ignorar), ou ANALISAR (verificação humana).`;

  // ... (implementar o fetch similar ao anterior, mas focando no retorno das 3 classes)
  // Certifique-se de aumentar o max_tokens para 5 para suportar "GRAVE", "DESCARTAR" ou "ANALISAR"
};