# LoCorre — ¿Tu PC lo corre?

Herramienta web para jugadores: cargás los componentes de tu PC, buscás un juego y ves si es compatible,
sus requisitos mínimos y recomendados frente a tu equipo y una estimación orientativa de FPS según
resolución y calidad gráfica. Incluye comparador de PC, calculadora de FPS y buscador de componentes.

> Los resultados son aproximados y pueden variar según los componentes, los controladores y el software.

## Requisitos

- PHP 8.3+ y Composer (en Linux sin sudo: `/bin/bash -c "$(curl -fsSL https://php.new/install/linux)"`)

## Levantar en local

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Abrir http://localhost:8000

## Estructura

| Ruta | Vista | Pantalla |
|------|-------|----------|
| `/` | `resources/views/inicio.blade.php` | Inicio y Mi PC |
| `/juego?j=<id>` | `resources/views/juego.blade.php` | Compatibilidad, requisitos y FPS |
| `/comparador` | `resources/views/comparador.blade.php` | Comparador de PC |
| `/calculadora` | `resources/views/calculadora.blade.php` | Calculadora de FPS |
| `/componentes` | `resources/views/componentes.blade.php` | Buscador de componentes |

- Estilos: `public/css/app.css`
- Lógica de la interfaz: `public/js/app.js`
- Catálogo de procesadores y placas de video por serie y gama: `public/js/catalogo.js`.
- Reconocimiento de modelos en los requisitos de Steam: `public/js/reconocer.js`.
- Juegos de ejemplo del comparador y la calculadora: `public/js/datos.js`.
- Los índices de rendimiento son orientativos y hay que calibrarlos con benchmarks reales;
  el siguiente paso es pasarlos a la base de datos.
- Juegos, requisitos, precios, Metacritic y sitio oficial: `app/Services/SteamStore.php` (tienda de Steam Argentina, con caché).
- Juegos con FPS limitados por el propio juego: `config/juegos.php` (`topes_fps`).

## Fuentes opcionales (claves en `.env`)

| Variable | Para qué | Dónde se obtiene |
|----------|----------|------------------|
| `YOUTUBE_API_KEY` | Videos de rendimiento y análisis en la página del juego | Google Cloud Console → YouTube Data API v3 |
| `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET` | Horas para terminar el juego | App en https://dev.twitch.tv/console/apps |

Sin estas claves la web funciona igual: en lugar de los videos y las horas muestra enlaces a YouTube y los pasos para configurarlas.
- La configuración de "Mi PC" se guarda en el navegador (localStorage).
