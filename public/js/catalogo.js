// Catálogo de procesadores y placas de video, agrupado por serie/generación.
// "score" es un índice aproximado de rendimiento en juegos (Ryzen 5 5600 = 100, RTX 3060 12 GB = 100);
// conviene calibrarlo con benchmarks reales antes de usarlo en producción.

// [id, nombre, marca, serie, núcleos, hilos, GHz máx., TDP W, score]
const CPUS = [
  ['i5-2500k', 'Intel Core i5-2500K', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 4, 3.7, 95, 30],
  ['i7-2600k', 'Intel Core i7-2600K', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 8, 3.8, 95, 34],
  ['i5-3470', 'Intel Core i5-3470', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 4, 3.6, 77, 32],
  ['i7-3770k', 'Intel Core i7-3770K', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 8, 3.9, 77, 38],
  ['i5-4460', 'Intel Core i5-4460', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 4, 3.4, 84, 34],
  ['i5-4690k', 'Intel Core i5-4690K', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 4, 3.9, 88, 39],
  ['i7-4770k', 'Intel Core i7-4770K', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 8, 3.9, 84, 44],
  ['i7-4790k', 'Intel Core i7-4790K', 'Intel', 'Intel Core 2.ª a 4.ª gen', 4, 8, 4.4, 88, 47],

  ['i3-6100', 'Intel Core i3-6100', 'Intel', 'Intel Core 6.ª gen', 2, 4, 3.7, 51, 35],
  ['i5-6400', 'Intel Core i5-6400', 'Intel', 'Intel Core 6.ª gen', 4, 4, 3.3, 65, 45],
  ['i5-6600k', 'Intel Core i5-6600K', 'Intel', 'Intel Core 6.ª gen', 4, 4, 3.9, 91, 50],
  ['i7-6700', 'Intel Core i7-6700', 'Intel', 'Intel Core 6.ª gen', 4, 8, 4.0, 65, 55],
  ['i7-6700k', 'Intel Core i7-6700K', 'Intel', 'Intel Core 6.ª gen', 4, 8, 4.2, 91, 58],

  ['i3-7100', 'Intel Core i3-7100', 'Intel', 'Intel Core 7.ª gen', 2, 4, 3.9, 51, 38],
  ['i5-7400', 'Intel Core i5-7400', 'Intel', 'Intel Core 7.ª gen', 4, 4, 3.5, 65, 48],
  ['i5-7600k', 'Intel Core i5-7600K', 'Intel', 'Intel Core 7.ª gen', 4, 4, 4.2, 91, 56],
  ['i7-7700', 'Intel Core i7-7700', 'Intel', 'Intel Core 7.ª gen', 4, 8, 4.2, 65, 60],
  ['i7-7700k', 'Intel Core i7-7700K', 'Intel', 'Intel Core 7.ª gen', 4, 8, 4.5, 91, 63],

  ['i3-8100', 'Intel Core i3-8100', 'Intel', 'Intel Core 8.ª gen', 4, 4, 3.6, 65, 48],
  ['i5-8400', 'Intel Core i5-8400', 'Intel', 'Intel Core 8.ª gen', 6, 6, 4.0, 65, 60],
  ['i5-8600k', 'Intel Core i5-8600K', 'Intel', 'Intel Core 8.ª gen', 6, 6, 4.3, 95, 66],
  ['i7-8700', 'Intel Core i7-8700', 'Intel', 'Intel Core 8.ª gen', 6, 12, 4.6, 65, 70],
  ['i7-8700k', 'Intel Core i7-8700K', 'Intel', 'Intel Core 8.ª gen', 6, 12, 4.7, 95, 73],

  ['i3-9100f', 'Intel Core i3-9100F', 'Intel', 'Intel Core 9.ª gen', 4, 4, 4.2, 65, 50],
  ['i5-9400f', 'Intel Core i5-9400F', 'Intel', 'Intel Core 9.ª gen', 6, 6, 4.1, 65, 62],
  ['i5-9600k', 'Intel Core i5-9600K', 'Intel', 'Intel Core 9.ª gen', 6, 6, 4.6, 95, 70],
  ['i7-9700k', 'Intel Core i7-9700K', 'Intel', 'Intel Core 9.ª gen', 8, 8, 4.9, 95, 80],
  ['i9-9900k', 'Intel Core i9-9900K', 'Intel', 'Intel Core 9.ª gen', 8, 16, 5.0, 95, 84],

  ['i3-10100f', 'Intel Core i3-10100F', 'Intel', 'Intel Core 10.ª gen', 4, 8, 4.3, 65, 58],
  ['i5-10400f', 'Intel Core i5-10400F', 'Intel', 'Intel Core 10.ª gen', 6, 12, 4.3, 65, 78],
  ['i5-10600k', 'Intel Core i5-10600K', 'Intel', 'Intel Core 10.ª gen', 6, 12, 4.8, 125, 84],
  ['i7-10700k', 'Intel Core i7-10700K', 'Intel', 'Intel Core 10.ª gen', 8, 16, 5.1, 125, 90],
  ['i9-10900k', 'Intel Core i9-10900K', 'Intel', 'Intel Core 10.ª gen', 10, 20, 5.3, 125, 95],

  ['i5-11400f', 'Intel Core i5-11400F', 'Intel', 'Intel Core 11.ª gen', 6, 12, 4.4, 65, 88],
  ['i5-11600k', 'Intel Core i5-11600K', 'Intel', 'Intel Core 11.ª gen', 6, 12, 4.9, 125, 95],
  ['i7-11700k', 'Intel Core i7-11700K', 'Intel', 'Intel Core 11.ª gen', 8, 16, 5.0, 125, 100],
  ['i9-11900k', 'Intel Core i9-11900K', 'Intel', 'Intel Core 11.ª gen', 8, 16, 5.3, 125, 104],

  ['i3-12100f', 'Intel Core i3-12100F', 'Intel', 'Intel Core 12.ª gen', 4, 8, 4.3, 58, 88],
  ['i5-12400f', 'Intel Core i5-12400F', 'Intel', 'Intel Core 12.ª gen', 6, 12, 4.4, 65, 104],
  ['i5-12600k', 'Intel Core i5-12600K', 'Intel', 'Intel Core 12.ª gen', 10, 16, 4.9, 125, 118],
  ['i7-12700', 'Intel Core i7-12700', 'Intel', 'Intel Core 12.ª gen', 12, 20, 4.9, 65, 125],
  ['i7-12700k', 'Intel Core i7-12700K', 'Intel', 'Intel Core 12.ª gen', 12, 20, 5.0, 125, 130],
  ['i9-12900k', 'Intel Core i9-12900K', 'Intel', 'Intel Core 12.ª gen', 16, 24, 5.2, 125, 138],

  ['i3-13100f', 'Intel Core i3-13100F', 'Intel', 'Intel Core 13.ª gen', 4, 8, 4.5, 58, 92],
  ['i5-13400f', 'Intel Core i5-13400F', 'Intel', 'Intel Core 13.ª gen', 10, 16, 4.6, 65, 110],
  ['i5-13600k', 'Intel Core i5-13600K', 'Intel', 'Intel Core 13.ª gen', 14, 20, 5.1, 125, 145],
  ['i7-13700k', 'Intel Core i7-13700K', 'Intel', 'Intel Core 13.ª gen', 16, 24, 5.4, 125, 155],
  ['i9-13900k', 'Intel Core i9-13900K', 'Intel', 'Intel Core 13.ª gen', 24, 32, 5.8, 125, 162],

  ['i5-14400f', 'Intel Core i5-14400F', 'Intel', 'Intel Core 14.ª gen', 10, 16, 4.7, 65, 112],
  ['i5-14600k', 'Intel Core i5-14600K', 'Intel', 'Intel Core 14.ª gen', 14, 20, 5.3, 125, 148],
  ['i7-14700k', 'Intel Core i7-14700K', 'Intel', 'Intel Core 14.ª gen', 20, 28, 5.6, 125, 160],
  ['i9-14900k', 'Intel Core i9-14900K', 'Intel', 'Intel Core 14.ª gen', 24, 32, 6.0, 125, 166],

  ['ultra5-245k', 'Intel Core Ultra 5 245K', 'Intel', 'Intel Core Ultra 200S', 14, 14, 5.2, 125, 140],
  ['ultra7-265k', 'Intel Core Ultra 7 265K', 'Intel', 'Intel Core Ultra 200S', 20, 20, 5.5, 125, 152],
  ['ultra9-285k', 'Intel Core Ultra 9 285K', 'Intel', 'Intel Core Ultra 200S', 24, 24, 5.7, 125, 160],

  ['fx-6300', 'AMD FX-6300', 'AMD', 'AMD FX', 6, 6, 4.1, 95, 22],
  ['fx-8350', 'AMD FX-8350', 'AMD', 'AMD FX', 8, 8, 4.2, 125, 28],

  ['r3-1200', 'AMD Ryzen 3 1200', 'AMD', 'AMD Ryzen 1000 / 2000', 4, 4, 3.4, 65, 40],
  ['r5-1600', 'AMD Ryzen 5 1600', 'AMD', 'AMD Ryzen 1000 / 2000', 6, 12, 3.6, 65, 52],
  ['r7-1700', 'AMD Ryzen 7 1700', 'AMD', 'AMD Ryzen 1000 / 2000', 8, 16, 3.7, 65, 55],
  ['r5-2600', 'AMD Ryzen 5 2600', 'AMD', 'AMD Ryzen 1000 / 2000', 6, 12, 3.9, 65, 60],
  ['r7-2700x', 'AMD Ryzen 7 2700X', 'AMD', 'AMD Ryzen 1000 / 2000', 8, 16, 4.3, 105, 66],

  ['r3-3100', 'AMD Ryzen 3 3100', 'AMD', 'AMD Ryzen 3000', 4, 8, 3.9, 65, 62],
  ['r3-3300x', 'AMD Ryzen 3 3300X', 'AMD', 'AMD Ryzen 3000', 4, 8, 4.3, 65, 70],
  ['r5-3600', 'AMD Ryzen 5 3600', 'AMD', 'AMD Ryzen 3000', 6, 12, 4.2, 65, 75],
  ['r7-3700x', 'AMD Ryzen 7 3700X', 'AMD', 'AMD Ryzen 3000', 8, 16, 4.4, 65, 80],
  ['r9-3900x', 'AMD Ryzen 9 3900X', 'AMD', 'AMD Ryzen 3000', 12, 24, 4.6, 105, 83],

  ['r5-5500', 'AMD Ryzen 5 5500', 'AMD', 'AMD Ryzen 5000', 6, 12, 4.2, 65, 88],
  ['r5-5600g', 'AMD Ryzen 5 5600G', 'AMD', 'AMD Ryzen 5000', 6, 12, 4.4, 65, 85],
  ['r5-5600', 'AMD Ryzen 5 5600', 'AMD', 'AMD Ryzen 5000', 6, 12, 4.4, 65, 100],
  ['r5-5600x', 'AMD Ryzen 5 5600X', 'AMD', 'AMD Ryzen 5000', 6, 12, 4.6, 65, 104],
  ['r7-5700g', 'AMD Ryzen 7 5700G', 'AMD', 'AMD Ryzen 5000', 8, 16, 4.6, 65, 92],
  ['r7-5700x', 'AMD Ryzen 7 5700X', 'AMD', 'AMD Ryzen 5000', 8, 16, 4.6, 65, 106],
  ['r7-5800x', 'AMD Ryzen 7 5800X', 'AMD', 'AMD Ryzen 5000', 8, 16, 4.7, 105, 110],
  ['r7-5800x3d', 'AMD Ryzen 7 5800X3D', 'AMD', 'AMD Ryzen 5000', 8, 16, 4.5, 105, 135],
  ['r9-5900x', 'AMD Ryzen 9 5900X', 'AMD', 'AMD Ryzen 5000', 12, 24, 4.8, 105, 112],
  ['r9-5950x', 'AMD Ryzen 9 5950X', 'AMD', 'AMD Ryzen 5000', 16, 32, 4.9, 105, 114],

  ['r5-7600', 'AMD Ryzen 5 7600', 'AMD', 'AMD Ryzen 7000 / 8000', 6, 12, 5.1, 65, 135],
  ['r5-7600x', 'AMD Ryzen 5 7600X', 'AMD', 'AMD Ryzen 7000 / 8000', 6, 12, 5.3, 105, 138],
  ['r5-8600g', 'AMD Ryzen 5 8600G', 'AMD', 'AMD Ryzen 7000 / 8000', 6, 12, 5.0, 65, 115],
  ['r7-7700', 'AMD Ryzen 7 7700', 'AMD', 'AMD Ryzen 7000 / 8000', 8, 16, 5.3, 65, 140],
  ['r7-7700x', 'AMD Ryzen 7 7700X', 'AMD', 'AMD Ryzen 7000 / 8000', 8, 16, 5.4, 105, 143],
  ['r7-7800x3d', 'AMD Ryzen 7 7800X3D', 'AMD', 'AMD Ryzen 7000 / 8000', 8, 16, 5.0, 120, 175],
  ['r9-7900x', 'AMD Ryzen 9 7900X', 'AMD', 'AMD Ryzen 7000 / 8000', 12, 24, 5.6, 170, 145],
  ['r9-7950x', 'AMD Ryzen 9 7950X', 'AMD', 'AMD Ryzen 7000 / 8000', 16, 32, 5.7, 170, 150],
  ['r9-7950x3d', 'AMD Ryzen 9 7950X3D', 'AMD', 'AMD Ryzen 7000 / 8000', 16, 32, 5.7, 120, 175],

  ['r5-9600x', 'AMD Ryzen 5 9600X', 'AMD', 'AMD Ryzen 9000', 6, 12, 5.4, 65, 150],
  ['r7-9700x', 'AMD Ryzen 7 9700X', 'AMD', 'AMD Ryzen 9000', 8, 16, 5.5, 65, 155],
  ['r7-9800x3d', 'AMD Ryzen 7 9800X3D', 'AMD', 'AMD Ryzen 9000', 8, 16, 5.2, 120, 200],
  ['r9-9900x', 'AMD Ryzen 9 9900X', 'AMD', 'AMD Ryzen 9000', 12, 24, 5.6, 120, 158],
  ['r9-9950x', 'AMD Ryzen 9 9950X', 'AMD', 'AMD Ryzen 9000', 16, 32, 5.7, 170, 162],
  ['r9-9950x3d', 'AMD Ryzen 9 9950X3D', 'AMD', 'AMD Ryzen 9000', 16, 32, 5.7, 170, 200],
].map(([id, nombre, marca, serie, nucleos, hilos, ghz, tdp, score]) => ({ id, nombre, marca, serie, nucleos, hilos, ghz, tdp, score }));

