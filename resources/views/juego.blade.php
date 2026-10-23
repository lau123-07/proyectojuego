@extends('layouts.app')

@section('titulo', $juego['nombre'].' — ¿Lo corre?')
@section('pagina', 'juego')

@section('contenido')
<section class="container page-head">
    <a href="{{ route('inicio') }}" style="font-size:14px;text-decoration:none">← Buscar otro juego</a>
    <div class="game-hero">
        @if ($juego['imagen'])
            <img class="cover-img" src="{{ $juego['imagen'] }}" alt="Portada de {{ $juego['nombre'] }}" width="460" height="215">
        @endif
        <div class="stack" style="gap:12px;flex:1 1 420px;min-width:0">
            <span class="eyebrow">¿Tu PC lo corre?</span>
            <h1 class="h1" style="font-size:clamp(36px,5.5vw,64px)">{{ $juego['nombre'] }}</h1>
            <div class="meta">
                @if ($juego['desarrolladores'])<span>{{ implode(', ', $juego['desarrolladores']) }}</span>@endif
                @if ($juego['lanzamiento'])<span>{{ $juego['lanzamiento'] }}</span>@endif
                @if ($juego['generos'])<span>{{ implode(' · ', array_slice($juego['generos'], 0, 3)) }}</span>@endif
            </div>
            @php
                $mc = $juego['metacritic']['puntaje'] ?? null;
                $mcClase = $mc === null ? 'mc-na' : ($mc >= 75 ? 'mc-alto' : ($mc >= 50 ? 'mc-medio' : 'mc-bajo'));
            @endphp
            <a class="metacritic {{ $mcClase }}" @if ($juego['metacritic']['url'] ?? null) href="{{ $juego['metacritic']['url'] }}" target="_blank" rel="noopener" @endif>
                <span class="mc-num">{{ $mc ?? '—' }}</span>
                <span class="mc-txt"><strong>Metacritic</strong>{{ $mc === null ? 'Sin puntaje de la crítica' : ($mc >= 75 ? 'Críticas favorables' : ($mc >= 50 ? 'Críticas mixtas' : 'Críticas desfavorables')) }}</span>
            </a>
        </div>
    </div>
    <div class="precio-grande">
        @if ($juego['gratis'])
            <span class="precio-final">Gratis</span>
        @elseif ($juego['precio'])
            @if ($juego['precio']['descuento'])
                <span class="precio-desc">-{{ $juego['precio']['descuento'] }}%</span>
                <span class="precio-montos" style="align-items:flex-start">
                    <s>Antes {{ $juego['precio']['inicial'] }}</s>
                    <span class="precio-final">{{ $juego['precio']['final'] }}</span>
                </span>
            @else
                <span class="precio-final">{{ $juego['precio']['final'] }}</span>
            @endif
        @else
            <span class="muted">Sin precio disponible en Steam Argentina</span>
        @endif
        <span class="fuente" style="flex:1 1 220px">Precio de Steam Argentina. Puede no incluir los impuestos de tu medio de pago.</span>
        <a class="btn btn-ghost btn-sm" href="{{ $juego['url'] }}" target="_blank" rel="noopener">Ver en Steam ↗</a>
    </div>
    @if ($juego['descripcion'])
        <p class="lead" style="max-width:820px;font-size:17px">{{ $juego['descripcion'] }}</p>
    @endif
    @if ($juego['tipo'] !== 'game')
        <div class="card-inset note" style="max-width:820px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EB8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
            <p>Este título es un contenido adicional (DLC): necesitás el juego base para usarlo.</p>
        </div>
    @endif
    <div id="veredicto" class="verdict" role="status" style="max-width:820px"></div>
    <p class="fuente">Datos de <a href="{{ $juego['url'] }}" target="_blank" rel="noopener">Steam</a> · consultados el {{ \Illuminate\Support\Carbon::parse($juego['consultado'])->format('d/m/Y H:i') }}</p>
</section>

