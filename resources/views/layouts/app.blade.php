<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('titulo', '¿Tu PC lo corre?') · LoCorre</title>
    <meta name="description" content="Comprobá si tu PC corre un juego, mirá los requisitos y una estimación orientativa de FPS.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body data-page="@yield('pagina')">
    <header class="site-header">
        <nav class="container nav" aria-label="Principal">
            <a class="brand" href="{{ route('inicio') }}">
                <span class="brand-mark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B0E13" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14l5 5L20 6"/></svg>
                </span>
                LoCorre
            </a>
            <div class="nav-links">
                <a href="{{ route('inicio') }}" @if (request()->routeIs('inicio')) aria-current="page" @endif>Mi PC</a>
                <a href="{{ route('comparador') }}" @if (request()->routeIs('comparador')) aria-current="page" @endif>Comparador</a>
                <a href="{{ route('calculadora') }}" @if (request()->routeIs('calculadora')) aria-current="page" @endif>Calculadora FPS</a>
                <a href="{{ route('componentes') }}" @if (request()->routeIs('componentes')) aria-current="page" @endif>Componentes</a>
            </div>
            <a class="nav-pc" href="{{ route('inicio') }}#mi-pc" title="Editar mi PC"></a>
        </nav>
    </header>

    <main>
        @yield('contenido')
    </main>

    <footer class="site-footer">
        <div class="container">
            <p><strong>Resultados aproximados.</strong> Las estimaciones de compatibilidad y FPS son orientativas y pueden variar según los componentes exactos, los controladores, la versión del juego, el sistema operativo y el software en segundo plano.</p>
            <span class="muted" style="font-size:14px">© {{ date('Y') }} LoCorre</span>
        </div>
    </footer>

    <script src="{{ asset('js/catalogo.js') }}"></script>
    <script src="{{ asset('js/datos.js') }}"></script>
    <script src="{{ asset('js/reconocer.js') }}"></script>
    <script src="{{ asset('js/analisis.js') }}"></script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
