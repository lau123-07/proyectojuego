// Análisis del equipo para un juego: cuello de botella, temperaturas estimadas y mejoras recomendadas.
// Todo parte de la estimación de FPS (estimarFPS) y es orientativo.

/* ---------- Plataforma (socket y memoria) ---------- */

function plataforma(cpu) {
  const id = cpu.id;
  if (id.startsWith('ultra')) return { socket: 'LGA1851', memoria: 'DDR5' };
  if (id.startsWith('fx')) return { socket: 'AM3+', memoria: 'DDR3' };
  let m = id.match(/^i\d-(\d+)/);
  if (m) {
    const gen = m[1].length === 5 ? +m[1].slice(0, 2) : +m[1][0];
    if (gen <= 3) return { socket: 'LGA1155', memoria: 'DDR3' };
    if (gen === 4) return { socket: 'LGA1150', memoria: 'DDR3' };
    if (gen <= 7) return { socket: 'LGA1151', memoria: 'DDR4' };
    if (gen <= 9) return { socket: 'LGA1151 (300)', memoria: 'DDR4' };
    if (gen <= 11) return { socket: 'LGA1200', memoria: 'DDR4' };
    return { socket: 'LGA1700', memoria: 'DDR4 o DDR5 (según la motherboard)' };
  }
  m = id.match(/^r\d-(\d)/);
  return +m[1] >= 7 ? { socket: 'AM5', memoria: 'DDR5' } : { socket: 'AM4', memoria: 'DDR4' };
}

// Series que se consiguen nuevas hoy; las recomendaciones salen de acá.
const SERIES_VIGENTES = [
  'NVIDIA RTX 40', 'NVIDIA RTX 50', 'AMD Radeon RX 7000', 'AMD Radeon RX 9000', 'Intel Arc',
  'AMD Ryzen 5000', 'AMD Ryzen 7000 / 8000', 'AMD Ryzen 9000', 'Intel Core 12.ª gen', 'Intel Core 13.ª gen', 'Intel Core 14.ª gen', 'Intel Core Ultra 200S',
];
const vigente = (x) => SERIES_VIGENTES.includes(x.serie);

function fuenteSugerida(cpu, gpu) {
  const total = cpu.tdp + gpu.tdp;
  const tramos = [[250, 450], [350, 550], [450, 650], [550, 750], [700, 850]];
  return (tramos.find(([t]) => total <= t) || [0, 1000])[1];
}

/* ---------- Cuello de botella ---------- */

function cuelloDeBotella(e) {
  if (e.limita === 'Tope del juego') return { nivel: 'Sin cuello de botella', clase: 'tier-fluido', pct: 0, texto: 'El juego tiene un límite de FPS y tu equipo lo alcanza.' };
  const pct = Math.round((1 - Math.min(e.porGPU, e.porCPU) / Math.max(e.porGPU, e.porCPU)) * 100);
  const quien = e.limita === 'Procesador' ? 'el procesador' : 'la placa de video';
  const otro = e.limita === 'Procesador' ? 'la placa de video' : 'el procesador';
  if (pct < 10) return { nivel: 'Equilibrado', clase: 'tier-fluido', pct, texto: 'Procesador y placa de video rinden parecido: ninguno frena al otro de forma notoria.' };
  if (pct < 25) return { nivel: 'Cuello de botella leve', clase: 'tier-jugable', pct, texto: `Limita ${quien}: ${otro} podría dar un ${pct}% más de FPS.` };
  return { nivel: 'Cuello de botella marcado', clase: 'tier-bajo', pct, texto: `Limita ${quien}: ${otro} queda desaprovechado, podría dar un ${pct}% más de FPS.` };
}

/* ---------- Temperaturas ---------- */

// Supuestos: refrigeración de fábrica o equivalente, gabinete con buen flujo de aire y 25 °C de ambiente.
function temperaturas(cpu, gpu, ram, perfil, res) {
  const integrada = gpu.vram === 0;
  const deltaGPU = gpu.tdp <= 130 ? 30 : gpu.tdp <= 250 ? 37 : 42;
  let deltaCPU = cpu.tdp <= 65 ? 32 : cpu.tdp <= 125 ? 40 : 48;
  if (/^r\d-[79]\d{3}(?!x3d)/.test(cpu.id) && cpu.id.endsWith('x')) deltaCPU += 6; // Ryzen 7000/9000 X: diseñados para trabajar calientes
  if (/^i[79]-1[34]\d{3}k/.test(cpu.id)) deltaCPU += 8; // Core i7/i9 13.ª y 14.ª gen K

  return Object.keys(CALIDADES).map((cal) => {
    const e = estimarFPS({ cpu, gpu, ram }, perfil, res, cal);
    const usoGPU = Math.min(0.99, e.medio / e.porGPU);
    const usoCPU = Math.min(0.95, 0.3 + 0.6 * (e.medio / e.porCPU));
    let tCPU = 38 + usoCPU * deltaCPU;
    if (integrada) tCPU += usoGPU * 8; // la gráfica integrada comparte el disipador del procesador
    const tGPU = 35 + usoGPU * deltaGPU;
    return {
      calidad: cal,
      fps: e,
      usoGPU: Math.round(usoGPU * 100),
      usoCPU: Math.round(usoCPU * 100),
      gpu: integrada ? null : [Math.round(tGPU - 4), Math.round(tGPU + 4)],
      cpu: [Math.round(tCPU - 5), Math.round(tCPU + 5)],
    };
  });
}

const claseTemp = (rango, limite) => (rango[1] >= limite + 8 ? 'tier-bajo' : rango[1] >= limite ? 'tier-aceptable' : 'tier-fluido');

