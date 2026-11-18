const PROMPT_INJECTION_PATTERNS = [
  /ignora(?:\s+las)?\s+(?:instrucciones|reglas|restricciones)/i,
  /ignore\s+(?:all\s+)?(?:previous|prior|system)\s+(?:instructions|rules)/i,
  /revela(?:r)?\s+(?:el|tu)\s+(?:prompt|sistema)/i,
  /reve[a]?l\s+(?:your|the)\s+(?:system\s+)?prompt/i,
  /act[u]a\s+como\s+(?:si|un|una)\b/i,
  /(?:developer|jailbreak|dan)\s+mode/i,
  /deshabilita(?:r)?\s+(?:la\s+)?seguridad/i
];

const SENSITIVE_DATA_PATTERNS = [
  /\b(?:password|passwd|contrase(?:n|ñ)a|secret|token|api[_ -]?key|access[_ -]?token|refresh[_ -]?token)\b\s*[:=]\s*[^\s,;]+/gi,
  /\bBearer\s+[A-Za-z0-9._~+\/=-]+/gi,
  /\b-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi
];

function detectPromptInjection(message) {
  if (typeof message !== "string") {
    return false;
  }

  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(message));
}

function sanitizeSensitiveData(message) {
  if (typeof message !== "string") {
    return "";
  }

  return SENSITIVE_DATA_PATTERNS.reduce(
    (sanitized, pattern) => sanitized.replace(pattern, "[DATOS_SENSIBLES_REDACTADOS]"),
    message
  );
}

module.exports = {
  detectPromptInjection,
  sanitizeSensitiveData
};