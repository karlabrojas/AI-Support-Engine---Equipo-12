# AI Support Engine

## Integrantes del equipo

- Karla Beatriz Rojas Rojas | 3523110235
- Angel Romero Barragan | 3523110195
- Kevin Ricardo Simon Alfaro | 3523110374

## 1. Descripción del proyecto

AI Support Engine es un prototipo de clasificación y análisis de solicitudes de soporte técnico mediante dos enfoques:

- **Motor tradicional:** utiliza reglas y palabras clave para identificar la categoría y prioridad de una incidencia, y genera una respuesta predefinida.
- **Motor generativo:** utilizará un modelo de inteligencia artificial para interpretar el contexto de las solicitudes, clasificarlas y generar respuestas profesionales y contextualizadas.

El objetivo es comparar ambos enfoques y evaluar su precisión en diferentes escenarios de soporte técnico.

## 2. Objetivo general

Desarrollar una API REST que permita analizar mensajes de soporte técnico mediante un motor tradicional y un motor generativo, devolviendo resultados estructurados y consistentes.

## 3. Alcance del proyecto

El sistema contempla las siguientes funcionalidades:

1. Clasificar solicitudes de soporte técnico.
2. Asignar un nivel de prioridad.
3. Generar respuestas profesionales.
4. Identificar incidentes que requieren revisión humana.
5. Validar las solicitudes recibidas por la API.
6. Manejar errores de procesamiento y respuestas inválidas.
7. Comparar los resultados del motor tradicional y generativo.
8. Evaluar la precisión mediante casos de prueba previamente definidos.

## 4. Categorías de clasificación

| Categoría | Descripción                                                        |
| --------- | ------------------------------------------------------------------ |
| ACCESS    | Problemas de acceso, inicio de sesión y credenciales.              |
| BUG       | Errores, fallas y comportamientos inesperados del sistema.         |
| FEATURE   | Solicitudes de nuevas funcionalidades o mejoras.                   |
| SECURITY  | Vulnerabilidades, filtraciones y posibles incidentes de seguridad. |

## 5. Niveles de prioridad

| Prioridad | Descripción                                                                       |
| --------- | --------------------------------------------------------------------------------- |
| LOW       | Solicitud de bajo impacto.                                                        |
| MEDIUM    | Problema que afecta una funcionalidad o usuario.                                  |
| HIGH      | Problema de impacto importante o que afecta a varios usuarios.                    |
| CRITICAL  | Incidente crítico, especialmente relacionado con seguridad o exposición de datos. |

Los incidentes clasificados como SECURITY deben marcarse para revisión humana.

## 6. Tecnologías utilizadas

| Tecnología | Uso                                                            |
| ---------- | -------------------------------------------------------------- |
| Node.js    | Entorno de ejecución.                                          |
| Express    | Desarrollo de la API REST.                                     |
| JavaScript | Lenguaje de programación.                                      |
| Zod        | Validación de entradas.                                        |
| Jest       | Pruebas unitarias.                                             |
| Supertest  | Pruebas de endpoints HTTP.                                     |
| Nodemon    | Reinicio automático durante el desarrollo.                     |
| Ollama     | Ejecución local del modelo generativo (integración pendiente). |

## 7. Arquitectura del proyecto

```text
AI Support Engine/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── controllers/
│   │   └── analyze.controller.js
│   │
│   ├── routes/
│   │   └── analyze.routes.js
│   │
│   ├── services/
│   │   ├── traditional.engine.js
│   │   ├── generative.engine.js
│   │   ├── ollama.client.js
│   │   └── response.validator.js
│   │
│   └── utils/
│       ├── security.js
│       └── validation.js
│
├── tests/
│   └── traditional.test.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

**Descripción de los componentes:**

- `app.js`: configura Express, middleware y rutas.
- `server.js`: inicia el servidor HTTP.
- `analyze.controller.js`: recibe, valida y procesa las solicitudes.
- `analyze.routes.js`: define el endpoint de análisis.
- `traditional.engine.js`: implementa la clasificación mediante reglas.
- `generative.engine.js`: destinado al procesamiento mediante el modelo generativo.
- `ollama.client.js`: destinado a la comunicación con Ollama.
- `response.validator.js`: destinado a validar las respuestas generadas.
- `security.js`: destinado a las comprobaciones de seguridad.
- `validation.js`: valida los datos recibidos por la API.
- `traditional.test.js`: contiene pruebas del motor tradicional.

## 8. Instalación y configuración

### Requisitos previos

- Node.js instalado.
- npm instalado.
- Git instalado.

### Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd "AI Support Engine"
```

### Instalar dependencias

```bash
npm install
```

### Ejecutar el proyecto

Modo desarrollo:

```bash
npm run dev
```

Modo producción:

```bash
npm start
```

