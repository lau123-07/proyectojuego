// Pruebas de la lógica de estimación. Correr con: npm run test:js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cargarScripts } from './cargar.mjs';

const js = cargarScripts();
const cpu = (id) => js.porId(js.CPUS, id);
const gpu = (id) => js.porId(js.GPUS, id);

// Perfil de juego simple y controlado: con GPU y CPU de índice 100 da 100 y 200 FPS.
const perfil = { gpuFps: 100, cpuFps: 200, tope: null, min: { ram: 8 } };
const equipo = (gpuScore, cpuScore, ram = 16) => ({ gpu: { score: gpuScore }, cpu: { score: cpuScore }, ram });

test('el catálogo tiene ids únicos y la referencia en 100', () => {
  for (const lista of [js.CPUS, js.GPUS]) {
    const ids = lista.map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, 'hay ids repetidos');
    for (const x of lista) assert.ok(x.score > 0, `${x.id} sin score`);
  }
  assert.equal(gpu('rtx3060').score, 100);
  assert.equal(cpu('r5-5600').score, 100);
});

test('la GPU limita cuando es más lenta que la CPU', () => {
  const e = js.estimarFPS(equipo(100, 100), perfil, '1080p', 'Alta');
  assert.equal(e.medio, 100);
  assert.equal(e.limita, 'Placa de video');
});

test('la CPU limita cuando es más lenta que la GPU', () => {
  const e = js.estimarFPS(equipo(300, 100), perfil, '1080p', 'Alta');
  assert.equal(e.medio, 200);
  assert.equal(e.limita, 'Procesador');
});

test('el tope del juego corta los FPS', () => {
  const e = js.estimarFPS(equipo(300, 300), { ...perfil, tope: 60 }, '1080p', 'Alta');
  assert.equal(e.medio, 60);
  assert.equal(e.hasta, 60);
  assert.equal(e.limita, 'Tope del juego');
});

test('poca RAM baja los FPS', () => {
  const conRam = js.estimarFPS(equipo(100, 100, 16), perfil, '1080p', 'Alta');
  const sinRam = js.estimarFPS(equipo(100, 100, 4), perfil, '1080p', 'Alta');
  assert.ok(sinRam.medio < conRam.medio);
});

test('más resolución o más calidad nunca da más FPS', () => {
  const res = Object.keys(js.RESOLUCIONES);
  const cal = Object.keys(js.CALIDADES);
  for (const c of cal) {
    for (let i = 1; i < res.length; i++) {
      assert.ok(js.estimarFPS(equipo(100, 300), perfil, res[i], c).medio <= js.estimarFPS(equipo(100, 300), perfil, res[i - 1], c).medio);
    }
  }
  for (const r of res) {
    for (let i = 1; i < cal.length; i++) {
      assert.ok(js.estimarFPS(equipo(100, 300), perfil, r, cal[i]).medio <= js.estimarFPS(equipo(100, 300), perfil, r, cal[i - 1]).medio);
    }
  }
});

test('reconoce placas de video en un texto típico de Steam', () => {
  const r = js.reconocer('NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB', 'gpu');
  assert.ok(r, 'no reconoció ninguna placa');
  assert.equal(r.modelos.length, 2);
  assert.equal(r.indice, Math.min(...r.modelos.map((m) => m.indice)));
});

test('sin placa de video concreta no hay perfil de FPS', () => {
  const { perfil: p } = js.analizarRequisitos({ min: { gpu: 'DirectX 11 compatible', ram: '8 GB de RAM' }, rec: null });
  assert.equal(p, null);
});