// [id, nombre, marca, serie, VRAM GB (0 = compartida), TDP W, score, clave de reconocimiento]
const GPUS = [
  ['uhd630', 'Intel UHD Graphics 630 (integrada)', 'Intel', 'Gráficos integrados', 0, 15, 6, 'intel-igpu'],
  ['iris-xe', 'Intel Iris Xe (integrada)', 'Intel', 'Gráficos integrados', 0, 28, 12, 'intel-iris-xe'],
  ['vega8', 'AMD Radeon Vega 8 (integrada)', 'AMD', 'Gráficos integrados', 0, 15, 12, 'amd-vega-8'],
  ['r680m', 'AMD Radeon 680M (integrada)', 'AMD', 'Gráficos integrados', 0, 35, 35, 'amd-680m'],
  ['r780m', 'AMD Radeon 780M (integrada)', 'AMD', 'Gráficos integrados', 0, 35, 40, 'amd-780m'],

  ['gtx950', 'NVIDIA GeForce GTX 950', 'NVIDIA', 'NVIDIA GTX 900', 2, 90, 22, 'nv-950'],
  ['gtx960', 'NVIDIA GeForce GTX 960', 'NVIDIA', 'NVIDIA GTX 900', 2, 120, 25, 'nv-960'],
  ['gtx970', 'NVIDIA GeForce GTX 970', 'NVIDIA', 'NVIDIA GTX 900', 4, 145, 37, 'nv-970'],
  ['gtx980', 'NVIDIA GeForce GTX 980', 'NVIDIA', 'NVIDIA GTX 900', 4, 165, 45, 'nv-980'],
  ['gtx980ti', 'NVIDIA GeForce GTX 980 Ti', 'NVIDIA', 'NVIDIA GTX 900', 6, 250, 55, 'nv-980-ti'],

  ['gt1030', 'NVIDIA GeForce GT 1030', 'NVIDIA', 'NVIDIA GTX 10', 2, 30, 10, 'nv-1030'],
  ['gtx1050', 'NVIDIA GeForce GTX 1050', 'NVIDIA', 'NVIDIA GTX 10', 2, 75, 22, 'nv-1050'],
  ['gtx1050ti', 'NVIDIA GeForce GTX 1050 Ti', 'NVIDIA', 'NVIDIA GTX 10', 4, 75, 30, 'nv-1050-ti'],
  ['gtx1060-3', 'NVIDIA GeForce GTX 1060 3 GB', 'NVIDIA', 'NVIDIA GTX 10', 3, 120, 43, 'nv-1060-3'],
  ['gtx1060-6', 'NVIDIA GeForce GTX 1060 6 GB', 'NVIDIA', 'NVIDIA GTX 10', 6, 120, 47, 'nv-1060'],
  ['gtx1070', 'NVIDIA GeForce GTX 1070', 'NVIDIA', 'NVIDIA GTX 10', 8, 150, 62, 'nv-1070'],
  ['gtx1070ti', 'NVIDIA GeForce GTX 1070 Ti', 'NVIDIA', 'NVIDIA GTX 10', 8, 180, 68, 'nv-1070-ti'],
  ['gtx1080', 'NVIDIA GeForce GTX 1080', 'NVIDIA', 'NVIDIA GTX 10', 8, 180, 73, 'nv-1080'],
  ['gtx1080ti', 'NVIDIA GeForce GTX 1080 Ti', 'NVIDIA', 'NVIDIA GTX 10', 11, 250, 92, 'nv-1080-ti'],

  ['gtx1630', 'NVIDIA GeForce GTX 1630', 'NVIDIA', 'NVIDIA GTX 16', 4, 75, 18, 'nv-1630'],
  ['gtx1650', 'NVIDIA GeForce GTX 1650', 'NVIDIA', 'NVIDIA GTX 16', 4, 75, 37, 'nv-1650'],
  ['gtx1650s', 'NVIDIA GeForce GTX 1650 Super', 'NVIDIA', 'NVIDIA GTX 16', 4, 100, 50, 'nv-1650-super'],
  ['gtx1660', 'NVIDIA GeForce GTX 1660', 'NVIDIA', 'NVIDIA GTX 16', 6, 120, 55, 'nv-1660'],
  ['gtx1660s', 'NVIDIA GeForce GTX 1660 Super', 'NVIDIA', 'NVIDIA GTX 16', 6, 125, 63, 'nv-1660-super'],
  ['gtx1660ti', 'NVIDIA GeForce GTX 1660 Ti', 'NVIDIA', 'NVIDIA GTX 16', 6, 120, 63, 'nv-1660-ti'],

  ['rtx2060', 'NVIDIA GeForce RTX 2060', 'NVIDIA', 'NVIDIA RTX 20', 6, 160, 78, 'nv-2060'],
  ['rtx2060s', 'NVIDIA GeForce RTX 2060 Super', 'NVIDIA', 'NVIDIA RTX 20', 8, 175, 88, 'nv-2060-super'],
  ['rtx2070', 'NVIDIA GeForce RTX 2070', 'NVIDIA', 'NVIDIA RTX 20', 8, 175, 95, 'nv-2070'],
  ['rtx2070s', 'NVIDIA GeForce RTX 2070 Super', 'NVIDIA', 'NVIDIA RTX 20', 8, 215, 105, 'nv-2070-super'],
  ['rtx2080', 'NVIDIA GeForce RTX 2080', 'NVIDIA', 'NVIDIA RTX 20', 8, 215, 112, 'nv-2080'],
  ['rtx2080s', 'NVIDIA GeForce RTX 2080 Super', 'NVIDIA', 'NVIDIA RTX 20', 8, 250, 118, 'nv-2080-super'],
  ['rtx2080ti', 'NVIDIA GeForce RTX 2080 Ti', 'NVIDIA', 'NVIDIA RTX 20', 11, 250, 135, 'nv-2080-ti'],

  ['rtx3050', 'NVIDIA GeForce RTX 3050', 'NVIDIA', 'NVIDIA RTX 30', 8, 130, 70, 'nv-3050'],
  ['rtx3060', 'NVIDIA GeForce RTX 3060 12 GB', 'NVIDIA', 'NVIDIA RTX 30', 12, 170, 100, 'nv-3060'],
  ['rtx3060ti', 'NVIDIA GeForce RTX 3060 Ti', 'NVIDIA', 'NVIDIA RTX 30', 8, 200, 120, 'nv-3060-ti'],
  ['rtx3070', 'NVIDIA GeForce RTX 3070', 'NVIDIA', 'NVIDIA RTX 30', 8, 220, 135, 'nv-3070'],
  ['rtx3070ti', 'NVIDIA GeForce RTX 3070 Ti', 'NVIDIA', 'NVIDIA RTX 30', 8, 290, 142, 'nv-3070-ti'],
  ['rtx3080', 'NVIDIA GeForce RTX 3080', 'NVIDIA', 'NVIDIA RTX 30', 10, 320, 165, 'nv-3080'],
  ['rtx3080ti', 'NVIDIA GeForce RTX 3080 Ti', 'NVIDIA', 'NVIDIA RTX 30', 12, 350, 178, 'nv-3080-ti'],
  ['rtx3090', 'NVIDIA GeForce RTX 3090', 'NVIDIA', 'NVIDIA RTX 30', 24, 350, 185, 'nv-3090'],
  ['rtx3090ti', 'NVIDIA GeForce RTX 3090 Ti', 'NVIDIA', 'NVIDIA RTX 30', 24, 450, 200, 'nv-3090-ti'],

  ['rtx4060', 'NVIDIA GeForce RTX 4060', 'NVIDIA', 'NVIDIA RTX 40', 8, 115, 115, 'nv-4060'],
  ['rtx4060ti', 'NVIDIA GeForce RTX 4060 Ti', 'NVIDIA', 'NVIDIA RTX 40', 8, 160, 135, 'nv-4060-ti'],
  ['rtx4070', 'NVIDIA GeForce RTX 4070', 'NVIDIA', 'NVIDIA RTX 40', 12, 200, 165, 'nv-4070'],
  ['rtx4070s', 'NVIDIA GeForce RTX 4070 Super', 'NVIDIA', 'NVIDIA RTX 40', 12, 220, 190, 'nv-4070-super'],
  ['rtx4070ti', 'NVIDIA GeForce RTX 4070 Ti', 'NVIDIA', 'NVIDIA RTX 40', 12, 285, 205, 'nv-4070-ti'],
  ['rtx4070tis', 'NVIDIA GeForce RTX 4070 Ti Super', 'NVIDIA', 'NVIDIA RTX 40', 16, 285, 220, 'nv-4070-ti-super'],
  ['rtx4080', 'NVIDIA GeForce RTX 4080', 'NVIDIA', 'NVIDIA RTX 40', 16, 320, 260, 'nv-4080'],
  ['rtx4080s', 'NVIDIA GeForce RTX 4080 Super', 'NVIDIA', 'NVIDIA RTX 40', 16, 320, 268, 'nv-4080-super'],
  ['rtx4090', 'NVIDIA GeForce RTX 4090', 'NVIDIA', 'NVIDIA RTX 40', 24, 450, 340, 'nv-4090'],

  ['rtx5060', 'NVIDIA GeForce RTX 5060', 'NVIDIA', 'NVIDIA RTX 50', 8, 145, 140, 'nv-5060'],
  ['rtx5060ti', 'NVIDIA GeForce RTX 5060 Ti 16 GB', 'NVIDIA', 'NVIDIA RTX 50', 16, 180, 158, 'nv-5060-ti'],
  ['rtx5070', 'NVIDIA GeForce RTX 5070', 'NVIDIA', 'NVIDIA RTX 50', 12, 250, 200, 'nv-5070'],
  ['rtx5070ti', 'NVIDIA GeForce RTX 5070 Ti', 'NVIDIA', 'NVIDIA RTX 50', 16, 300, 245, 'nv-5070-ti'],
  ['rtx5080', 'NVIDIA GeForce RTX 5080', 'NVIDIA', 'NVIDIA RTX 50', 16, 360, 280, 'nv-5080'],
  ['rtx5090', 'NVIDIA GeForce RTX 5090', 'NVIDIA', 'NVIDIA RTX 50', 32, 575, 420, 'nv-5090'],

  ['rx460', 'AMD Radeon RX 460', 'AMD', 'AMD Radeon RX 400 / 500', 4, 75, 15, 'amd-460'],
  ['rx470', 'AMD Radeon RX 470', 'AMD', 'AMD Radeon RX 400 / 500', 4, 120, 38, 'amd-470'],
  ['rx480', 'AMD Radeon RX 480', 'AMD', 'AMD Radeon RX 400 / 500', 8, 150, 45, 'amd-480'],
  ['rx550', 'AMD Radeon RX 550', 'AMD', 'AMD Radeon RX 400 / 500', 2, 50, 12, 'amd-550'],
  ['rx560', 'AMD Radeon RX 560', 'AMD', 'AMD Radeon RX 400 / 500', 4, 75, 20, 'amd-560'],
  ['rx570', 'AMD Radeon RX 570', 'AMD', 'AMD Radeon RX 400 / 500', 4, 150, 42, 'amd-570'],
  ['rx580', 'AMD Radeon RX 580 8 GB', 'AMD', 'AMD Radeon RX 400 / 500', 8, 185, 48, 'amd-580'],
  ['rx590', 'AMD Radeon RX 590', 'AMD', 'AMD Radeon RX 400 / 500', 8, 225, 52, 'amd-590'],
  ['vega56', 'AMD Radeon RX Vega 56', 'AMD', 'AMD Radeon RX 400 / 500', 8, 210, 62, 'amd-vega-56'],
  ['vega64', 'AMD Radeon RX Vega 64', 'AMD', 'AMD Radeon RX 400 / 500', 8, 295, 68, 'amd-vega-64'],

  ['rx5500xt', 'AMD Radeon RX 5500 XT', 'AMD', 'AMD Radeon RX 5000', 8, 130, 52, 'amd-5500-xt'],
  ['rx5600xt', 'AMD Radeon RX 5600 XT', 'AMD', 'AMD Radeon RX 5000', 6, 150, 75, 'amd-5600-xt'],
  ['rx5700', 'AMD Radeon RX 5700', 'AMD', 'AMD Radeon RX 5000', 8, 180, 85, 'amd-5700'],
  ['rx5700xt', 'AMD Radeon RX 5700 XT', 'AMD', 'AMD Radeon RX 5000', 8, 225, 92, 'amd-5700-xt'],

  ['rx6400', 'AMD Radeon RX 6400', 'AMD', 'AMD Radeon RX 6000', 4, 53, 33, 'amd-6400'],
  ['rx6500xt', 'AMD Radeon RX 6500 XT', 'AMD', 'AMD Radeon RX 6000', 4, 107, 40, 'amd-6500-xt'],
  ['rx6600', 'AMD Radeon RX 6600', 'AMD', 'AMD Radeon RX 6000', 8, 132, 92, 'amd-6600'],
  ['rx6600xt', 'AMD Radeon RX 6600 XT', 'AMD', 'AMD Radeon RX 6000', 8, 160, 105, 'amd-6600-xt'],
  ['rx6650xt', 'AMD Radeon RX 6650 XT', 'AMD', 'AMD Radeon RX 6000', 8, 180, 110, 'amd-6650-xt'],
  ['rx6700', 'AMD Radeon RX 6700', 'AMD', 'AMD Radeon RX 6000', 10, 175, 115, 'amd-6700'],
  ['rx6700xt', 'AMD Radeon RX 6700 XT', 'AMD', 'AMD Radeon RX 6000', 12, 230, 125, 'amd-6700-xt'],
  ['rx6750xt', 'AMD Radeon RX 6750 XT', 'AMD', 'AMD Radeon RX 6000', 12, 250, 130, 'amd-6750-xt'],
  ['rx6800', 'AMD Radeon RX 6800', 'AMD', 'AMD Radeon RX 6000', 16, 250, 155, 'amd-6800'],
  ['rx6800xt', 'AMD Radeon RX 6800 XT', 'AMD', 'AMD Radeon RX 6000', 16, 300, 175, 'amd-6800-xt'],
  ['rx6900xt', 'AMD Radeon RX 6900 XT', 'AMD', 'AMD Radeon RX 6000', 16, 300, 190, 'amd-6900-xt'],
  ['rx6950xt', 'AMD Radeon RX 6950 XT', 'AMD', 'AMD Radeon RX 6000', 16, 335, 200, 'amd-6950-xt'],

  ['rx7600', 'AMD Radeon RX 7600', 'AMD', 'AMD Radeon RX 7000', 8, 165, 112, 'amd-7600'],
  ['rx7600xt', 'AMD Radeon RX 7600 XT', 'AMD', 'AMD Radeon RX 7000', 16, 190, 118, 'amd-7600-xt'],
  ['rx7700xt', 'AMD Radeon RX 7700 XT', 'AMD', 'AMD Radeon RX 7000', 12, 245, 155, 'amd-7700-xt'],
  ['rx7800xt', 'AMD Radeon RX 7800 XT', 'AMD', 'AMD Radeon RX 7000', 16, 263, 180, 'amd-7800-xt'],
  ['rx7900gre', 'AMD Radeon RX 7900 GRE', 'AMD', 'AMD Radeon RX 7000', 16, 260, 200, 'amd-7900-gre'],
  ['rx7900xt', 'AMD Radeon RX 7900 XT', 'AMD', 'AMD Radeon RX 7000', 20, 315, 230, 'amd-7900-xt'],
  ['rx7900xtx', 'AMD Radeon RX 7900 XTX', 'AMD', 'AMD Radeon RX 7000', 24, 355, 270, 'amd-7900-xtx'],

  ['rx9060xt', 'AMD Radeon RX 9060 XT 16 GB', 'AMD', 'AMD Radeon RX 9000', 16, 160, 145, 'amd-9060-xt'],
  ['rx9070', 'AMD Radeon RX 9070', 'AMD', 'AMD Radeon RX 9000', 16, 220, 210, 'amd-9070'],
  ['rx9070xt', 'AMD Radeon RX 9070 XT', 'AMD', 'AMD Radeon RX 9000', 16, 304, 240, 'amd-9070-xt'],

  ['arc-a310', 'Intel Arc A310', 'Intel', 'Intel Arc', 4, 75, 25, 'intel-a310'],
  ['arc-a380', 'Intel Arc A380', 'Intel', 'Intel Arc', 6, 75, 38, 'intel-a380'],
  ['arc-a580', 'Intel Arc A580', 'Intel', 'Intel Arc', 8, 185, 80, 'intel-a580'],
  ['arc-a750', 'Intel Arc A750', 'Intel', 'Intel Arc', 8, 225, 88, 'intel-a750'],
  ['arc-a770', 'Intel Arc A770 16 GB', 'Intel', 'Intel Arc', 16, 225, 95, 'intel-a770'],
  ['arc-b570', 'Intel Arc B570', 'Intel', 'Intel Arc', 10, 150, 105, 'intel-b570'],
  ['arc-b580', 'Intel Arc B580', 'Intel', 'Intel Arc', 12, 190, 118, 'intel-b580'],
].map(([id, nombre, marca, serie, vram, tdp, score, clave]) => ({ id, nombre, marca, serie, vram, tdp, score, clave }));

// Gama según el índice de rendimiento.
const GAMAS = ['Entrada', 'Media', 'Alta', 'Entusiasta'];
function gamaDe(componente, tipo) {
  const cortes = tipo === 'cpu' ? [60, 110, 150] : [45, 110, 200];
  const i = cortes.findIndex((c) => componente.score < c);
  return GAMAS[i === -1 ? 3 : i];
}
