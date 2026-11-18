const { analyzeSchema } = require("../utils/validation");
const {
  analyzeTraditional
} = require("../services/traditional.engine");

async function analyzeRequest(req, res) {
  try {
    // Validar solicitud
    const validation = analyzeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Solicitud inválida",
        details: validation.error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const { message, mode } = validation.data;

    // Ejecutar motor correspondiente
    if (mode === "traditional") {
      const result = analyzeTraditional(message);
      const {
      analyzeGenerative
    } = require("../services/generative.engine");
      return res.status(200).json(result);
    }

    // El motor generativo se integrará en la siguiente fase
    if (mode === "generative") {
    try {
      const result = await analyzeGenerative(message);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error en motor generativo:", error.message);

      return res.status(502).json({
        error: "No fue posible procesar la solicitud con el modelo generativo"
      });
    }
  }

  } catch (error) {
    console.error("Error al analizar solicitud:", error.message);

    return res.status(500).json({
      error: "No fue posible procesar la solicitud"
    });
  }
}

module.exports = {
  analyzeRequest
};
