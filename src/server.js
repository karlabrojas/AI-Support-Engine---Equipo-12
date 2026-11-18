const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`AI Support Engine ejecutándose en puerto ${PORT}`);
});
