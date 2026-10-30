// Compara la estimación de FPS con mediciones reales y sugiere cómo ajustar los factores.
//
// Uso (con la app corriendo en otra terminal: php artisan serve):
//   node scripts/calibrar.mjs [archivo.csv] [--max-error=30]
//
// El CSV (por defecto database/calibracion/mediciones.csv) tiene una medición por fila:
//   steam_id, juego, cpu (id de catalogo.js), gpu (id de catalogo.js), ram (GB),
//   resolucion (1080p | 1440p | 4K), calidad (Baja | Media | Alta | Ultra), fps_medido (promedio), fuente
// Con --max-error=N termina con error si el error medio supera N %: sirve como prueba de regresión.
import { readFileSync } from 'node:fs';
import { cargarScripts } from '../tests/js/cargar.mjs';

const args = process.argv.slice(2);
const archivo = args.find((a) => !a.startsWith('--')) ?? 'database/calibracion/mediciones.csv';
const maxError = Number(args.find((a) => a.startsWith('--max-error='))?.split('=')[1]) || null;
const BASE = process.env.APP_URL ?? 'http://localhost:8000';

const js = cargarScripts();

function leerCSV(ruta) {
  const [cabecera, ...lineas] = readFileSync(ruta, 'utf8').trim().split(/\r?\n/).filter((l) => l && !l.startsWith('#'));
  const campos = cabecera.split(',').map((c) => c.trim());
  return lineas.map((l, i) => {
    const valores = l.split(',').map((v) => v.trim());
    return { fila: i + 2, ...Object.fromEntries(campos.map((c, j) => [c, valores[j]])) };
  });
}

// La ficha sale de la propia app, así se calibra exactamente lo que ve el usuario.
const fichas = new Map();
async function ficha(steamId) {
  if (!fichas.has(steamId)) {
    const r = await fetch(`${BASE}/juego/${steamId}/datos`, { headers: { Accept: 'application/json' } });
    if (!r.ok) throw new Error(`la app respondió ${r.status} para el juego ${steamId}`);
    fichas.set(steamId, await r.json());
  }
  return fichas.get(steamId);
}

const filas = leerCSV(archivo);
if (!filas.length) {
  console.log(`No hay mediciones en ${archivo}. Cargá al menos unas 30 filas antes de sacar conclusiones.`);
  process.exit(0);
}

const resultados = [];
for (const f of filas) {
  const cpu = js.porId(js.CPUS, f.cpu);
  const gpu = js.porId(js.GPUS, f.gpu);
  if (!cpu || !gpu) { console.warn(`Fila ${f.fila}: componente desconocido (${!cpu ? f.cpu : f.gpu}), se omite.`); continue; }
  if (!(f.resolucion in js.RESOLUCIONES) || !(f.calidad in js.CALIDADES)) { console.warn(`Fila ${f.fila}: resolución o calidad inválida, se omite.`); continue; }

  let juego;
  try { juego = await ficha(f.steam_id); } catch (e) { console.warn(`Fila ${f.fila}: ${e.message}, se omite.`); continue; }
  const { perfil } = js.analizarRequisitos(juego);
  if (!perfil) { console.warn(`Fila ${f.fila}: ${f.juego} no tiene placa reconocible en los requisitos, se omite.`); continue; }

  const e = js.estimarFPS({ cpu, gpu, ram: Number(f.ram) }, perfil, f.resolucion, f.calidad);
  const medido = Number(f.fps_medido);
  resultados.push({ ...f, estimado: e.medio, medido, limita: e.limita, ratio: medido / e.medio });
}

if (!resultados.length) { console.log('Ninguna fila se pudo evaluar.'); process.exit(1); }

const pct = (x) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(0)} %`;
const mediaGeo = (xs) => Math.exp(xs.reduce((s, x) => s + Math.log(x), 0) / xs.length);

console.log('\nFila  Juego                      GPU          Res    Calidad  Medido  Estimado  Desvío  Limita');
for (const r of resultados) {
  console.log(`${String(r.fila).padEnd(5)} ${r.juego.slice(0, 26).padEnd(26)} ${r.gpu.padEnd(12)} ${r.resolucion.padEnd(6)} ${r.calidad.padEnd(8)} ${String(r.medido).padStart(6)}  ${String(r.estimado).padStart(8)}  ${pct(r.medido / r.estimado - 1).padStart(6)}  ${r.limita}`);
}

const errorMedio = resultados.reduce((s, r) => s + Math.abs(r.medido - r.estimado) / r.medido, 0) / resultados.length;
console.log(`\nError medio absoluto: ${(errorMedio * 100).toFixed(1)} % sobre ${resultados.length} mediciones.`);

// Sesgo por grupo: si una resolución da sistemáticamente de más o de menos, su factor está mal.
// Factor sugerido = factor actual × media geométrica de (medido / estimado) del grupo.
// Solo filas limitadas por la placa de video, porque los factores de resolución y calidad solo afectan a la GPU.
function sesgo(titulo, clave, factores) {
  console.log(`\n${titulo} (solo filas limitadas por la placa de video)`);
  for (const [valor, actual] of Object.entries(factores)) {
    const grupo = resultados.filter((r) => r[clave] === valor && r.limita === 'Placa de video');
    if (grupo.length < 3) { console.log(`  ${valor.padEnd(6)} pocas mediciones (${grupo.length})`); continue; }
    const g = mediaGeo(grupo.map((r) => r.ratio));
    console.log(`  ${valor.padEnd(6)} sesgo ${pct(g - 1).padStart(6)}  factor actual ${actual}  →  sugerido ${(actual * g).toFixed(2)}  (${grupo.length} mediciones)`);
  }
}
sesgo('Resolución', 'resolucion', js.RESOLUCIONES);
sesgo('Calidad', 'calidad', js.CALIDADES);

// Sesgo por juego: si un juego entero da de más o de menos, falla el supuesto de reconocer.js
// (GPU recomendada ≈ 60 FPS en 1080p Alta) para ese juego.
console.log('\nPor juego');
const porJuego = Object.groupBy(resultados, (r) => r.juego);
for (const [juego, grupo] of Object.entries(porJuego)) {
  console.log(`  ${juego.slice(0, 30).padEnd(30)} sesgo ${pct(mediaGeo(grupo.map((r) => r.ratio)) - 1).padStart(6)}  (${grupo.length} mediciones)`);
}

if (maxError && errorMedio * 100 > maxError) {
  console.error(`\nEl error medio supera el ${maxError} % permitido.`);
  process.exit(1);
}
