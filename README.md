# AI Support Engine

Prototipo de clasificación y análisis de solicitudes de soporte técnico con tres enfoques: motor tradicional (reglas), motor generativo (Ollama) y motor de Machine Learning (Python).

## Integrantes del equipo

- Karla Beatriz Rojas Rojas | 3523110235
- Angel Romero Barragan | 3523110195
- Kevin Ricardo Simon Alfaro | 3523110374

## 1. Descripción

La API recibe un mensaje de soporte y devuelve categoría, prioridad, respuesta sugerida y si requiere revisión humana. El objetivo es comparar los enfoques y evaluar su precisión.

| Motor | Modo (`mode`) | Descripción |
| ----- | ------------- | ----------- |
| Tradicional | `traditional` | Reglas y palabras clave. Respuesta predefinida. |
| Generativo | `generative` | Modelo local `llama3.2:3b` con Ollama. Valida el JSON del modelo y redacta datos sensibles. |
| Machine Learning | `machine-learning` | Clasificador scikit-learn servido con FastAPI (`ml-service/`). Prioridad fija: SECURITY = HIGH, el resto = MEDIUM. |

## 2. Categorías y prioridades

| Categoría | Descripción |
| --------- | ----------- |
| ACCESS | Acceso, inicio de sesión y credenciales. |
| BUG | Errores y comportamientos inesperados. |
| FEATURE | Nuevas funcionalidades o mejoras. |
| SECURITY | Vulnerabilidades, filtraciones e incidentes de seguridad. |

Prioridades: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. Los incidentes SECURITY se marcan para revisión humana.

## 3. Tecnologías

Node.js, Express, Zod, Jest, Supertest, Nodemon, Ollama, Python, FastAPI, scikit-learn.

## 4. Estructura

```text
src/            API (app, server, controllers, routes, services, utils)
public/         Interfaz web
ml-service/     Servicio de Machine Learning (FastAPI)
scripts/        Casos de prueba y comparativa de motores
results/        Resultados de la comparativa
tests/          Pruebas automatizadas (Jest)
docs/evidence/  Evidencias de ejecución
```

## 5. Instalación

Requisitos: Node.js, npm, Git, Ollama y (opcional, para el motor ML) Python 3.

```bash
git clone https://github.com/karlabrojas/AI-Support-Engine---Equipo-12.git
cd AI-Support-Engine---Equipo-12
npm install
```

Crear el archivo `.env` a partir de `.env.example`:

```text
PORT=3000
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

Descargar el modelo generativo:

```bash
ollama pull llama3.2:3b
```

## 6. Ejecución

API y interfaz web (puerto 3000):

```bash
npm start
```

Abrir `http://localhost:3000`. Para desarrollo: `npm run dev`.

Servicio de Machine Learning (puerto 8000), en otra terminal:

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

La URL del servicio ML se puede cambiar con la variable `ML_SERVICE_URL` (por defecto `http://127.0.0.1:8000`).

## 7. API REST

`POST /api/analyze`

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| message | String | Mensaje a analizar. |
| mode | String | `traditional`, `generative` o `machine-learning`. |

Ejemplo de solicitud:

```json
{ "message": "No puedo iniciar sesión", "mode": "traditional" }
```

Ejemplo de respuesta:

```json
{
  "category": "ACCESS",
  "priority": "MEDIUM",
  "response": "Lamentamos el inconveniente. Verifique sus credenciales y utilice la recuperación de contraseña si es necesario.",
  "requiresHumanReview": false,
  "mode": "traditional"
}
```

Códigos de error: `400` solicitud inválida, `502` falla del motor generativo o ML, `500` error interno.

## 8. Pruebas

```bash
npm test
```

30 pruebas en 5 suites: motor tradicional, motor generativo, motor ML, seguridad e interfaz.

Comparativa de motores (requiere Ollama iniciado):

```bash
npm run compare
```

## 9. Seguridad

- Validación de entradas con Zod y límite de tamaño de solicitud.
- Validación estricta del JSON que devuelve el modelo generativo.
- Redacción de datos sensibles y protección de credenciales con variables de entorno (`.env` no se sube al repositorio).
- Manejo de errores del proveedor sin exponer detalles internos.
- Revisión humana obligatoria para incidentes SECURITY.
- Pruebas de prompt injection incluidas en los casos comparativos.

## 10. Resultados comparativos

Se evaluaron 16 casos (9 normales, 3 ambiguos y 4 adversariales). Detalle completo en `results/comparison.md`.

| Métrica | Tradicional | Generativo |
| ------- | ----------- | ---------- |
| Categoría correcta | 8/16 = 50.0 % | 11/16 = 68.8 % |
| Exactas (categoría + prioridad) | 6/16 = 37.5 % | 8/16 = 50.0 % |
| Cumple el formato | 16/16 = 100 % | 14/16 = 87.5 % |
| Correctas en casos adversariales | 1/4 | 1/4 |
| Latencia media | 0 ms | 638 ms |

Nota: la comparativa automática cubre los motores tradicional y generativo. El motor ML se verificó con pruebas y evidencias de ejecución.

## 11. Evidencias

La carpeta `docs/evidence/` contiene la salida de `npm test`, la comparativa y las peticiones reales a la API de cada motor.

## 12. Estado

Todos los motores, la interfaz web, las pruebas y la comparativa están integrados en `dev`.