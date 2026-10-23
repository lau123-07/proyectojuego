@extends('layouts.app')

@section('pagina', 'inicio')

@section('contenido')
<section class="container" style="padding-top:96px;padding-bottom:72px;display:flex;flex-direction:column;gap:28px">
    <span class="eyebrow">Compatibilidad · FPS estimados · Requisitos</span>
    <h1 class="h1">¿Tu PC lo corre?</h1>
    <p class="lead">Cargá los componentes de tu equipo, buscá un juego y mirá si cumple los requisitos y cuántos FPS podrías esperar según resolución y calidad.</p>
    <form class="search" role="search" data-buscar-juego style="margin-top:8px">
        <label for="buscar-juego" class="sr-only">Buscar un juego</label>
        <div class="search-box search-combo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <input id="buscar-juego" type="search" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="sugerencias" aria-expanded="false" placeholder="Buscá cualquier juego de Steam: Cyberpunk 2077, Hades…">
            <ul id="sugerencias" class="sugerencias" role="listbox" aria-label="Juegos encontrados" hidden></ul>
        </div>
        <button class="btn btn-primary btn-lg" type="submit">Comprobar
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
    </form>
    <div class="chips">
        <span class="muted" style="font-size:14px;margin-right:4px">Populares:</span>
        @foreach (config('juegos.populares') as $id => $nombre)
            <a class="chip" href="{{ route('juego', $id) }}">{{ $nombre }}</a>
        @endforeach
    </div>
    <p class="fuente">Datos de juegos y requisitos obtenidos de la tienda de Steam.</p>
</section>

<section class="container section" aria-labelledby="mi-pc">
    <div class="section-head">
        <div>
            <span class="kicker">01 — TU EQUIPO</span>
            <h2 id="mi-pc" class="h2" style="margin-top:6px">Mi PC</h2>
        </div>
        <p>Elegí tus componentes de la lista. Usamos estos datos para compararlos con los requisitos de cada juego.</p>
    </div>

    <div class="row">
        <form id="form-pc" class="card grow stack" style="padding:32px;gap:24px">
            <div class="fields">
                <div class="field">
                    <label for="cpu">Procesador (CPU)</label>
                    <select id="cpu" class="select"></select>
                    <span id="cpu-hint" class="hint"></span>
                </div>
                <div class="field">
                    <label for="gpu">Placa de video (GPU)</label>
                    <select id="gpu" class="select"></select>
                    <span id="gpu-hint" class="hint"></span>
                </div>
            </div>
            <div class="fields">
                <div class="field field-sm">
                    <label for="ram">Memoria RAM</label>
                    <select id="ram" class="select">
                        <option value="8">8 GB</option>
                        <option value="16">16 GB</option>
                        <option value="32">32 GB</option>
                        <option value="64">64 GB</option>
                    </select>
                </div>
                <div class="field field-sm">
                    <label for="disco">Almacenamiento</label>
                    <select id="disco" class="select">
                        <option value="hdd">HDD</option>
                        <option value="sata">SSD SATA</option>
                        <option value="nvme">SSD NVMe</option>
                    </select>
                </div>
                <div class="field field-sm">
                    <label for="so">Sistema operativo</label>
                    <select id="so" class="select">
                        <option>Windows 11 64 bits</option>
                        <option>Windows 10 64 bits</option>
                        <option>Linux (Proton)</option>
                    </select>
                </div>
            </div>
            <fieldset class="field">
                <legend>Resolución de tu monitor</legend>
                <div id="res" class="segmented" data-opciones="1080p,1440p,4K" data-valor="1080p" style="max-width:420px"></div>
            </fieldset>
            <div style="display:flex;flex-wrap:wrap;gap:12px;padding-top:20px;border-top:1px solid var(--border)">
                <button type="submit" class="btn btn-primary">Guardar mi PC</button>
                <a class="btn btn-ghost" href="{{ route('juego', 1091500) }}">Probar con un juego</a>
            </div>
        </form>

        <aside class="card side stack" aria-label="Resumen del equipo" style="gap:22px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
                <h3 style="font-size:20px">Resumen</h3>
                <span class="mono muted" style="font-size:12px">relativo al catálogo</span>
            </div>
            <div id="resumen" class="stack"></div>
            <div class="card-inset note">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9548" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                <p id="resumen-nota"></p>
            </div>
        </aside>
    </div>
</section>

<section class="container section" aria-labelledby="herramientas">
    <span class="kicker">02 — HERRAMIENTAS</span>
    <h2 id="herramientas" class="h2" style="margin:6px 0 24px">Más allá de un juego</h2>
    <div class="row" style="gap:20px">
        <a class="card tool" href="{{ route('comparador') }}">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4F25A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/></svg>
            <h3 style="font-size:22px">Comparador de PC</h3>
            <p>Poné dos equipos lado a lado y mirá cuánto cambia el rendimiento en cada juego.</p>
            <span class="go">Comparar →</span>
        </a>
        <a class="card tool" href="{{ route('calculadora') }}">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4F25A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 15a9 9 0 0 1 18 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1.5"/></svg>
            <h3 style="font-size:22px">Calculadora de FPS</h3>
            <p>Combiná procesador, placa, resolución y calidad para estimar FPS al instante.</p>
            <span class="go">Calcular →</span>
        </a>
        <a class="card tool" href="{{ route('componentes') }}">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4F25A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>
            <h3 style="font-size:22px">Buscador de componentes</h3>
            <p>Encontrá procesadores y placas de video con su rendimiento relativo.</p>
            <span class="go">Buscar →</span>
        </a>
    </div>
</section>
@endsection
