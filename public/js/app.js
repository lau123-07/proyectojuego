// LoCorre — lógica del prototipo (sin dependencias).

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const porId = (lista, id) => lista.find((x) => x.id === id);
const param = (nombre) => new URLSearchParams(location.search).get(nombre);

const ICONOS = {
  check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  medio: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  abajo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  checkGrande: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  alerta: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5M12 17h.01"/></svg>',
  aviso: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9548" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EB8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
};

/* ---------- Mi PC (guardada en el navegador) ---------- */

function leerPC() {
  try {
    const guardada = JSON.parse(localStorage.getItem('locorre.pc'));
    return { ...PC_POR_DEFECTO, ...(guardada || {}) };
  } catch (e) {
    return { ...PC_POR_DEFECTO };
  }
}

function guardarPC(pc) {
  try { localStorage.setItem('locorre.pc', JSON.stringify(pc)); } catch (e) { /* sin almacenamiento */ }
}

function resumenPC(pc) {
  const cpu = porId(CPUS, pc.cpu);
  const gpu = porId(GPUS, pc.gpu);
  const corto = (n) => n.replace(/^(Intel Core |AMD |NVIDIA GeForce |Intel )/, '');
  return `${corto(cpu.nombre)} · ${corto(gpu.nombre)} · ${pc.ram} GB`;
}

function toast(texto) {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = texto;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- Cálculos ---------- */

// Estimación orientativa: el menor entre lo que permite la GPU, la CPU y el tope del juego.
function estimarFPS({ cpu, gpu, ram }, juego, res, calidad) {
  const porGPU = (gpu.score / 100) * juego.gpuFps * RESOLUCIONES[res] * CALIDADES[calidad];
  const porCPU = (cpu.score / 100) * juego.cpuFps * (calidad === 'Ultra' ? 0.95 : 1);
  let fps = Math.min(porGPU, porCPU);
  let limita = porGPU <= porCPU ? 'Placa de video' : 'Procesador';
  if (ram < juego.min.ram) fps *= 0.75;
  if (juego.tope && fps > juego.tope) { fps = juego.tope; limita = 'Tope del juego'; }
  const medio = Math.round(fps);
  return {
    medio,
    desde: Math.max(1, Math.round(medio * 0.92)),
    hasta: juego.tope ? Math.min(juego.tope, Math.round(medio * 1.08)) : Math.round(medio * 1.08),
    porGPU: Math.round(porGPU),
    porCPU: Math.round(porCPU),
    limita,
  };
}

function nivelFPS(fps) {
  if (fps >= 60) return { clase: 'tier-fluido', texto: 'Fluido' };
  if (fps >= 45) return { clase: 'tier-jugable', texto: 'Jugable' };
  if (fps >= 30) return { clase: 'tier-aceptable', texto: 'Aceptable' };
  return { clase: 'tier-bajo', texto: 'Insuficiente' };
}

function rangoTexto(e) {
  return e.desde === e.hasta ? `${e.medio}` : `${e.desde}–${e.hasta}`;
}

const ESTADOS = {
  rec: { clase: 'status-rec', texto: 'Recomendado', icono: ICONOS.check },
  ok: { clase: 'status-rec', texto: 'Cumple', icono: ICONOS.check },
  min: { clase: 'status-min', texto: 'Mínimo', icono: ICONOS.medio },
  bajo: { clase: 'status-bajo', texto: 'Por debajo', icono: ICONOS.abajo },
  na: { clase: 'status-na', texto: 'Sin comparar', icono: ICONOS.medio },
};

const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function chipEstado(estado) {
  const e = ESTADOS[estado];
  return `<span class="status ${e.clase}">${e.icono}${e.texto}</span>`;
}

/* ---------- Componentes de interfaz ---------- */

// Selector segmentado: <div class="segmented" data-opciones="a,b,c" data-valor="b">
function segmentado(el, alCambiar) {
  const opciones = el.dataset.opciones.split(',');
  const pintar = () => {
    el.innerHTML = opciones.map((o) => `<button type="button" aria-pressed="${o === el.dataset.valor}" data-v="${o}">${o}</button>`).join('');
  };
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    el.dataset.valor = b.dataset.v;
    pintar();
    alCambiar(b.dataset.v);
  });
  pintar();
}

const vramTexto = (g) => (g.vram ? `${g.vram} GB VRAM` : 'Memoria compartida');

function opcionesAgrupadas(lista, seleccion) {
  const series = [...new Set(lista.map((x) => x.serie))];
  return series.map((serie) => `<optgroup label="${serie}">${lista.filter((x) => x.serie === serie).map((x) => `<option value="${x.id}"${x.id === seleccion ? ' selected' : ''}>${x.nombre}</option>`).join('')}</optgroup>`).join('');
}