/* ---------- Mejoras recomendadas ---------- */

function recomendaciones({ pc, cpu, gpu, perfil, res, objetivo, req }) {
  const cal = 'Alta';
  const actual = estimarFPS({ cpu, gpu, ram: pc.ram }, perfil, res, cal);
  const lista = [];
  let nuevoCPU = cpu;
  let nuevaGPU = gpu;

  // Placa de video: la de menor rendimiento que por sí sola llega al objetivo (o la más potente si ninguna llega).
  // Se evalúa sin el límite del procesador, que se recomienda aparte.
  if (actual.porGPU < objetivo) {
    const porGPU = (g) => estimarFPS({ cpu: { score: 1e6 }, gpu: g, ram: 64 }, perfil, res, cal).porGPU;
    const candidatas = GPUS.filter((g) => vigente(g) && g.vram > 0 && g.score > gpu.score).sort((a, b) => a.score - b.score);
    const elegida = candidatas.find((g) => porGPU(g) >= objetivo) || candidatas[candidatas.length - 1];
    if (elegida && porGPU(elegida) > actual.porGPU * 1.05) {
      nuevaGPU = elegida;
      const fuente = fuenteSugerida(cpu, elegida);
      lista.push({
        tipo: 'Placa de video', desde: gpu.nombre, hacia: elegida.nombre,
        notas: [
          `${vramTexto(elegida)} · ${elegida.tdp} W`,
          `Fuente sugerida: ${fuente} W o más${elegida.tdp - gpu.tdp > 50 ? '. Revisá también que tu fuente tenga los conectores PCIe necesarios.' : ''}`,
          gpu.vram === 0 ? 'Necesitás una motherboard con ranura PCIe x16 libre y espacio en el gabinete.' : 'Medí el largo de la placa antes de comprar: tiene que entrar en tu gabinete.',
        ],
      });
    }
  }

  // Procesador: primero en el mismo socket (sin cambiar motherboard); si no alcanza, cambio de plataforma.
  if (actual.porCPU < objetivo || (req.cpuEstado === 'bajo')) {
    const mia = plataforma(cpu);
    const tope = (c) => (c.score / 100) * perfil.cpuFps;
    const mejores = CPUS.filter((c) => c.score > cpu.score).sort((a, b) => a.score - b.score);
    const mismoSocket = mejores.filter((c) => plataforma(c).socket === mia.socket);
    const enSocket = mismoSocket.find((c) => tope(c) >= objetivo) || mismoSocket[mismoSocket.length - 1];
    if (enSocket && tope(enSocket) >= objetivo) {
      nuevoCPU = enSocket;
      lista.push({
        tipo: 'Procesador', desde: cpu.nombre, hacia: enSocket.nombre,
        notas: [
          `Mismo socket (${mia.socket}): no hace falta cambiar la motherboard.`,
          mia.socket === 'AM4' ? 'En motherboards AM4 antiguas puede hacer falta actualizar la BIOS antes del cambio.' : `${enSocket.nucleos} núcleos · ${enSocket.hilos} hilos · ${enSocket.tdp} W`,
        ],
      });
    } else {
      const nueva = mejores.filter((c) => vigente(c) && ['AM5', 'LGA1700', 'LGA1851'].includes(plataforma(c).socket)).find((c) => tope(c) >= objetivo);
      if (nueva) {
        nuevoCPU = nueva;
        const p = plataforma(nueva);
        lista.push({
          tipo: 'Procesador y plataforma', desde: cpu.nombre, hacia: nueva.nombre,
          notas: [
            `Tu socket (${mia.socket}) no tiene un procesador que alcance el objetivo: hay que cambiar a una motherboard ${p.socket}.`,
            `Memoria compatible: ${p.memoria}.${mia.memoria !== p.memoria ? ' Tu memoria actual probablemente no sirva.' : ''}`,
            enSocket && tope(enSocket) > tope(cpu) * 1.1 ? `Alternativa sin cambiar motherboard: ${enSocket.nombre}, mejora parcial.` : `${nueva.nucleos} núcleos · ${nueva.hilos} hilos · ${nueva.tdp} W`,
          ],
        });
      }
    }
  }

  // Memoria
  const ramObjetivo = Math.max(req.ramRec || 0, req.ramMin || 0, 16);
  if (pc.ram < ramObjetivo) {
    lista.push({
      tipo: 'Memoria RAM', desde: `${pc.ram} GB`, hacia: `${ramObjetivo} GB`,
      notas: [`Tipo: ${plataforma(nuevoCPU).memoria}.`, 'Mejor en dos módulos iguales (doble canal): rinde más que un solo módulo.'],
    });
  }

  // Almacenamiento
  if (pc.disco === 'hdd' && req.pideSSD) {
    lista.push({
      tipo: 'Almacenamiento', desde: 'HDD', hacia: `SSD${req.espacio ? ` de ${req.espacio >= 500 ? '1 TB' : '500 GB'} o más` : ''}`,
      notas: ['El juego pide SSD: mejora mucho los tiempos de carga y evita tirones al cargar texturas.', 'Un SSD NVMe necesita una ranura M.2 en la motherboard; si no tenés, uno SATA también sirve.'],
    });
  }

  const ramFinal = Math.max(pc.ram, lista.some((x) => x.tipo === 'Memoria RAM') ? ramObjetivo : 0);
  const despues = estimarFPS({ cpu: nuevoCPU, gpu: nuevaGPU, ram: ramFinal }, perfil, res, cal);
  return { actual, despues, lista };
}
