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

      return res.status(200).json(result);
    }

    // El motor generativo se integrará en la siguiente fase
    return res.status(501).json({
      error: "Motor generativo pendiente de integración"
    });

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
