const { z } = require("zod");

const generativeResponseSchema = z.object({
  category: z.enum(["ACCESS", "BUG", "FEATURE", "SECURITY"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  response: z.string().trim().min(1).max(2000)
}).strict().superRefine((result, ctx) => {
  if (
    result.category === "SECURITY"
    && result.priority !== "HIGH"
    && result.priority !== "CRITICAL"
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["priority"],
      message: "Los incidentes SECURITY deben ser HIGH o CRITICAL"
    });
  }
});

function validateGenerativeResponse(data) {
  return generativeResponseSchema.safeParse(data);
}

module.exports = {
  generativeResponseSchema,
  validateGenerativeResponse
};