function opcionesJuegos(seleccion) {
  return JUEGOS.map((j) => `<option value="${j.id}"${j.id === seleccion ? ' selected' : ''}>${j.nombre}</option>`).join('');
}

function barra(pct, alt) {
  return `<div class="bar${alt ? ' alt' : ''}"><span style="width:${Math.max(2, Math.min(100, pct))}%"></span></div>`;
}

function precioHTML(p) {
  if (!p) return '';
  if (!p.descuento) return `<span class="precio"><span class="precio-final">${escapar(p.final)}</span></span>`;
  return `<span class="precio">
    <span class="precio-desc">-${p.descuento}%</span>
    <span class="precio-montos"><s aria-label="Antes ${escapar(p.inicial)}">${escapar(p.inicial)}</s><span class="precio-final">${escapar(p.final)}</span></span>
  </span>`;
}

// Buscador de juegos con sugerencias desde Steam (vía /buscar-juegos).
function buscadorJuegos(form) {
  const input = $('input', form);
  const lista = $('.sugerencias', form);
  let resultados = [];
  let activo = -1;
  let espera;
  let ultimaConsulta = 0;

  const ir = (j) => { location.href = `/juego/${j.id}`; };
  const cerrar = () => { lista.hidden = true; input.setAttribute('aria-expanded', 'false'); activo = -1; };
  const pintar = (estadoTexto) => {
    if (estadoTexto) {
      lista.innerHTML = `<li class="sug-estado">${estadoTexto}</li>`;
    } else {
      lista.innerHTML = resultados.map((j, i) => `
        <li id="sug-${i}" role="option" aria-selected="${i === activo}" data-i="${i}">
          ${j.imagen ? `<img src="${escapar(j.imagen)}" alt="" width="92" height="35" loading="lazy">` : '<span class="sug-img"></span>'}
          <span class="sug-nombre">${escapar(j.nombre)}</span>
          ${j.metascore ? `<span class="sug-meta" title="Metascore">${escapar(j.metascore)}</span>` : ''}
          ${precioHTML(j.precio)}
        </li>`).join('');
    }
    lista.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', activo >= 0 ? `sug-${activo}` : '');
  };

  const consultar = async (texto) => {
    const n = ++ultimaConsulta;
    pintar('Buscando en Steam…');
    try {
      const r = await fetch(`/buscar-juegos?q=${encodeURIComponent(texto)}`, { headers: { Accept: 'application/json' } });
      const datos = await r.json();
      if (n !== ultimaConsulta) return null;
      if (!r.ok) { pintar(escapar(datos.error || 'No pudimos buscar en este momento.')); return null; }
      resultados = datos;
      activo = -1;
      if (resultados.length) pintar(); else pintar('No encontramos juegos con ese nombre en Steam.');
      return resultados;
    } catch (e) {
      if (n === ultimaConsulta) pintar('No pudimos conectar. Revisá tu conexión.');
      return null;
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(espera);
    const t = input.value.trim();
    if (t.length < 2) { resultados = []; cerrar(); return; }
    espera = setTimeout(() => consultar(t), 250);
  });
  input.addEventListener('keydown', (ev) => {
    if (lista.hidden || !resultados.length) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      activo = (activo + (ev.key === 'ArrowDown' ? 1 : -1) + resultados.length) % resultados.length;
      pintar();
    } else if (ev.key === 'Escape') {
      cerrar();
    }
  });
  lista.addEventListener('mousedown', (ev) => {
    const li = ev.target.closest('[data-i]');
    if (li) { ev.preventDefault(); ir(resultados[+li.dataset.i]); }
  });
  input.addEventListener('blur', () => setTimeout(cerrar, 100));
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const t = input.value.trim();
    if (activo >= 0 && resultados[activo]) return ir(resultados[activo]);
    if (t.length < 2) { input.focus(); return; }
    const r = resultados.length ? resultados : await consultar(t);
    if (r && r.length) ir(r[0]);
  });
}

/* ---------- Páginas ---------- */

