const form = document.querySelector("#analyze-form");
const messageInput = document.querySelector("#message");
const countLabel = document.querySelector("#character-count");
const submitButton = document.querySelector("#analyze-button");
const buttonLabel = submitButton.querySelector(".button-label");
const statusMessage = document.querySelector("#request-status");
const results = document.querySelector("#results");

const categoryLabels = {
  ACCESS: "Acceso",
  BUG: "Error",
  FEATURE: "Mejora",
  SECURITY: "Seguridad"
};
const priorityLabels = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica"
};
const modeLabels = {
  traditional: "Tradicional",
  generative: "Generativo"
};

messageInput.addEventListener("input", () => {
  countLabel.textContent = `${messageInput.value.length} / 5000`;
});

document.querySelectorAll(".example-chip").forEach(button => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.message;
    countLabel.textContent = `${messageInput.value.length} / 5000`;
    messageInput.focus();
  });
});

function createMetric(label, value, className) {
  const metric = document.createElement("div");
  metric.className = "metric";
  const metricLabel = document.createElement("span");
  metricLabel.className = "metric-label";
  metricLabel.textContent = label;
  const metricValue = document.createElement("span");
  metricValue.className = `metric-value ${className}`;
  metricValue.textContent = value;
  metric.append(metricLabel, metricValue);
  return metric;
}

function createResultCard(title, result, errorMessage) {
  const card = document.createElement("article");
  card.className = "result-card";

  const header = document.createElement("div");
  header.className = "result-card-header";
  const heading = document.createElement("h3");
  heading.textContent = title;
  header.append(heading);

  const tag = document.createElement("span");
  tag.className = "engine-tag";
  const engineMode = result
    ? result.mode
    : title.toLowerCase().includes("generativo")
      ? "generative"
      : "traditional";
  tag.textContent = modeLabels[engineMode] || title;
  header.append(tag);
  card.append(header);

  if (errorMessage) {
    const error = document.createElement("div");
    error.className = "card-error";
    const errorTitle = document.createElement("strong");
    errorTitle.textContent = "No se pudo completar el análisis";
    const errorText = document.createElement("p");
    errorText.textContent = errorMessage;
    error.append(errorTitle, errorText);
    card.append(error);
    return card;
  }

  const metrics = document.createElement("div");
  metrics.className = "result-metrics";
  metrics.append(
    createMetric("Categoría", categoryLabels[result.category] || result.category, `category-${result.category.toLowerCase()}`),
    createMetric("Prioridad", priorityLabels[result.priority] || result.priority, `priority-${result.priority.toLowerCase()}`)
  );
  card.append(metrics);

  const responseBlock = document.createElement("div");
  responseBlock.className = "response-block";
  const responseHeading = document.createElement("h4");
  responseHeading.textContent = "Respuesta sugerida";
  const responseText = document.createElement("p");
  responseText.textContent = result.response;
  responseBlock.append(responseHeading, responseText);
  card.append(responseBlock);

  if (result.requiresHumanReview) {
    const notice = document.createElement("div");
    notice.className = "review-notice";
    const icon = document.createElement("span");
    icon.className = "review-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "!";
    const noticeText = document.createElement("span");
    const noticeTitle = document.createElement("strong");
    noticeTitle.textContent = "Revisión humana requerida";
    noticeText.append(noticeTitle, document.createTextNode("Este posible incidente de seguridad debe escalarse al equipo especializado."));
    notice.append(icon, noticeText);
    card.append(notice);
  }

  return card;
}

function showResults(items, compare) {
  const grid = document.createElement("div");
  grid.className = compare ? "result-grid compare-grid" : "result-grid";
  items.forEach(item => {
    grid.append(createResultCard(item.title, item.result, item.error));
  });
  results.replaceChildren(grid);
}

async function analyze(message, mode) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode })
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`El servidor devolvió una respuesta inválida (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    if (response.status === 502) {
      throw new Error("No se pudo conectar con el motor generativo. Verifica que Ollama esté abierto y que el modelo configurado esté instalado.");
    }

    const detail = Array.isArray(data.details)
      ? data.details.map(item => item.message).join(" ")
      : data.error;
    throw new Error(detail || `La solicitud falló (HTTP ${response.status}).`);
  }

  return data;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const message = messageInput.value.trim();
  if (!message) {
    messageInput.setCustomValidity("Escribe un mensaje antes de analizar.");
    messageInput.reportValidity();
    messageInput.setCustomValidity("");
    return;
  }

  const selectedMode = form.querySelector('input[name="mode"]:checked').value;
  const compare = selectedMode === "compare";
  const modes = compare ? ["traditional", "generative"] : [selectedMode];
  const labels = compare ? ["Motor tradicional", "Motor generativo"] : [modeLabels[selectedMode]];
  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  buttonLabel.textContent = compare ? "Comparando motores..." : "Analizando solicitud...";
  statusMessage.className = "request-status";
  statusMessage.textContent = compare
    ? "Ejecutando ambos motores. El generativo puede tardar un momento."
    : selectedMode === "generative"
      ? "Consultando Ollama. Esto puede tardar un momento."
      : "Clasificando tu solicitud...";

  try {
    const responses = await Promise.all(modes.map(async (mode, index) => {
      try {
        return { title: labels[index], result: await analyze(message, mode) };
      } catch (error) {
        return { title: labels[index], error: error.message };
      }
    }));

    showResults(responses, compare);
    const failures = responses.filter(item => item.error).length;
    statusMessage.className = failures ? "request-status error" : "request-status";
    if (failures === responses.length) {
      statusMessage.textContent = "No se pudo obtener ningún resultado. Revisa la conexión con el servidor y Ollama.";
    } else if (failures) {
      statusMessage.textContent = "El análisis terminó con un error en uno de los motores; revisa el resultado.";
    } else {
      statusMessage.textContent = "Análisis completado correctamente.";
    }
  } catch {
    statusMessage.className = "request-status error";
    statusMessage.textContent = "No fue posible conectar con la API. Comprueba que el servidor esté ejecutándose.";
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    buttonLabel.textContent = "Analizar solicitud";
  }
});
