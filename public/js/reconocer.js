// Reconoce procesadores y placas de video dentro del texto de requisitos de Steam
// y les asigna un índice de rendimiento (misma escala que catalogo.js: RTX 3060 = 100, Ryzen 5 5600 = 100).
// Los índices son aproximados; los de CPU que no están en el catálogo se estiman por generación y gama.

// Modelos viejos que no están en el catálogo pero aparecen en requisitos; el resto sale de catalogo.js.
const GPU_INDICE = {
  'nv-460': 10, 'nv-550-ti': 9, 'nv-560': 11, 'nv-560-ti': 12, 'nv-570': 14, 'nv-580': 16,
  'nv-650': 9, 'nv-650-ti': 12, 'nv-660': 18, 'nv-660-ti': 21, 'nv-670': 25, 'nv-680': 27,
  'nv-740': 8, 'nv-750': 14, 'nv-750-ti': 17, 'nv-760': 22, 'nv-770': 27, 'nv-780': 32,
  'amd-hd-5770': 8, 'amd-hd-6770': 9, 'amd-hd-6850': 11, 'amd-hd-6870': 13, 'amd-hd-6950': 15, 'amd-hd-6970': 16,
  'amd-hd-7750': 10, 'amd-hd-7770': 12, 'amd-hd-7790': 15, 'amd-hd-7850': 18, 'amd-hd-7870': 21, 'amd-hd-7950': 26, 'amd-hd-7970': 29,
  'amd-r9-270': 20, 'amd-r9-270x': 22, 'amd-r9-280': 28, 'amd-r9-280x': 30, 'amd-r9-290': 38, 'amd-r9-290x': 40, 'amd-r9-380': 30, 'amd-r9-390': 42,
  'amd-vega-11': 14, 'intel-igpu': 4,
  ...Object.fromEntries(GPUS.map((g) => [g.clave, g.score])),
};

const normalizar = (t) => t.toLowerCase()
  .replace(/[®™]/g, '')
  .replace(/[-_]/g, ' ')
  .replace(/(\d)\s*gb/g, '$1gb')
  .replace(/\s+/g, ' ')
  .trim();

// Parte "GTX 1060 6GB or RX 580 / Arc A380" en alternativas.
const alternativas = (texto) => normalizar(texto).split(/\s+or\s+|\s+o\s+|\s*\/\s*|\s*,\s*|\s*;\s*|\s+y\s+/).filter(Boolean);

// Devuelve { clave, texto } con el modelo encontrado, o null.
function claveGPU(alt) {
  let m;
  const r = (clave) => ({ clave, texto: m ? m[0].trim() : alt });
  if ((m = alt.match(/\barc\s*([ab]\d{3})\b/))) return r(`intel-${m[1]}`);
  if ((m = alt.match(/\b(?:intel\s+)?iris\s*xe\b/))) return r('intel-iris-xe');
  if ((m = alt.match(/\b(?:intel\s+)?(?:uhd|iris|intel\s+(?:hd|graphics))\b(?:\s*graphics)?(?:\s*\d{3,4})?/)) && !/radeon|amd/.test(alt)) return r('intel-igpu');
  if ((m = alt.match(/\bradeon\s*(\d{3}m)\b/))) return r(`amd-${m[1]}`);
  if ((m = alt.match(/\b(?:rx\s*)?vega\s*(\d{1,2})\b/))) return r(`amd-vega-${m[1]}`);
  if ((m = alt.match(/\br9\s*(\d{3}x?)\b/))) return r(`amd-r9-${m[1]}`);
  if ((m = alt.match(/\bhd\s*(\d{4})\b/))) return r(`amd-hd-${m[1]}`);
  if ((m = alt.match(/\brx\s*(\d{3,4})\s*(xtx|xt|gre)?\b/))) return r(`amd-${m[1]}${m[2] ? '-' + m[2] : ''}`);
  if ((m = alt.match(/\b(?:gtx|rtx|gt|geforce|nvidia)\s*(?:geforce\s*)?(?:gtx|rtx|gt)?\s*(\d{3,4})(?:\s*(ti|super))?(?:\s*(ti|super))?(?:\s*(\d+)gb)?/))) {
    const sufijo = [m[2], m[3]].filter(Boolean).join('-');
    let clave = `nv-${m[1]}${sufijo ? '-' + sufijo : ''}`;
    if (m[1] === '1060' && m[4] === '3') clave = 'nv-1060-3';
    return r(clave);
  }
  return null;
}

