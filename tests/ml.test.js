const request = require("supertest");

jest.mock("../src/services/ml.engine", () => ({
  analyzeWithML: jest.requireActual("../src/services/ml.engine").analyzeWithML
}));

const { analyzeWithML } = require("../src/services/ml.engine");
const app = require("../src/app");

describe("Machine Learning Engine", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Debe clasificar problemas de acceso", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "ACCESS",
        confidence: 0.85
      })
    });

    const result = await analyzeWithML("No puedo iniciar sesión");

    expect(result.category).toBe("ACCESS");
    expect(result.mode).toBe("machine-learning");
    expect(result.requiresHumanReview).toBe(false);
  });

  test("Debe clasificar errores del sistema", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "BUG",
        confidence: 0.80
      })
    });

    const result = await analyzeWithML("La aplicación presenta errores");

    expect(result.category).toBe("BUG");
  });

  test("Debe clasificar solicitudes de funcionalidades", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "FEATURE",
        confidence: 0.90
      })
    });

    const result = await analyzeWithML("Quiero exportar reportes");

    expect(result.category).toBe("FEATURE");
  });

  test("Debe solicitar revisión humana para SECURITY", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "SECURITY",
        confidence: 0.90
      })
    });

    const result = await analyzeWithML("Detecté acceso no autorizado");

    expect(result.category).toBe("SECURITY");
    expect(result.priority).toBe("HIGH");
    expect(result.requiresHumanReview).toBe(true);
  });

  test("Debe solicitar revisión humana cuando la confianza es baja", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "ACCESS",
        confidence: 0.40
      })
    });

    const result = await analyzeWithML("Tengo un problema");

    expect(result.requiresHumanReview).toBe(true);
  });

  test("Debe devolver el contrato esperado", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "BUG",
        confidence: 0.85
      })
    });

    const result = await analyzeWithML("La aplicación falla");

    expect(Object.keys(result)).toEqual([
      "category",
      "priority",
      "response",
      "requiresHumanReview",
      "mode"
    ]);
  });

  test("Debe rechazar categorías no permitidas", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "PAYMENT",
        confidence: 0.90
      })
    });

    await expect(
      analyzeWithML("Tengo un problema")
    ).rejects.toThrow("Respuesta ML inválida");
  });

  test("Debe rechazar niveles de confianza inválidos", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "ACCESS",
        confidence: 1.5
      })
    });

    await expect(
      analyzeWithML("Tengo un problema")
    ).rejects.toThrow("Respuesta ML inválida");
  });

  test("Debe controlar errores de conexión con Python", async () => {
    global.fetch.mockRejectedValue(new Error("Conexión rechazada"));

    await expect(
      analyzeWithML("Tengo un problema")
    ).rejects.toThrow("Servicio ML no disponible");
  });

  test("Debe devolver HTTP 200 al consultar el motor ML", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        category: "ACCESS",
        confidence: 0.85
      })
    });

    const response = await request(app)
      .post("/api/analyze")
      .send({
        message: "No puedo iniciar sesión",
        mode: "machine-learning"
      });

    expect(response.status).toBe(200);
    expect(response.body.category).toBe("ACCESS");
    expect(response.body.mode).toBe("machine-learning");
  });

  test("Debe devolver HTTP 502 cuando Python no está disponible", async () => {
    global.fetch.mockRejectedValue(new Error("Conexión rechazada"));

    const response = await request(app)
      .post("/api/analyze")
      .send({
        message: "Tengo un problema",
        mode: "machine-learning"
      });

    expect(response.status).toBe(502);
    expect(response.body.error).toBe(
      "No fue posible procesar la solicitud con el motor ML"
    );
  });
});
