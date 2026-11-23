const request = require("supertest");
const app = require("../src/app");

describe("Web interface", () => {
  test("Debe servir la interfaz en la ruta raíz", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text\/html/);
    expect(response.text).toContain("AI Support Engine");
    expect(response.text).toContain("Comparar ambos");
  });

  test("Debe servir los recursos estáticos de la interfaz", async () => {
    const [script, stylesheet] = await Promise.all([
      request(app).get("/app.js"),
      request(app).get("/styles.css")
    ]);

    expect(script.status).toBe(200);
    expect(script.headers["content-type"]).toMatch(/javascript/);
    expect(script.text).toContain("/api/analyze");
    expect(stylesheet.status).toBe(200);
    expect(stylesheet.headers["content-type"]).toMatch(/css/);
  });
});
