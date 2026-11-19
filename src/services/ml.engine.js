const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

const VALID_CATEGORIES = [
  "ACCESS",
  "BUG",
  "FEATURE",
  "SECURITY"
];

async function analyzeWithML(message) {
  let response;

  try {
    response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(10000)
    });
  } catch {
    throw new Error("Servicio ML no disponible");
  }

  if (!response.ok) {
    throw new Error("Error al consultar el servicio ML");
  }

  const prediction = await response.json();

  if (
    !VALID_CATEGORIES.includes(prediction.category) ||
    typeof prediction.confidence !== "number" ||
    prediction.confidence < 0 ||
    prediction.confidence > 1
  ) {
    throw new Error("Respuesta ML inválida");
  }

  return {
    category: prediction.category,
    priority: prediction.category === "SECURITY" ? "HIGH" : "MEDIUM",
    response: "Su solicitud ha sido clasificada mediante el motor de Machine Learning.",
    requiresHumanReview:
      prediction.category === "SECURITY" ||
      prediction.confidence < 0.65,
    mode: "machine-learning"
  };
}

module.exports = { analyzeWithML };
