
const {
  analyzeTraditional
} = require("../src/services/traditional.engine");

describe("Traditional Engine", () => {

  test("Debe identificar problemas de acceso", () => {
    const result = analyzeTraditional(
      "No puedo iniciar sesión"
    );

    expect(result.category).toBe("ACCESS");
    expect(result.mode).toBe("traditional");
  });

  test("Debe identificar errores del sistema", () => {
    const result = analyzeTraditional(
      "La aplicación presenta un error al guardar"
    );

    expect(result.category).toBe("BUG");
  });

  test("Debe identificar solicitudes de funcionalidades", () => {
    const result = analyzeTraditional(
      "Necesitamos agregar exportación PDF"
    );

    expect(result.category).toBe("FEATURE");
  });

  test("Debe identificar vulnerabilidades", () => {
    const result = analyzeTraditional(
      "Detecté una vulnerabilidad en el sistema"
    );

    expect(result.category).toBe("SECURITY");
    expect(result.requiresHumanReview).toBe(true);
  });

  test("Debe asignar prioridad crítica a filtraciones", () => {
    const result = analyzeTraditional(
      "Se filtraron datos personales de clientes"
    );

    expect(result.priority).toBe("CRITICAL");
  });

  test("Debe devolver el contrato esperado", () => {
    const result = analyzeTraditional(
      "No puedo iniciar sesión"
    );

    expect(Object.keys(result)).toEqual([
      "category",
      "priority",
      "response",
      "requiresHumanReview",
      "mode"
    ]);
  });

});