<section class="container section" aria-labelledby="horas" style="padding-bottom:56px">
    <h2 id="horas" style="font-size:22px;margin-bottom:16px">¿Cuánto dura?</h2>
    @if ($tiempos['estado'] === 'ok')
        @php
            $horas = fn ($h) => $h === null ? '—' : ($h < 1 ? round($h * 60).' min' : rtrim(rtrim(number_format($h, 1, ',', ''), '0'), ',').' h');
        @endphp
        <div class="horas">
            <div class="card hora">
                <span class="hora-titulo">Historia principal</span>
                <span class="hora-valor">{{ $horas($tiempos['principal']) }}</span>
                <span class="muted" style="font-size:14px">Yendo directo a la historia.</span>
            </div>
            <div class="card hora">
                <span class="hora-titulo">Historia + extras</span>
                <span class="hora-valor">{{ $horas($tiempos['extras']) }}</span>
                <span class="muted" style="font-size:14px">Con misiones secundarias y exploración.</span>
            </div>
            <div class="card hora">
                <span class="hora-titulo">Completista</span>
                <span class="hora-valor">{{ $horas($tiempos['completo']) }}</span>
                <span class="muted" style="font-size:14px">Haciendo todo lo que ofrece el juego.</span>
            </div>
        </div>
        <p class="fuente" style="margin-top:12px">
            Datos de @if ($tiempos['url'])<a href="{{ $tiempos['url'] }}" target="_blank" rel="noopener">IGDB</a>@else IGDB @endif
            · promedio de {{ number_format($tiempos['reportes'], 0, ',', '.') }} {{ $tiempos['reportes'] === 1 ? 'jugador' : 'jugadores' }}
        </p>
    @elseif ($tiempos['estado'] === 'sin-datos')
        <div class="card-inset note" style="max-width:820px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EB8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
            <p>IGDB todavía no tiene tiempos de juego reportados para este título.</p>
        </div>
    @elseif ($tiempos['estado'] === 'error')
        <div class="card-inset note" style="max-width:820px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9548" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
            <p>No pudimos consultar los tiempos de juego en este momento. Probá de nuevo en unos minutos.</p>
        </div>
    @else
        <div class="card-inset note" style="max-width:820px">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EB8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
            <p>Los tiempos de juego vienen de IGDB y falta configurar el acceso: cargá <code>IGDB_CLIENT_ID</code> e <code>IGDB_CLIENT_SECRET</code> en el archivo <code>.env</code> con los datos de una app creada en <a href="https://dev.twitch.tv/console/apps" target="_blank" rel="noopener">Twitch Developers</a>.</p>
        </div>
    @endif
</section>

<section class="container section" aria-labelledby="fps">
    <div class="row">
        <div class="card grow stack" style="gap:28px">
            <div class="section-head" style="margin:0">
                <div>
                    <span class="kicker">01 — RENDIMIENTO</span>
                    <h2 id="fps" class="h2" style="margin-top:6px">FPS estimados</h2>
                </div>
                <span id="fps-contexto" class="mono muted" style="font-size:13px"></span>
            </div>
            <div id="fps-bloque" class="stack" style="gap:28px">
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
                <div class="stack" style="gap:14px">
                    <div class="fps-big" aria-live="polite">
                        <span id="fps-num" class="num"></span><span class="unit">FPS</span>
                        <span id="fps-nivel" class="fps-label"></span>
                    </div>
                    <div>
                        <div class="gauge"><span id="fps-gauge"></span></div>
                        <div class="gauge-scale"><span>0</span><span>30</span><span>60</span><span>144+</span></div>
                    </div>
                    <p class="muted" style="margin:0;font-size:14px">Limita: <strong id="fps-limita" style="color:var(--text)"></strong>. Estimación derivada de los requisitos que publica el juego: tomamos la placa recomendada como referencia de unos 60 FPS en 1080p Alta. Sin trazado de rayos ni escalado (DLSS / FSR).</p>
                </div>
            </div>
        </div>
        <aside class="side stack">
            <h3 style="font-size:20px">Qué tener en cuenta</h3>
            <div id="notas" class="stack" style="gap:12px"></div>
        </aside>
    </div>

    <div id="matriz-bloque">
        <h3 style="font-size:20px;margin:40px 0 16px">Todas las combinaciones</h3>
        <div class="table-wrap">
            <table id="matriz" class="matrix">
                <thead><tr></tr></thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
</section>

<div id="analisis">
<section class="container section" aria-labelledby="analisis-titulo">
    <div class="section-head">
        <div>
            <span class="kicker">02 — ANÁLISIS DE TU PC</span>
            <h2 id="analisis-titulo" class="h2" style="margin-top:6px">Cuello de botella y temperaturas</h2>
        </div>
        <span id="analisis-contexto" class="mono muted" style="font-size:13px"></span>
    </div>
    <div class="row">
        <div class="card side stack" style="gap:20px" aria-live="polite">
            <h3 style="font-size:20px">Cuello de botella</h3>
            <div>
                <strong id="cuello-nivel" style="font-size:24px;letter-spacing:-0.02em"></strong>
                <p id="cuello-texto" style="margin:8px 0 0;color:var(--text-2);font-size:15px"></p>
            </div>
            <div id="cuello-barras" class="stack" style="gap:16px"></div>
            <p class="muted" style="margin:0;font-size:13px">Cambia según la resolución y la calidad elegidas arriba.</p>
        </div>
        <div class="card grow stack" style="gap:16px">
            <h3 style="font-size:20px">Temperaturas aproximadas</h3>
            <div class="table-wrap">
                <table id="temperaturas">
                    <thead>
                        <tr>
                            <th scope="col">Calidad</th>
                            <th scope="col">FPS</th>
                            <th scope="col">Uso GPU</th>
                            <th scope="col">Temp. GPU</th>
                            <th scope="col">Uso CPU</th>
                            <th scope="col">Temp. CPU</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
            <p class="muted" style="margin:0;font-size:13px">Estimación con refrigeración de fábrica, gabinete con buen flujo de aire y 25 °C de ambiente. Más calor ambiente, polvo o pasta térmica vieja suben los valores. Limitar los FPS (V-Sync o un tope de FPS) baja el uso y la temperatura.</p>
        </div>
    </div>
