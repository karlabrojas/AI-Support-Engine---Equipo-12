const CATEGORIES = {
  SECURITY: [
    "vulnerabilidad",
    "filtracion",
    "filtración",
    "filtraron",
    "datos filtrados",
    "se filtraron datos",
    "acceso no autorizado",
    "ataque",
    "robo de datos",
    "credenciales robadas",
    "exposicion de datos",
    "exposición de datos",
    "datos personales expuestos"
 ],
  ACCESS: [
    "contraseña",
    "password",
    "login",
    "iniciar sesion",
    "iniciar sesión",
    "no puedo acceder",
    "credenciales",
    "recuperar cuenta"
  ],
  BUG: [
    "error",
    "falla",
    "crash",
    "no funciona",
    "se cierra",
    "excepcion",
    "excepción",
    "no carga"
  ],
  FEATURE: [
    "agregar",
    "implementar",
    "nueva funcionalidad",
    "nueva caracteristica",
    "nueva característica",
    "mejora",
    "solicito una funcion",
    "solicito una función"
  ]
};

const RESPONSES = {
  SECURITY:
    "Hemos identificado un posible incidente de seguridad. El caso será escalado al equipo especializado para su revisión inmediata.",
  ACCESS:
    "Lamentamos el inconveniente. Verifique sus credenciales y utilice la recuperación de contraseña si es necesario.",
  BUG:
    "Gracias por reportar el problema. Nuestro equipo revisará el error para identificar y solucionar la causa.",
  FEATURE:
    "Gracias por compartir su propuesta. La solicitud será evaluada por nuestro equipo de producto."
};

function normalizeText(message) {
  return message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classifyCategory(message) {
  const normalized = normalizeText(message);

  for (const category of Object.keys(CATEGORIES)) {
    const keywords = CATEGORIES[category];

    if (keywords.some(keyword =>
      normalized.includes(normalizeText(keyword))
    )) {
      return category;
    }
  }

  return "BUG";
}


function classifyPriority(message, category) {
  const normalized = normalizeText(message);

  if (category === "SECURITY") {
    const criticalKeywords = [
      "filtracion",
      "filtraron",
      "datos filtrados",
      "filtracion de datos",
      "robo de datos",
      "credenciales robadas",
      "acceso no autorizado",
      "exposicion de datos",
      "datos personales expuestos"
    ];

    if (criticalKeywords.some(keyword =>
      normalized.includes(keyword)
    )) {
      return "CRITICAL";
    }

    return "HIGH";
  }

  if (
    normalized.includes("todos los usuarios") ||
    normalized.includes("servicio caido") ||
    normalized.includes("no funciona para nadie")
  ) {
    return "HIGH";
  }

  if (
    normalized.includes("no puedo") ||
    normalized.includes("no funciona") ||
    normalized.includes("error") ||
    normalized.includes("falla")
  ) {
    return "MEDIUM";
  }

  return "LOW";
}


function analyzeTraditional(message) {
  const category = classifyCategory(message);
  const priority = classifyPriority(message, category);

  return {
    category,
    priority,
    response: RESPONSES[category],
    requiresHumanReview: category === "SECURITY",
    mode: "traditional"
  };
}

module.exports = {
  analyzeTraditional,
  classifyCategory,
  classifyPriority
};
