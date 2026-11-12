const express = require("express");
const analyzeRoutes = require("./routes/analyze.routes");

const app = express();

// Middleware para recibir JSON
app.use(express.json({ limit: "10kb" }));

// Ruta principal de análisis
app.use("/api", analyzeRoutes);

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado"
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error("Error interno:", err.message);

  res.status(500).json({
    error: "Error interno del servidor"
  });
});

module.exports = app;
