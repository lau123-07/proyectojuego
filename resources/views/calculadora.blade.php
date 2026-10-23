@extends('layouts.app')

@section('titulo', 'Calculadora de FPS')
@section('pagina', 'calculadora')

@section('contenido')
<section class="container page-head">
    <span class="eyebrow">Calculadora</span>
    <h1 class="h1" style="font-size:clamp(40px,6vw,72px)">Calculadora de FPS</h1>
    <p class="lead">Combiná componentes, juego, resolución y calidad para obtener una estimación orientativa.</p>
</section>

<section class="container section">
    <div class="row">
        <div class="card grow stack" style="gap:24px">
            <form id="c-buscar" class="stack" role="search" style="gap:12px">
                <label for="c-juego" style="font-size:14px;font-weight:600;color:var(--text-2)">Juego</label>
                <div class="search-box search-combo" style="min-height:52px">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
                    <input id="c-juego" type="search" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="c-sugerencias" aria-expanded="false" placeholder="Escribí el nombre de cualquier juego de Steam…">
                    <ul id="c-sugerencias" class="sugerencias" role="listbox" aria-label="Juegos encontrados" hidden></ul>
                </div>
                <div id="c-juego-ficha" class="card-inset calc-ficha" aria-live="polite"></div>
            </form>
            <form id="form-calc" class="stack" style="gap:24px">
            <div class="fields">
                <div class="field"><label for="c-cpu">Procesador</label><select id="c-cpu" class="select"></select></div>
                <div class="field"><label for="c-gpu">Placa de video</label><select id="c-gpu" class="select"></select></div>
            </div>
            <div class="fields">
                <div class="field field-sm"><label for="c-ram">Memoria RAM</label>
                    <select id="c-ram" class="select"><option value="8">8 GB</option><option value="16">16 GB</option><option value="32">32 GB</option><option value="64">64 GB</option></select>
                </div>
            </div>
            <div class="fields">
                <fieldset class="field">
                    <legend>Resolución</legend>
                    <div id="seg-res" class="segmented" data-opciones="1080p,1440p,4K" data-valor="1080p"></div>
                </fieldset>
                <fieldset class="field">
                    <legend>Calidad gráfica</legend>
                    <div id="seg-cal" class="segmented" data-opciones="Baja,Media,Alta,Ultra" data-valor="Alta"></div>
                </fieldset>
            </div>
            <div style="padding-top:20px;border-top:1px solid var(--border)">
                <button id="usar-mi-pc" type="button" class="btn btn-ghost">Cargar mi PC</button>
            </div>
            </form>
        </div>

        <aside class="card side stack" style="gap:24px" aria-live="polite">
            <p id="r-sin-datos" class="muted" style="margin:0" hidden></p>
            <div id="r-datos" class="stack" style="gap:24px">
            <span id="r-juego" class="mono muted" style="font-size:13px"></span>
            <div class="fps-big">
                <span id="r-num" class="num" style="font-size:clamp(44px,5vw,68px);white-space:nowrap"></span><span class="unit">FPS</span>
            </div>
            <span id="r-nivel" class="fps-label"></span>
            <div>
                <div class="gauge"><span id="r-gauge"></span></div>
                <div class="gauge-scale"><span>0</span><span>30</span><span>60</span><span>144+</span></div>
            </div>
            <p style="margin:0;font-size:15px">Limita: <strong id="r-limita"></strong></p>
            <div id="r-detalle" class="stack" style="gap:16px"></div>
            <div class="card-inset note">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EB8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
                <p id="r-consejo"></p>
            </div>
            </div>
        </aside>
    </div>
    <p class="disclaimer" style="margin-top:24px"><strong>Cómo calculamos:</strong> leemos los requisitos oficiales del juego en Steam, estimamos qué rinden las placas y procesadores que piden, y comparamos con los tuyos. Tomamos lo que permite la placa de video según resolución y calidad y lo que permite el procesador, y nos quedamos con el menor. Es una estimación: no contempla trazado de rayos, escalado (DLSS / FSR), mods ni versiones de controladores.</p>
</section>
@endsection