const paginas = {
  inicio() {
    const pc = leerPC();
    const form = $('#form-pc');
    $('#cpu').innerHTML = opcionesAgrupadas(CPUS, pc.cpu);
    $('#gpu').innerHTML = opcionesAgrupadas(GPUS, pc.gpu);
    $('#ram').value = String(pc.ram);
    $('#disco').value = pc.disco;
    $('#so').value = pc.so;
    const seg = $('#res');
    seg.dataset.valor = pc.res;

    const maxCPU = Math.max(...CPUS.map((c) => c.score));
    const maxGPU = Math.max(...GPUS.map((g) => g.score));

    const actualizar = () => {
      const cpu = porId(CPUS, $('#cpu').value);
      const gpu = porId(GPUS, $('#gpu').value);
      const ram = Number($('#ram').value);
      $('#cpu-hint').textContent = `${cpu.nucleos} núcleos · ${cpu.hilos} hilos · ${cpu.ghz} GHz`;
      $('#gpu-hint').textContent = `${vramTexto(gpu)} · ${gpu.tdp} W`;
      $('#resumen').innerHTML = `
        <div class="meter"><div class="meter-top"><span>Procesador</span><span>Gama ${gamaDe(cpu, 'cpu').toLowerCase()}</span></div>${barra((cpu.score / maxCPU) * 100)}</div>
        <div class="meter"><div class="meter-top"><span>Placa de video</span><span>Gama ${gamaDe(gpu, 'gpu').toLowerCase()}</span></div>${barra((gpu.score / maxGPU) * 100)}</div>
        <div class="meter"><div class="meter-top"><span>Memoria</span><span>${ram >= 32 ? 'De sobra' : ram >= 16 ? 'Suficiente' : 'Justa'}</span></div>${barra((ram / 64) * 100 + 20)}</div>`;
      const debil = cpu.score / maxCPU < gpu.score / maxGPU ? 'El procesador' : 'La placa de video';
      $('#resumen-nota').textContent = `${debil} es el componente que más va a limitar en juegos exigentes.`;
    };

    segmentado(seg, () => {});
    form.addEventListener('change', actualizar);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nueva = { cpu: $('#cpu').value, gpu: $('#gpu').value, ram: Number($('#ram').value), disco: $('#disco').value, so: $('#so').value, res: seg.dataset.valor };
      guardarPC(nueva);
      $('.nav-pc').textContent = resumenPC(nueva);
      toast('Configuración guardada');
    });
    actualizar();
  },

  juego() {
    const pc = leerPC();
    const juego = window.JUEGO;
    const cpu = porId(CPUS, pc.cpu);
    const gpu = porId(GPUS, pc.gpu);
    const miCPU = cpu.score;
    const miGPU = gpu.score;
    const min = juego.min || {};
    const rec = juego.rec || null;

    const req = {
      cpu: [reconocer(min.cpu, 'cpu'), rec && reconocer(rec.cpu, 'cpu')],
      gpu: [reconocer(min.gpu, 'gpu'), rec && reconocer(rec.gpu, 'gpu')],
      ram: [numeroGB(min.ram), rec && numeroGB(rec.ram)],
    };

    // 'rec' supera recomendados · 'ok' cumple (no hay recomendados) · 'min' entre ambos · 'bajo' · 'na' no se pudo comparar
    const estado = (valor, umbralMin, umbralRec) => {
      if (umbralMin == null && umbralRec == null) return 'na';
      if (umbralRec != null && valor >= umbralRec) return 'rec';
      if (umbralMin == null) return 'na';
      if (valor < umbralMin) return 'bajo';
      return umbralRec == null ? 'ok' : 'min';
    };
    const ind = (r) => (r ? r.indice : null);
    const ssd = pc.disco !== 'hdd';
    const estadoDisco = pideSSD(min) && !ssd ? 'bajo' : pideSSD(rec) && !ssd ? 'min' : 'ok';

    const celda = (texto, recon) => {
      if (!texto) return '<span class="muted">Steam no lo especifica</span>';
      const det = recon === undefined ? '' : recon
        ? `<span class="sub">Reconocido: ${recon.modelos.map((m) => m.texto.toUpperCase()).join(' · ')}</span>`
        : '<span class="sub">Sin modelo reconocible</span>';
      return `${escapar(texto)}${det}`;
    };

    const filas = [
      { nombre: 'Procesador', tuyo: cpu.nombre, sub: `${cpu.nucleos} núcleos · ${cpu.hilos} hilos`, min: celda(min.cpu, req.cpu[0]), rec: rec && celda(rec.cpu, req.cpu[1]), estado: estado(miCPU, ind(req.cpu[0]), ind(req.cpu[1])) },
      { nombre: 'Placa de video', tuyo: gpu.nombre, sub: vramTexto(gpu), min: celda(min.gpu, req.gpu[0]), rec: rec && celda(rec.gpu, req.gpu[1]), estado: estado(miGPU, ind(req.gpu[0]), ind(req.gpu[1])) },
      { nombre: 'Memoria RAM', tuyo: `${pc.ram} GB`, min: celda(min.ram), rec: rec && celda(rec.ram), estado: estado(pc.ram, req.ram[0], req.ram[1]) },
      { nombre: 'Almacenamiento', tuyo: DISCOS[pc.disco], min: celda(min.disco), rec: rec && celda(rec.disco), estado: estadoDisco },
      { nombre: 'Sistema operativo', tuyo: pc.so, min: celda(min.so), rec: rec && celda(rec.so), estado: null },
      { nombre: 'DirectX', tuyo: '—', min: celda(min.directx), rec: rec && celda(rec.directx), estado: null },
    ];
    if (min.notas || (rec && rec.notas)) filas.push({ nombre: 'Notas', tuyo: '', min: celda(min.notas), rec: rec && celda(rec.notas), estado: null });

    const estados = filas.map((f) => f.estado).filter(Boolean);
    let veredicto = 'rec';
    if (!juego.min) veredicto = 'na';
    else if (estados.includes('bajo')) veredicto = 'bajo';
    else if (estados.includes('na')) veredicto = 'na';
    else if (estados.includes('min')) veredicto = 'min';

    const textos = {
      rec: ['Tu PC lo corre', rec ? 'Cumple o supera los requisitos recomendados.' : 'Cumple los requisitos publicados.'],
      min: ['Tu PC lo corre', 'Supera los mínimos, pero no todos los recomendados.'],
      bajo: ['Puede tener problemas', 'Algún componente está por debajo de los mínimos.'],
      na: ['Revisá los requisitos', 'No pudimos comparar todos los componentes con los datos de Steam.'],
    };
    const v = $('#veredicto');
    v.className = `verdict verdict-${veredicto === 'na' ? 'min' : veredicto}`;
    v.innerHTML = `<div class="verdict-icon">${veredicto === 'rec' || veredicto === 'min' ? ICONOS.checkGrande : ICONOS.alerta}</div><div><strong>${textos[veredicto][0]}</strong><span>${textos[veredicto][1]}</span></div>`;

    if (!juego.min) {
      $('#requisitos-bloque').innerHTML = '<div class="card empty">Steam no publica requisitos de PC para este título.</div>';
    } else {
      $('#requisitos tbody').innerHTML = filas.map((f) => `
        <tr>
          <th scope="row">${f.nombre}</th>
          <td class="you">${f.tuyo}${f.sub ? `<span class="sub">${f.sub}</span>` : ''}${f.estado ? `<div style="margin-top:10px">${chipEstado(f.estado)}</div>` : ''}</td>
          <td>${f.min}</td>
          <td>${rec ? f.rec : '<span class="muted">Steam no publica recomendados</span>'}</td>
        </tr>`).join('');
    }

    // Avisos según componentes
    const notas = [];
    const [fCPU, fGPU, fRAM, fDisco] = filas;
    if (fGPU.estado === 'bajo') notas.push([ICONOS.aviso, 'Tu placa de video está por debajo del mínimo: es probable que tengas que jugar en calidad Baja o con escalado (DLSS / FSR).']);
    if (fCPU.estado === 'bajo') notas.push([ICONOS.aviso, 'Tu procesador está por debajo del mínimo: puede haber tirones en zonas con muchos personajes.']);
    if (fCPU.estado === 'min') notas.push([ICONOS.info, 'Tu procesador no llega al recomendado. Podría limitar los FPS en escenas con mucha carga, aunque bajes la calidad gráfica.']);
    if (fGPU.estado === 'min') notas.push([ICONOS.info, 'Tu placa de video está entre mínimos y recomendados: apuntá a calidad Media en 1080p.']);
    if (fRAM.estado === 'bajo') notas.push([ICONOS.aviso, `El juego pide al menos ${req.ram[0]} GB de RAM; con menos puede haber cortes y tiempos de carga largos.`]);
    if (fDisco.estado !== 'ok') notas.push([ICONOS.aviso, 'Este juego pide SSD. En un disco rígido (HDD) los tiempos de carga y la carga de texturas empeoran mucho.']);
    if (fCPU.estado === 'na' || fGPU.estado === 'na') notas.push([ICONOS.info, 'Steam describe algún componente de forma genérica o con un modelo que todavía no está en nuestro catálogo, así que no lo pudimos comparar.']);
    if (!notas.length) notas.push([ICONOS.info, 'Ningún componente queda por debajo de lo recomendado. Revisá tener los controladores de video actualizados.']);
    $('#notas').innerHTML = notas.map(([ic, t]) => `<div class="card-inset note">${ic}<p>${t}</p></div>`).join('');

    // FPS: sin benchmarks del juego, se derivan de los requisitos.
    // Supuesto: la GPU recomendada da ~60 FPS en 1080p Alta; la mínima, ~20.
    const gRec = ind(req.gpu[1]), gMin = ind(req.gpu[0]);
    const cRec = ind(req.cpu[1]), cMin = ind(req.cpu[0]);
    if (!gRec && !gMin) {
      $('#fps-bloque').innerHTML = `<div class="card-inset note">${ICONOS.info}<p>No podemos estimar FPS para este juego: Steam no indica una placa de video concreta en sus requisitos.</p></div>`;
      $('#matriz-bloque').hidden = true;
      $('#analisis').hidden = true;
      return;
    }
    const juegoFPS = {
      gpuFps: gRec ? (60 * 100) / gRec : (20 * 100) / gMin,
      cpuFps: cRec ? (90 * 100) / cRec : cMin ? (50 * 100) / cMin : 400,
      tope: null,
      min: { ram: req.ram[0] || 0 },
    };
    const equipo = { cpu: { score: miCPU }, gpu: { score: miGPU }, ram: pc.ram };
    let res = RESOLUCIONES[pc.res] ? pc.res : '1080p';
    let cal = 'Alta';
    const pintarFPS = () => {
      const e = estimarFPS(equipo, juegoFPS, res, cal);
      const n = nivelFPS(e.medio);
      $('#fps-num').textContent = rangoTexto(e);
      $('#fps-nivel').className = `fps-label ${n.clase}`;
      $('#fps-nivel').textContent = n.texto;
      $('#fps-gauge').style.width = `${Math.min(100, (e.medio / 144) * 100)}%`;
      $('#fps-limita').textContent = e.limita;
      $('#fps-contexto').textContent = `${res} · calidad ${cal}`;
      $('#matriz tbody').innerHTML = Object.keys(RESOLUCIONES).map((r) => `
        <tr><th scope="row">${r}</th>${Object.keys(CALIDADES).map((c) => {
          const x = estimarFPS(equipo, juegoFPS, r, c);
          return `<td class="${nivelFPS(x.medio).clase}${r === res && c === cal ? ' on' : ''}">${rangoTexto(x)}</td>`;
        }).join('')}</tr>`).join('');
      pintarAnalisis(e);
      pintarMejoras();
    };

    const pintarAnalisis = (e) => {
      $('#analisis-contexto').textContent = `${res} · calidad ${cal}`;
      const c = cuelloDeBotella(e);
      $('#cuello-nivel').className = c.clase;
      $('#cuello-nivel').textContent = c.nivel;
      $('#cuello-texto').textContent = c.texto;
      const max = Math.max(e.porGPU, e.porCPU);
      $('#cuello-barras').innerHTML = `
        <div class="meter"><div class="meter-top"><span>Placa de video permite</span><span>~${e.porGPU} FPS</span></div>${barra((e.porGPU / max) * 100)}</div>
        <div class="meter"><div class="meter-top"><span>Procesador permite</span><span>~${e.porCPU} FPS</span></div>${barra((e.porCPU / max) * 100, true)}</div>`;

      const grado = (r) => (r ? `${r[0]}–${r[1]} °C` : '');
      $('#temperaturas tbody').innerHTML = temperaturas(cpu, gpu, pc.ram, juegoFPS, res).map((t) => `
        <tr class="${t.calidad === cal ? 'on' : ''}">
          <th scope="row">${t.calidad}</th>
          <td class="mono ${nivelFPS(t.fps.medio).clase}">${rangoTexto(t.fps)}</td>
          <td class="mono">${t.gpu ? `${t.usoGPU}%` : '—'}</td>
          <td class="mono ${t.gpu ? claseTemp(t.gpu, 80) : ''}">${t.gpu ? grado(t.gpu) : '<span class="muted">Integrada</span>'}</td>
          <td class="mono">${t.usoCPU}%</td>
          <td class="mono ${claseTemp(t.cpu, 85)}">${grado(t.cpu)}</td>
        </tr>`).join('');
    };

    let objetivo = 60;
    const pintarMejoras = () => {
      const r = recomendaciones({
        pc, cpu, gpu, perfil: juegoFPS, res, objetivo,
        req: { cpuEstado: fCPU.estado, ramMin: req.ram[0], ramRec: req.ram[1], pideSSD: pideSSD(min) || pideSSD(rec), espacio: numeroGB(min.disco) },
      });
      const cont = $('#mejoras');
      if (!r.lista.length) {
        cont.innerHTML = `<div class="card-inset note">${ICONOS.info}<p>${r.actual.medio >= objetivo
          ? `Tu PC ya llega a unos ${r.actual.medio} FPS en ${res} calidad Alta: no hace falta actualizar nada para este juego.`
          : `No encontramos una mejora que acerque tu PC a ${objetivo} FPS en ${res} calidad Alta. Probá con una resolución menor o con escalado (DLSS / FSR).`}</p></div>`;
        return;
      }
      const ganancia = Math.round((r.despues.medio / r.actual.medio - 1) * 100);
      cont.innerHTML = `
        <div class="card mejora-resumen">
          <div><span class="kicker">AHORA · ${res} ALTA</span><div class="fps-big"><span class="num ${nivelFPS(r.actual.medio).clase}">${rangoTexto(r.actual)}</span><span class="unit">FPS</span></div></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          <div><span class="kicker">CON LAS MEJORAS</span><div class="fps-big"><span class="num ${nivelFPS(r.despues.medio).clase}">${rangoTexto(r.despues)}</span><span class="unit">FPS</span></div></div>
          <span class="status ${ganancia > 0 ? 'status-rec' : 'status-na'}">${ganancia > 0 ? '+' : ''}${ganancia}%</span>
          ${r.despues.medio < objetivo ? `<p class="muted" style="margin:0;font-size:14px;flex-basis:100%">Aun con estas mejoras no se llega a ${objetivo} FPS; es lo máximo que estimamos con los componentes del catálogo.</p>` : ''}
        </div>
        ${r.lista.map((m) => `
          <article class="card mejora">
            <div class="mejora-tipo"><span class="kicker">MEJORAR</span><strong>${m.tipo}</strong></div>
            <div class="mejora-cambio">
              <div class="mejora-de"><span class="antes">${escapar(m.desde)}</span><span aria-hidden="true">→</span><span class="despues">${escapar(m.hacia)}</span></div>
              <ul>${m.notas.map((n) => `<li>${escapar(n)}</li>`).join('')}</ul>
            </div>
          </article>`).join('')}
        <p class="muted" style="margin:0;font-size:13px">Sugerimos el componente de menor gama que alcanza el objetivo, entre modelos que hoy se venden nuevos. No incluimos precios de hardware.</p>`;
    };
    segmentado($('#seg-objetivo'), (v) => { objetivo = parseInt(v, 10); pintarMejoras(); });
    $('#matriz thead tr').innerHTML = '<th scope="col">Resolución</th>' + Object.keys(CALIDADES).map((c) => `<th scope="col">${c}</th>`).join('');
    const segRes = $('#seg-res'); segRes.dataset.valor = res;
    segmentado(segRes, (v2) => { res = v2; pintarFPS(); });
    segmentado($('#seg-cal'), (v2) => { cal = v2; pintarFPS(); });
    pintarFPS();
  },

  comparador() {
    const pc = leerPC();
    const a = { cpu: pc.cpu, gpu: pc.gpu, ram: pc.ram };
    const b = { cpu: param('cpu') || 'r7-7700', gpu: param('gpu') || 'rtx4070s', ram: 32 };
    let res = '1440p';
    let cal = 'Alta';

    const montar = (lado, datos) => {
      $(`#${lado}-cpu`).innerHTML = opcionesAgrupadas(CPUS, datos.cpu);
      $(`#${lado}-gpu`).innerHTML = opcionesAgrupadas(GPUS, datos.gpu);
      $(`#${lado}-ram`).value = String(datos.ram);
      $(`#pc-${lado}`).addEventListener('change', () => {
        datos.cpu = $(`#${lado}-cpu`).value;
        datos.gpu = $(`#${lado}-gpu`).value;
        datos.ram = Number($(`#${lado}-ram`).value);
        pintar();
      });
    };

    const delta = (x, y) => {
      const d = Math.round(((y - x) / x) * 100);
      if (d === 0) return '<span class="muted">=</span>';
      return `<span class="${d > 0 ? 'delta-up' : 'delta-down'}">${d > 0 ? '+' : ''}${d}%</span>`;
    };

    const pintar = () => {
      const A = { cpu: porId(CPUS, a.cpu), gpu: porId(GPUS, a.gpu), ram: a.ram };
      const B = { cpu: porId(CPUS, b.cpu), gpu: porId(GPUS, b.gpu), ram: b.ram };
      const maxC = Math.max(A.cpu.score, B.cpu.score);
      const maxG = Math.max(A.gpu.score, B.gpu.score);
      const maxR = Math.max(A.ram, B.ram);
      const fila = (nombre, va, vb, max, ta, tb) => `
        <div class="stack" style="gap:10px">
          <div class="meter-top"><span>${nombre}</span><span>PC B ${delta(va, vb)}</span></div>
          <div class="duo">
            <div class="meter-top"><span class="mono" style="font-size:12px">${ta}</span></div>${barra((va / max) * 100)}
            <div class="meter-top"><span class="mono" style="font-size:12px">${tb}</span></div>${barra((vb / max) * 100, true)}
          </div>
        </div>`;
      $('#comparacion').innerHTML =
        fila('Procesador', A.cpu.score, B.cpu.score, maxC, A.cpu.nombre, B.cpu.nombre) +
        fila('Placa de video', A.gpu.score, B.gpu.score, maxG, A.gpu.nombre, B.gpu.nombre) +
        fila('Memoria RAM', A.ram, B.ram, maxR, `${A.ram} GB`, `${B.ram} GB`);

      $('#tabla-juegos tbody').innerHTML = JUEGOS.map((j) => {
        const ea = estimarFPS(A, j, res, cal);
        const eb = estimarFPS(B, j, res, cal);
        return `<tr>
          <th scope="row">${j.steam ? `<a href="/juego/${j.steam}">${j.nombre}</a>` : j.nombre}</th>
          <td class="mono ${nivelFPS(ea.medio).clase}">${rangoTexto(ea)}</td>
          <td class="mono ${nivelFPS(eb.medio).clase}">${rangoTexto(eb)}</td>
          <td class="mono">${delta(ea.medio, eb.medio)}</td>
          <td>${eb.limita}</td>
        </tr>`;
      }).join('');
      $('#contexto').textContent = `${res} · calidad ${cal}`;
    };

    montar('a', a);
    montar('b', b);
    const sr = $('#seg-res'); sr.dataset.valor = res;
    segmentado(sr, (v) => { res = v; pintar(); });
    segmentado($('#seg-cal'), (v) => { cal = v; pintar(); });
    pintar();
  },

  calculadora() {
    const pc = leerPC();
    const estado = { cpu: param('cpu') || pc.cpu, gpu: param('gpu') || pc.gpu, ram: pc.ram, juego: param('j') || JUEGOS[0].id, res: RESOLUCIONES[pc.res] ? pc.res : '1080p', cal: 'Alta' };
    $('#c-cpu').innerHTML = opcionesAgrupadas(CPUS, estado.cpu);
    $('#c-gpu').innerHTML = opcionesAgrupadas(GPUS, estado.gpu);
    $('#c-ram').value = String(estado.ram);
    $('#c-juego').innerHTML = opcionesJuegos(estado.juego);

    const pintar = () => {
      const cpu = porId(CPUS, estado.cpu);
      const gpu = porId(GPUS, estado.gpu);
      const juego = porId(JUEGOS, estado.juego);
      const e = estimarFPS({ cpu, gpu, ram: estado.ram }, juego, estado.res, estado.cal);
      const n = nivelFPS(e.medio);
      $('#r-num').textContent = rangoTexto(e);
      $('#r-nivel').className = `fps-label ${n.clase}`;
      $('#r-nivel').textContent = n.texto;
      $('#r-gauge').style.width = `${Math.min(100, (e.medio / 144) * 100)}%`;
      $('#r-juego').textContent = `${juego.nombre} · ${estado.res} · calidad ${estado.cal}`;
      $('#r-limita').textContent = e.limita;
      const max = Math.max(e.porGPU, e.porCPU);
      $('#r-detalle').innerHTML = `
        <div class="meter"><div class="meter-top"><span>Lo que permite la placa de video</span><span>~${e.porGPU} FPS</span></div>${barra((e.porGPU / max) * 100)}</div>
        <div class="meter"><div class="meter-top"><span>Lo que permite el procesador</span><span>~${e.porCPU} FPS</span></div>${barra((e.porCPU / max) * 100, true)}</div>
        ${juego.tope ? `<p class="muted" style="margin:0;font-size:14px">Este juego tiene un tope de ${juego.tope} FPS.</p>` : ''}`;
      const consejo = e.limita === 'Placa de video'
        ? 'La placa de video es el límite: bajar la calidad o la resolución, o activar DLSS / FSR, debería subir los FPS.'
        : e.limita === 'Procesador'
          ? 'El procesador es el límite: bajar la calidad gráfica casi no va a cambiar los FPS.'
          : 'Estás en el tope de FPS del juego: tu equipo podría dar más.';
      $('#r-consejo').textContent = consejo;
    };

    $('#form-calc').addEventListener('change', () => {
      estado.cpu = $('#c-cpu').value;
      estado.gpu = $('#c-gpu').value;
      estado.ram = Number($('#c-ram').value);
      estado.juego = $('#c-juego').value;
      pintar();
    });
    const sr = $('#seg-res'); sr.dataset.valor = estado.res;
    segmentado(sr, (v) => { estado.res = v; pintar(); });
    segmentado($('#seg-cal'), (v) => { estado.cal = v; pintar(); });
    $('#usar-mi-pc').addEventListener('click', () => {
      const p = leerPC();
      Object.assign(estado, { cpu: p.cpu, gpu: p.gpu, ram: p.ram });
      $('#c-cpu').value = p.cpu; $('#c-gpu').value = p.gpu; $('#c-ram').value = String(p.ram);
      pintar();
    });
    pintar();
  },

  componentes() {
    const todos = [
      ...CPUS.map((c) => ({ ...c, tipo: 'cpu', gama: gamaDe(c, 'cpu'), specs: [c.serie, `${c.nucleos}C / ${c.hilos}T`, `${c.ghz} GHz`, `${c.tdp} W`] })),
      ...GPUS.map((g) => ({ ...g, tipo: 'gpu', gama: gamaDe(g, 'gpu'), specs: [g.serie, vramTexto(g), `${g.tdp} W`] })),
    ];
    const maxPorTipo = { cpu: Math.max(...CPUS.map((c) => c.score)), gpu: Math.max(...GPUS.map((g) => g.score)) };
    const estado = { tipo: param('tipo') || 'todos', texto: '', marca: 'todas', gama: 'todas', orden: 'rend' };

    const pintar = () => {
      const t = estado.texto.trim().toLowerCase();
      const lista = todos
        .filter((x) => estado.tipo === 'todos' || x.tipo === estado.tipo)
        .filter((x) => estado.marca === 'todas' || x.marca === estado.marca)
        .filter((x) => estado.gama === 'todas' || x.gama === estado.gama)
        .filter((x) => !t || x.nombre.toLowerCase().includes(t))
        .sort((x, y) => (estado.orden === 'rend' ? (y.score / maxPorTipo[y.tipo]) - (x.score / maxPorTipo[x.tipo]) : x.nombre.localeCompare(y.nombre)));
      $('#conteo').textContent = `${lista.length} resultado${lista.length === 1 ? '' : 's'}`;
      $('#resultados').innerHTML = lista.length ? lista.map((x) => `
        <article class="card comp">
          <div class="comp-top"><h3>${x.nombre}</h3><span class="tag">${x.tipo === 'cpu' ? 'CPU' : 'GPU'} · ${x.gama}</span></div>
          <ul class="specs">${x.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
          <div class="meter"><div class="meter-top"><span>Rendimiento relativo</span><span>${x.score}</span></div>${barra((x.score / maxPorTipo[x.tipo]) * 100, x.tipo === 'cpu')}</div>
          <div class="comp-actions">
            <button type="button" class="btn btn-primary btn-sm" data-usar="${x.tipo}:${x.id}">Usar en mi PC</button>
            <a class="btn btn-ghost btn-sm" href="/calculadora?${x.tipo}=${x.id}">Calcular FPS</a>
          </div>
        </article>`).join('') : '<div class="card empty" style="grid-column:1/-1">No encontramos componentes con esos filtros.</div>';
    };

    $('#q').addEventListener('input', (ev) => { estado.texto = ev.target.value; pintar(); });
    $('#marca').addEventListener('change', (ev) => { estado.marca = ev.target.value; pintar(); });
    $('#gama').addEventListener('change', (ev) => { estado.gama = ev.target.value; pintar(); });
    $('#orden').addEventListener('change', (ev) => { estado.orden = ev.target.value; pintar(); });
    $('#tabs').addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      estado.tipo = b.dataset.tipo;
      $$('#tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      pintar();
    });
    $$('#tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.tipo === estado.tipo)));
    $('#resultados').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-usar]');
      if (!b) return;
      const [tipo, id] = b.dataset.usar.split(':');
      const pc = leerPC();
      pc[tipo] = id;
      guardarPC(pc);
      $('.nav-pc').textContent = resumenPC(pc);
      toast(`${porId(tipo === 'cpu' ? CPUS : GPUS, id).nombre} agregado a tu PC`);
    });
    pintar();
  },
};

/* ---------- Arranque ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const navPC = $('.nav-pc');
  if (navPC) navPC.textContent = resumenPC(leerPC());

  $$('form[data-buscar-juego]').forEach(buscadorJuegos);

  const pagina = document.body.dataset.page;
  if (paginas[pagina]) paginas[pagina]();
});
