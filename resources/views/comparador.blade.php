@extends('layouts.app')

@section('titulo', 'Comparador de PC')
@section('pagina', 'comparador')

@section('contenido')
<section class="container page-head">
    <span class="eyebrow">Comparador</span>
    <h1 class="h1" style="font-size:clamp(40px,6vw,72px)">PC contra PC</h1>
    <p class="lead">Compará tu equipo con otra configuración y mirá la diferencia estimada de FPS en cada juego.</p>
</section>

<section class="container section">
    <div class="vs">
        <form id="pc-a" class="card stack">
            <div class="pc-label"><span class="dot"></span>PC A · Mi PC</div>
            <div class="field"><label for="a-cpu">Procesador</label><select id="a-cpu" class="select"></select></div>
            <div class="field"><label for="a-gpu">Placa de video</label><select id="a-gpu" class="select"></select></div>
            <div class="field"><label for="a-ram">Memoria RAM</label>
                <select id="a-ram" class="select"><option value="8">8 GB</option><option value="16">16 GB</option><option value="32">32 GB</option><option value="64">64 GB</option></select>
            </div>
        </form>
        <form id="pc-b" class="card stack">
            <div class="pc-label"><span class="dot alt"></span>PC B · Alternativa</div>
            <div class="field"><label for="b-cpu">Procesador</label><select id="b-cpu" class="select"></select></div>
            <div class="field"><label for="b-gpu">Placa de video</label><select id="b-gpu" class="select"></select></div>
            <div class="field"><label for="b-ram">Memoria RAM</label>
                <select id="b-ram" class="select"><option value="8">8 GB</option><option value="16">16 GB</option><option value="32">32 GB</option><option value="64">64 GB</option></select>
            </div>
        </form>
    </div>

    <div class="card" style="margin-top:24px">
        <h2 style="font-size:22px;margin-bottom:24px">Componente por componente</h2>
        <div id="comparacion" class="stack" style="gap:28px"></div>
    </div>
</section>

<section class="container section" aria-labelledby="por-juego">
    <div class="section-head">
        <div>
            <span class="kicker">FPS POR JUEGO</span>
            <h2 id="por-juego" class="h2" style="margin-top:6px">Diferencia en tus juegos</h2>
        </div>
        <div class="fields" style="gap:12px;flex:0 1 560px">
            <div id="seg-res" class="segmented" data-opciones="1080p,1440p,4K" data-valor="1440p" aria-label="Resolución" style="flex:1 1 220px"></div>
            <div id="seg-cal" class="segmented" data-opciones="Baja,Media,Alta,Ultra" data-valor="Alta" aria-label="Calidad" style="flex:1 1 280px"></div>
        </div>
    </div>
    <div class="table-wrap">
        <table id="tabla-juegos">
            <thead>
                <tr>
                    <th scope="col">Juego</th>
                    <th scope="col">PC A</th>
                    <th scope="col">PC B</th>
                    <th scope="col">Diferencia</th>
                    <th scope="col">Limita en PC B</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    <p class="muted mono" style="font-size:13px;margin:12px 0 0" id="contexto"></p>
</section>
@endsection
