@extends('layouts.app')

@section('titulo', 'Buscador de componentes')
@section('pagina', 'componentes')

@section('contenido')
<section class="container page-head">
    <span class="eyebrow">Componentes</span>
    <h1 class="h1" style="font-size:clamp(40px,6vw,72px)">Buscador de componentes</h1>
    <p class="lead">Encontrá procesadores y placas de video, compará su rendimiento relativo y sumalos a tu PC.</p>
</section>

<section class="container section">
    <div class="card stack" style="gap:20px;margin-bottom:24px">
        <div class="search-box" style="max-width:none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A94A6" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <label for="q" class="sr-only">Buscar componente</label>
            <input id="q" type="search" autocomplete="off" placeholder="Buscá por modelo: RTX 4060, Ryzen 5…">
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between">
            <div id="tabs" class="tabs" role="group" aria-label="Tipo de componente">
                <button type="button" data-tipo="todos" aria-pressed="true">Todos</button>
                <button type="button" data-tipo="cpu" aria-pressed="false">Procesadores</button>
                <button type="button" data-tipo="gpu" aria-pressed="false">Placas de video</button>
            </div>
            <div class="fields" style="gap:12px;flex:0 1 600px">
                <div class="field field-sm"><label for="marca">Marca</label>
                    <select id="marca" class="select"><option value="todas">Todas</option><option>AMD</option><option>Intel</option><option>NVIDIA</option></select>
                </div>
                <div class="field field-sm"><label for="gama">Gama</label>
                    <select id="gama" class="select"><option value="todas">Todas</option><option>Entrada</option><option>Media</option><option>Alta</option><option>Entusiasta</option></select>
                </div>
                <div class="field field-sm"><label for="orden">Ordenar por</label>
                    <select id="orden" class="select"><option value="rend">Rendimiento</option><option value="nombre">Nombre</option></select>
                </div>
            </div>
        </div>
    </div>
    <p id="conteo" class="mono muted" style="font-size:13px;margin:0 0 16px" aria-live="polite"></p>
    <div id="resultados" class="grid-cards"></div>
</section>
@endsection
