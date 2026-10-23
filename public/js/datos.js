// Juegos de ejemplo (comparador y calculadora) y factores de la estimación de FPS.
// Los procesadores y placas de video están en catalogo.js.

// gpuFps: FPS a 1080p calidad Alta con una GPU de score 100 (sin límite de CPU).
// cpuFps: FPS máximos que entrega una CPU de score 100 en ese juego.
// tope: límite de FPS del propio juego, si lo tiene.
// Requisitos: cpuScore / gpuScore son el umbral equivalente en nuestro índice.
const JUEGOS = [
  {
    id: 'cyberpunk-2077', steam: 1091500, nombre: 'Cyberpunk 2077', estudio: 'CD PROJEKT RED', anio: 2020, genero: 'RPG de acción', sigla: 'CP',
    gpuFps: 68, cpuFps: 110, tope: null,
    min: { cpu: 'Intel Core i7-6700 / AMD Ryzen 5 1600', cpuScore: 52, gpu: 'GTX 1060 6 GB / RX 580 8 GB / Arc A380', gpuScore: 38, ram: 12, disco: 70, ssd: true, so: 'Windows 10 64 bits' },
    rec: { cpu: 'Intel Core i7-12700 / AMD Ryzen 7 7800X3D', cpuScore: 125, gpu: 'RTX 2060 Super / RX 5700 XT / Arc A770', gpuScore: 88, ram: 16, disco: 70, ssd: true, so: 'Windows 10 64 bits' },
  },
  {
    id: 'baldurs-gate-3', steam: 1086940, nombre: "Baldur's Gate 3", estudio: 'Larian Studios', anio: 2023, genero: 'RPG por turnos', sigla: 'BG',
    gpuFps: 85, cpuFps: 95, tope: null,
    min: { cpu: 'Intel i5-4690 / AMD FX 8350', cpuScore: 40, gpu: 'GTX 970 / RX 480 4 GB', gpuScore: 45, ram: 8, disco: 150, ssd: true, so: 'Windows 10 64 bits' },
    rec: { cpu: 'Intel i7-8700K / AMD Ryzen 5 3600', cpuScore: 75, gpu: 'RTX 2060 Super / RX 5700 XT', gpuScore: 88, ram: 16, disco: 150, ssd: true, so: 'Windows 10 64 bits' },
  },
  {
    id: 'counter-strike-2', steam: 730, nombre: 'Counter-Strike 2', estudio: 'Valve', anio: 2023, genero: 'Shooter competitivo', sigla: 'CS',
    gpuFps: 280, cpuFps: 320, tope: null,
    min: { cpu: 'Intel Core i5 750 (4 núcleos) o superior', cpuScore: 30, gpu: '1 GB de VRAM, DirectX 11, Shader Model 5.0', gpuScore: 20, ram: 8, disco: 85, ssd: false, so: 'Windows 10 64 bits' },
    rec: null,
  },
  {
    id: 'elden-ring', steam: 1245620, nombre: 'Elden Ring', estudio: 'FromSoftware', anio: 2022, genero: 'RPG de acción', sigla: 'ER',
    gpuFps: 80, cpuFps: 120, tope: 60,
    min: { cpu: 'Intel Core i5-8400 / AMD Ryzen 3 3300X', cpuScore: 60, gpu: 'GTX 1060 3 GB / RX 580 4 GB', gpuScore: 45, ram: 12, disco: 60, ssd: false, so: 'Windows 10 64 bits' },
    rec: { cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600X', cpuScore: 75, gpu: 'GTX 1070 8 GB / RX Vega 56', gpuScore: 65, ram: 16, disco: 60, ssd: false, so: 'Windows 10 64 bits' },
  },
  {
    id: 'fortnite', nombre: 'Fortnite', estudio: 'Epic Games', anio: 2017, genero: 'Battle royale', sigla: 'FN',
    gpuFps: 135, cpuFps: 170, tope: null,
    min: { cpu: 'Intel Core i3-3225 3.3 GHz', cpuScore: 25, gpu: 'Intel HD 4000 / AMD Radeon Vega 8', gpuScore: 10, ram: 8, disco: null, ssd: false, so: 'Windows 10 64 bits' },
    rec: { cpu: 'Intel Core i5-7300U / AMD Ryzen 3 3300U', cpuScore: 35, gpu: 'GTX 960 / Radeon R9 280', gpuScore: 35, ram: 16, disco: null, ssd: true, so: 'Windows 10 64 bits' },
  },
];

const RESOLUCIONES = { '1080p': 1, '1440p': 0.72, '4K': 0.4 };
const CALIDADES = { Baja: 1.6, Media: 1.3, Alta: 1, Ultra: 0.8 };
const DISCOS = { hdd: 'HDD', sata: 'SSD SATA', nvme: 'SSD NVMe' };

const PC_POR_DEFECTO = { cpu: 'r5-5600', gpu: 'rtx3060', ram: 16, disco: 'nvme', so: 'Windows 11 64 bits', res: '1080p' };
