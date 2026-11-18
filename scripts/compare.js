'use strict';
// Comparativa de motores: node scripts/compare.js [--skip-generative]
// Genera results/comparison.md y results/comparison.json
try { require('dotenv').config({ quiet: true }); } catch { /* sin dotenv */ }
const fs = require('node:fs');
const path = require('node:path');
const cases = require('./cases');
const { analyzeTraditional } = require('../src/services/traditional.engine');

const CATEGORIES = ['ACCESS', 'BUG', 'FEATURE', 'SECURITY'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const skipGenerative = process.argv.includes('--skip-generative');

function checkContract(o, mode) {
  const e = [];
  if (!o || typeof o !== 'object' || Array.isArray(o)) return ['no es un objeto'];
  if (!CATEGORIES.includes(o.category)) e.push('category inválida');
  if (!PRIORITIES.includes(o.priority)) e.push('priority inválida');
  if (typeof o.response !== 'string' || !o.response.trim()) e.push('response vacía');
  if (typeof o.requiresHumanReview !== 'boolean') e.push('requiresHumanReview no es booleano');
  if (o.mode !== mode) e.push('mode debe ser ' + mode);
  return e;
}

async function run(mode, message, expected) {
  const t0 = Date.now();
  const empty = { category: null, priority: null, review: null, formatOk: false, categoryOk: false, exactOk: false };
  try {
    const r = mode === 'traditional'
      ? analyzeTraditional(message)
      : await require('../src/services/generative.engine').analyzeGenerative(message);
    const errs = checkContract(r, mode);
    const formatOk = errs.length === 0;
    const categoryOk = formatOk && r.category === expected.category;
    return {
      category: r.category ?? null, priority: r.priority ?? null, review: r.requiresHumanReview ?? null,
      formatOk, categoryOk, exactOk: categoryOk && r.priority === expected.priority,
      note: errs.join(', '), ms: Date.now() - t0,
    };
  } catch (err) {
    return { ...empty, note: String(err.message || 'ERROR').split('\n')[0].slice(0, 80), ms: Date.now() - t0 };
  }
}

const pct = (n, t) => (t ? ((n / t) * 100).toFixed(1) + '%' : '0.0%');
const mark = (v) => (v ? 'OK' : 'X');
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const label = (e) => (e.category ? `${e.category}/${e.priority}${e.review ? ' (rev)' : ''}${e.note ? ' [' + e.note + ']' : ''}` : 'ERROR: ' + e.note);

function summarize(rows, key) {
  const n = rows.length;
  const c = (f) => rows.filter((r) => f(r[key])).length;
  const adv = rows.filter((r) => r.type === 'adversarial');
  return {
    total: n, formatOk: c((e) => e.formatOk), categoryOk: c((e) => e.categoryOk), exactOk: c((e) => e.exactOk),
    advTotal: adv.length, advOk: adv.filter((r) => r[key].categoryOk).length,
    avgMs: Math.round(rows.reduce((s, r) => s + r[key].ms, 0) / (n || 1)),
  };
}

async function main() {
  const rows = [];
  for (const c of cases) {
    const trad = await run('traditional', c.message, c.expected);
    const gen = skipGenerative
      ? { category: null, priority: null, review: null, formatOk: false, categoryOk: false, exactOk: false, note: 'omitido', ms: 0 }
      : await run('generative', c.message, c.expected);
    rows.push({ id: c.id, type: c.type, message: c.message, expected: c.expected, traditional: trad, generative: gen });
    console.log(`#${String(c.id).padStart(2)} [${c.type}] ref=${c.expected.category}/${c.expected.priority}  trad=${label(trad)} ${mark(trad.categoryOk)}  gen=${label(gen)} ${mark(gen.categoryOk)}`);
  }
  const t = summarize(rows, 'traditional');
  const g = summarize(rows, 'generative');

  const L = [];
  L.push('# Resultados comparativos', '', `Fecha: ${new Date().toISOString()} · Casos: ${rows.length}`, '');
  L.push('Criterios: **Categoría correcta** = coincide con la referencia definida antes de ejecutar. **Exacto** = categoría y prioridad. **Formato** = cumple el contrato (5 claves, tipos y valores válidos). (rev) = requiere revisión humana.', '');
  L.push('| # | Tipo | Mensaje | Referencia | Tradicional | Fmt | OK | Generativo | Fmt | OK |');
  L.push('|---|------|---------|------------|-------------|-----|----|------------|-----|----|');
  for (const r of rows) {
    const m = r.message.length > 70 ? r.message.slice(0, 67) + '...' : r.message;
    L.push(`| ${r.id} | ${r.type} | ${esc(m)} | ${r.expected.category}/${r.expected.priority} | ${esc(label(r.traditional))} | ${mark(r.traditional.formatOk)} | ${mark(r.traditional.categoryOk)} | ${esc(label(r.generative))} | ${mark(r.generative.formatOk)} | ${mark(r.generative.categoryOk)} |`);
  }
  L.push('', '## Resumen', '', '| Métrica | Tradicional | Generativo |', '|---------|-------------|------------|');
  L.push(`| Clasificaciones correctas (categoría) | ${t.categoryOk}/${t.total} = **${pct(t.categoryOk, t.total)}** | ${g.categoryOk}/${g.total} = **${pct(g.categoryOk, g.total)}** |`);
  L.push(`| Exactas (categoría + prioridad) | ${t.exactOk}/${t.total} = ${pct(t.exactOk, t.total)} | ${g.exactOk}/${g.total} = ${pct(g.exactOk, g.total)} |`);
  L.push(`| Cumple el formato | ${t.formatOk}/${t.total} = ${pct(t.formatOk, t.total)} | ${g.formatOk}/${g.total} = ${pct(g.formatOk, g.total)} |`);
  L.push(`| Correctas en casos adversariales | ${t.advOk}/${t.advTotal} | ${g.advOk}/${g.advTotal} |`);
  L.push(`| Latencia media | ${t.avgMs} ms | ${g.avgMs} ms |`, '');
  L.push('## Conclusión técnica (máx. 150 palabras)', '', '_Redáctenla a partir de la tabla: qué motor funcionó mejor, en qué casos falló cada uno y por qué._', '');

  const dir = path.join(__dirname, '..', 'results');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'comparison.md'), L.join('\n'));
  fs.writeFileSync(path.join(dir, 'comparison.json'), JSON.stringify({ generatedAt: new Date().toISOString(), summary: { traditional: t, generative: g }, rows }, null, 2));
  console.log(`\nTradicional: ${pct(t.categoryOk, t.total)} correctas · Generativo: ${pct(g.categoryOk, g.total)} correctas`);
  console.log('Guardado en results/comparison.md y results/comparison.json');
}

main().catch((e) => { console.error('Error inesperado:', e.message); process.exit(1); });


