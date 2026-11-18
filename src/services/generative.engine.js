const { generateWithOllama } = require("./ollama.client");
const {
  validateGenerativeResponse
} = require("./response.validator");
  const {
  detectPromptInjection
} = require("../utils/security");

async function analyzeGenerative(message) {
  if (detectPromptInjection(message)) {
    return {
      category: "SECURITY",
      priority: "CRITICAL",
      response: "Se detectó un intento de manipulación del modelo. El incidente será revisado por seguridad.",
      requiresHumanReview: true,
      mode: "generative"
    };
  }

  const modelResponse = await generateWithOllama(message);

  let parsedResponse;

  try {
    parsedResponse = JSON.parse(modelResponse);
  } catch {
    throw new Error("El modelo generó una respuesta JSON inválida");
  }

  const validation = validateGenerativeResponse(parsedResponse);

  if (!validation.success) {
    throw new Error("La respuesta del modelo no cumple el contrato esperado");
  }

  const result = validation.data;

  return {
    category: result.category,
    priority: result.priority,
    response: result.response,
    requiresHumanReview: result.category === "SECURITY",
    mode: "generative"
  };
}

module.exports = {
  analyzeGenerative
};