</section>

<section class="container section" aria-labelledby="mejoras-titulo">
    <div class="section-head">
        <div>
            <span class="kicker">03 — ACTUALIZACIÓN DE HARDWARE</span>
            <h2 id="mejoras-titulo" class="h2" style="margin-top:6px">Qué mejorar</h2>
        </div>
        <fieldset class="field" style="flex:0 1 300px">
            <legend>Objetivo en calidad Alta</legend>
            <div id="seg-objetivo" class="segmented" data-opciones="60 FPS,144 FPS" data-valor="60 FPS"></div>
        </fieldset>
    </div>
    <div id="mejoras" class="stack" style="gap:16px" aria-live="polite"></div>
</section>
</div>

<section class="container section" aria-labelledby="requisitos-titulo">
    <div class="section-head">
        <div>
            <span class="kicker">04 — REQUISITOS OFICIALES</span>
            <h2 id="requisitos-titulo" class="h2" style="margin-top:6px">Tu PC frente a los requisitos</h2>
        </div>
        <div class="chips">
            <span class="status status-rec">Cumple / recomendado</span>
            <span class="status status-min">Cumple mínimos</span>
            <span class="status status-bajo">Por debajo</span>
            <span class="status status-na">Sin comparar</span>
        </div>
    </div>
    <div id="requisitos-bloque">
        <div class="table-wrap">
            <table id="requisitos">
                <thead>
                    <tr>
                        <th scope="col">Componente</th>
                        <th scope="col">Tu PC</th>
                        <th scope="col">Mínimos (Steam)</th>
                        <th scope="col">Recomendados (Steam)</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>
    <p class="muted" style="font-size:14px;margin:16px 0 0">¿No es tu equipo? <a href="{{ route('inicio') }}#mi-pc">Editá tu PC</a> y volvé a comprobar.</p>
</section>

<section class="container section" aria-labelledby="fuentes-titulo">
    <div class="section-head">
        <div>
            <span class="kicker">05 — FUENTES Y VIDEOS</span>
            <h2 id="fuentes-titulo" class="h2" style="margin-top:6px">Comprobalo con otras fuentes</h2>
        </div>
        <p>Nuestras estimaciones son orientativas: los videos de rendimiento muestran el juego funcionando en equipos reales.</p>
    </div>

    <div class="stack" style="gap:28px">
        <div>
            <h3 id="videos-rend-titulo" style="font-size:19px;margin-bottom:14px">Rendimiento con tu placa de video</h3>
            <div id="videos-rendimiento" class="videos"><p class="muted">Buscando videos…</p></div>
        </div>
        <div>
            <h3 style="font-size:19px;margin-bottom:14px">Análisis y reseñas</h3>
            <div id="videos-analisis" class="videos"><p class="muted">Buscando videos…</p></div>
        </div>
        <div>
            <h3 style="font-size:19px;margin-bottom:14px">Páginas oficiales y de referencia</h3>
            <ul class="fuentes">
                @if ($juego['web'])
                    <li><a href="{{ $juego['web'] }}" target="_blank" rel="noopener"><strong>Sitio oficial</strong><span>{{ parse_url($juego['web'], PHP_URL_HOST) }}</span></a></li>
                @endif
                <li><a href="{{ $juego['url'] }}" target="_blank" rel="noopener"><strong>Steam</strong><span>Tienda, requisitos y reseñas de jugadores</span></a></li>
                @if ($juego['metacritic']['url'] ?? null)
                    <li><a href="{{ $juego['metacritic']['url'] }}" target="_blank" rel="noopener"><strong>Metacritic</strong><span>Puntaje y reseñas de la crítica</span></a></li>
                @endif
                <li><a href="https://www.pcgamingwiki.com/api/appid.php?appid={{ $juego['id'] }}" target="_blank" rel="noopener"><strong>PCGamingWiki</strong><span>Opciones gráficas, DLSS / FSR, arreglos conocidos</span></a></li>
                <li><a href="https://howlongtobeat.com/?q={{ urlencode($juego['nombre']) }}" target="_blank" rel="noopener"><strong>HowLongToBeat</strong><span>Duración según los jugadores</span></a></li>
            </ul>
        </div>
    </div>
</section>

<section class="container section">
    <h3 style="font-size:20px;margin-bottom:16px">Otros juegos</h3>
    <div class="chips">
        @foreach (config('juegos.populares') as $id => $nombre)
            @continue($id === $juego['id'])
            <a class="chip" href="{{ route('juego', $id) }}">{{ $nombre }}</a>
        @endforeach
    </div>
</section>

<script>window.JUEGO = @json($juego);</script>
@endsection
