
jest.mock("../src/services/ollama.client", () => ({
  generateWithOllama: jest.fn()
}));

const { generateWithOllama } = require("../src/services/ollama.client");
const { analyzeGenerative } = require("../src/services/generative.engine");

describe("Generative Engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe clasificar problemas de acceso", async () => {
    generateWithOllama.mockResolvedValue(
      JSON.stringify({
        category: "ACCESS",
        priority: "MEDIUM",
        response: "Verifique sus credenciales."
      })
    );

    const result = await analyzeGenerative("No puedo iniciar sesión");

    expect(result.category).toBe("ACCESS");
    expect(result.mode).toBe("generative");
    expect(result.requiresHumanReview).toBe(false);
  });

  test("Debe clasificar errores del sistema", async () => {
    generateWithOllama.mockResolvedValue(
      JSON.stringify({
        category: "BUG",
        priority: "HIGH",
        response: "Revisaremos el error reportado."
      })
    );

    const result = await analyzeGenerative("La aplicación presenta errores");

    expect(result.category).toBe("BUG");
  });

  test("Debe clasificar solicitudes de funcionalidades", async () => {
    generateWithOllama.mockResolvedValue(
      JSON.stringify({
        category: "FEATURE",
        priority: "LOW",
        response: "Registraremos su sugerencia."
      })
    );

    const result = await analyzeGenerative("Quiero exportar reportes");

    expect(result.category).toBe("FEATURE");
  });

  test("Debe solicitar revisión humana para SECURITY", async () => {
    generateWithOllama.mockResolvedValue(
      JSON.stringify({
        category: "SECURITY",
        priority: "CRITICAL",
        response: "El incidente será revisado por seguridad."
      })
    );

    const result = await analyzeGenerative("Se filtraron credenciales");

    expect(result.category).toBe("SECURITY");
    expect(result.requiresHumanReview).toBe(true);
  });

  test("Debe rechazar respuestas JSON inválidas", async () => {
    generateWithOllama.mockResolvedValue("Esto no es JSON");

    await expect(
      analyzeGenerative("Tengo un problema")
    ).rejects.toThrow("El modelo generó una respuesta JSON inválida");
  });

  test("Debe rechazar categorías no permitidas", async () => {
    generateWithOllama.mockResolvedValue(
      JSON.stringify({
        category: "PAYMENT",
        priority: "HIGH",
        response: "Respuesta de prueba."
      })
    );

    await expect(
      analyzeGenerative("Tengo un problema")
    ).rejects.toThrow("La respuesta del modelo no cumple el contrato esperado");
  });

  test("Debe propagar errores de conexión con Ollama", async () => {
    generateWithOllama.mockRejectedValue(
      new Error("Conexión rechazada")
    );

    await expect(
      analyzeGenerative("Tengo un problema")
    ).rejects.toThrow("Conexión rechazada");
  });
});