const INTEL_BASE = { 1: 20, 2: 28, 3: 31, 4: 36, 5: 38, 6: 46, 7: 50, 8: 58, 9: 62, 10: 72, 11: 80, 12: 100, 13: 115, 14: 120 };
const INTEL_GAMA = { 3: 0.75, 5: 1, 7: 1.15, 9: 1.25 };
const RYZEN_BASE = { 1: 48, 2: 55, 3: 72, 4: 78, 5: 100, 7: 130, 8: 130, 9: 150 };
const RYZEN_GAMA = { 3: 0.8, 5: 1, 7: 1.08, 9: 1.12 };

function claveCPU(alt) {
  let m;
  if ((m = alt.match(/\b(?:intel\s+)?(?:core\s+)?ultra\s*([579])\s*(\d{3})([a-z]*)\b/))) return { marca: 'ultra', gama: +m[1], num: m[2], suf: m[3], texto: m[0] };
  if ((m = alt.match(/\b(?:intel\s+)?(?:core\s+)?i([3579])\s*(\d{3,5})([a-z]*)\b/))) return { marca: 'intel', gama: +m[1], num: m[2], suf: m[3], texto: m[0] };
  if ((m = alt.match(/\b(?:amd\s+)?(?:ryzen\s*|r)([3579])\s*(?:pro\s*)?(\d{4})([a-z0-9]*)\b/))) return { marca: 'amd', gama: +m[1], num: m[2], suf: m[3], texto: m[0] };
  if ((m = alt.match(/\b(?:amd\s+)?fx\s*(\d{4})\b/))) return { marca: 'fx', num: m[1], texto: m[0] };
  return null;
}

const clavesIguales = (a, b) => a && b && a.marca === b.marca && a.gama === b.gama && a.num === b.num && a.suf === b.suf;

function indiceCPU(k) {
  const enCatalogo = CPUS.find((c) => clavesIguales(claveCPU(normalizar(c.nombre)), k));
  if (enCatalogo) return enCatalogo.score;
  if (k.marca === 'ultra') return Math.round(140 * INTEL_GAMA[k.gama]);
  if (k.marca === 'fx') return k.num >= 8000 ? 28 : k.num >= 6000 ? 22 : 18;
  if (k.marca === 'intel') {
    const gen = k.num.length === 3 ? 1 : k.num.length === 5 ? +k.num.slice(0, 2) : +k.num[0];
    let s = (INTEL_BASE[gen] || 40) * INTEL_GAMA[k.gama];
    if (/k/.test(k.suf)) s *= 1.08;
    if (/u/.test(k.suf)) s *= 0.6;
    return Math.round(s);
  }
  let s = (RYZEN_BASE[+k.num[0]] || 60) * RYZEN_GAMA[k.gama];
  if (/x3d/.test(k.suf)) s *= 1.25;
  else if (/x/.test(k.suf)) s *= 1.03;
  if (/u/.test(k.suf)) s *= 0.6;
  else if (/h/.test(k.suf)) s *= 0.85;
  return Math.round(s);
}

/**
 * Lee un texto de requisitos y devuelve lo reconocido:
 * { indice: el menor índice entre las alternativas (el umbral), modelos: [{texto, indice}] }
 */
function reconocer(texto, tipo) {
  if (!texto) return null;
  const modelos = [];
  for (const alt of alternativas(texto)) {
    if (tipo === 'gpu') {
      const k = claveGPU(alt);
      if (k && GPU_INDICE[k.clave] != null) modelos.push({ texto: k.texto, indice: GPU_INDICE[k.clave] });
    } else {
      const k = claveCPU(alt);
      if (k) modelos.push({ texto: k.texto, indice: indiceCPU(k) });
    }
  }
  if (!modelos.length) return null;
  return { indice: Math.min(...modelos.map((x) => x.indice)), modelos };
}

const numeroGB = (texto) => {
  const m = texto && normalizar(texto).match(/(\d+(?:[.,]\d+)?)\s*gb/);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
};
const pideSSD = (req) => !!req && /\bssd\b/i.test(`${req.disco || ''} ${req.notas || ''}`) && !/ssd\s*(recomendado|recommended)/i.test(`${req.disco || ''} ${req.notas || ''}`);
