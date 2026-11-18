const { z } = require("zod");

const analyzeSchema = z.object({
  message: z.string()
    .trim()
    .min(1, "El mensaje no puede estar vacío")
    .max(5000, "El mensaje supera el límite permitido"),

  mode: z.enum(["traditional", "generative"])
}).strict();

module.exports = {
  analyzeSchema
};
