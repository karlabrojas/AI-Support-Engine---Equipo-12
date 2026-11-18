const { z } = require("zod");

const generativeResponseSchema = z.object({
  category: z.enum(["ACCESS", "BUG", "FEATURE", "SECURITY"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  response: z.string().trim().min(1).max(2000)
}).strict();

function validateGenerativeResponse(data) {
  return generativeResponseSchema.safeParse(data);
}

module.exports = {
  generativeResponseSchema,
  validateGenerativeResponse
};