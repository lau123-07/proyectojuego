// Carga los scripts de public/js en un contexto aislado de Node, en el mismo orden que el layout,
// para poder probar los cálculos sin navegador. app.js necesita un "document" mínimo porque al
// final registra DOMContentLoaded; el resto de sus funciones no toca el DOM al cargarse.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ARCHIVOS = ['catalogo.js', 'datos.js', 'reconocer.js', 'analisis.js', 'app.js'];

export function cargarScripts() {
  const ctx = vm.createContext({
    document: { addEventListener() {} },
    location: { search: '' },
    localStorage: { getItem: () => null, setItem() {} },
    console,
  });
  for (const archivo of ARCHIVOS) {
    vm.runInContext(readFileSync(new URL(`../../public/js/${archivo}`, import.meta.url), 'utf8'), ctx, { filename: archivo });
  }
  // Las const de nivel superior no quedan en el objeto global: se leen evaluando una expresión.
  return vm.runInContext(`({
    CPUS, GPUS, RESOLUCIONES, CALIDADES, JUEGOS,
    estimarFPS, nivelFPS, reconocer, analizarRequisitos, porId,
  })`, ctx);
}