Por defecto, el servidor utiliza el puerto 3000.

## 9. API REST

### Endpoint de análisis

**Método:** POST

**Ruta:**

```text
/api/analyze
```

**URL local:**

```text
http://localhost:3000/api/analyze
```

### Parámetros de entrada

| Campo   | Tipo   | Descripción                                       |
| ------- | ------ | ------------------------------------------------- |
| message | String | Mensaje del usuario que se analizará.             |
| mode    | String | Motor que se utilizará: traditional o generative. |

### Ejemplo de solicitud

```json
{
  "message": "No puedo iniciar sesión",
  "mode": "traditional"
}
```

### Ejemplo de respuesta esperada

```json
{
  "category": "ACCESS",
  "priority": "MEDIUM",
  "response": "Lamentamos el inconveniente. Verifique sus credenciales y utilice la recuperación de contraseña si es necesario.",
  "requiresHumanReview": false,
  "mode": "traditional"
}
```

### Estructura de respuesta

| Campo               | Tipo    | Descripción                         |
| ------------------- | ------- | ----------------------------------- |
| category            | String  | Categoría asignada.                 |
| priority            | String  | Nivel de prioridad.                 |
| response            | String  | Respuesta generada o predefinida.   |
| requiresHumanReview | Boolean | Indica si requiere revisión humana. |
| mode                | String  | Motor utilizado.                    |

**Nota:** El modo `generative` todavía se encuentra pendiente de integración. Actualmente, el controlador devuelve HTTP 501 para ese modo.

## 10. Pruebas

Para ejecutar las pruebas automatizadas:

```bash
npm test
```

Para ejecutar las pruebas en modo de observación:

```bash
npm run test:watch
```

El motor tradicional cuenta con pruebas para:

- Clasificación de solicitudes de acceso.
- Clasificación de errores del sistema.
- Identificación de solicitudes de funcionalidades.
- Detección de incidentes de seguridad.
- Asignación de prioridad crítica.
- Validación de la estructura de respuesta.

La validación completa de la API y la comparación de ambos motores se ampliarán durante las siguientes etapas.

## 11. Estado actual del desarrollo

| Funcionalidad                                | Estado                  |
| -------------------------------------------- | ----------------------- |
| Configuración inicial del proyecto           | Completada              |
| Configuración de Express                     | Completada              |
| Estructura modular del proyecto              | Implementada            |
| Motor tradicional                            | Implementado            |
| Clasificación de cuatro categorías           | Implementada            |
| Asignación de prioridades                    | Implementada            |
| Respuestas predefinidas                      | Implementadas           |
| Validación de entradas con Zod               | Implementada            |
| Endpoint POST /api/analyze                   | Implementado            |
| Pruebas unitarias del motor tradicional      | Implementadas           |
| Verificación integral del endpoint           | Pendiente de corrección |
| Integración del modelo generativo            | Pendiente               |
| Validación de respuestas generativas         | Pendiente               |
| Protección y manejo de errores del proveedor | Pendiente de completar  |
| Casos comparativos de ambos motores          | Pendiente               |
| Cálculo de precisión y exactitud             | Pendiente               |
| Conclusión técnica                           | Pendiente               |

## 12. Seguridad y consideraciones

El sistema contempla las siguientes medidas:

- Validación de los mensajes recibidos.
- Restricción del tamaño de las solicitudes.
- Manejo centralizado de errores.
- Identificación de incidentes de seguridad.
- Revisión humana obligatoria para incidentes clasificados como SECURITY.
- Protección de credenciales y variables de entorno durante la integración generativa.
- Validación de la estructura de las respuestas del modelo.

Estas medidas se completarán y verificarán conforme avance el desarrollo.

## 13. Evaluación comparativa

Como parte del reto, se utilizarán al menos diez casos diferentes para evaluar ambos motores.

Los casos deberán contemplar:

- Solicitudes de acceso.
- Reportes de errores.
- Solicitudes de funcionalidades.
- Incidentes de seguridad.
- Mensajes ambiguos.
- Intentos de prompt injection.

Los resultados se compararán con categorías y prioridades de referencia previamente establecidas.

Se calculará la precisión de cada motor y se documentarán los resultados para determinar sus diferencias y limitaciones.

## 14. Entregables finales

El proyecto deberá incluir:

1. Repositorio funcional.
2. Código fuente de ambos motores.
3. API REST funcional.
4. README con instrucciones de instalación y ejecución.
5. Evidencias de ejecución.
6. Al menos diez casos de prueba comparativos.
7. Tabla de resultados y precisión.
8. Conclusión técnica de máximo 150 palabras.

---

**Proyecto:** AI Support Engine  
**Tipo:** Prototipo de clasificación y análisis de solicitudes de soporte técnico  
**Entorno:** Node.js / Express  
**Estado:** Desarrollo en progreso
