<?php

namespace Tests\Feature;

use App\Services\SteamStore;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SteamStoreTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Ninguna prueba sale a internet: si algo llama a Steam sin un fake, la prueba falla.
        Http::preventStrayRequests();
    }

    private function fichaFalsa(array $datos = []): array
    {
        return ['1091500' => ['success' => true, 'data' => $datos + [
            'steam_appid' => 1091500,
            'name' => 'Cyberpunk 2077',
            'short_description' => 'Un RPG de &quot;mundo abierto&quot;.',
            'pc_requirements' => [
                'minimum' => '<strong>Mínimo:</strong><br><ul class="bb_ul">'
                    .'<li><strong>Procesador:</strong> Core i7-6700 or Ryzen 5 1600<br></li>'
                    .'<li><strong>Memoria:</strong> 12 GB de RAM<br></li>'
                    .'<li><strong>Gráficos:</strong> GeForce GTX 1060 6GB.</li></ul>',
                'recommended' => '<ul><li><strong>Graphics:</strong> GeForce RTX 2060 SUPER</li></ul>',
            ],
            'price_overview' => ['currency' => 'USD', 'initial' => 5999, 'final' => 2999],
        ]]];
    }

    public function test_separa_los_requisitos_en_campos(): void
    {
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response($this->fichaFalsa())]);

        $juego = app(SteamStore::class)->juego(1091500);

        $this->assertSame('Core i7-6700 or Ryzen 5 1600', $juego['min']['cpu']);
        $this->assertSame('12 GB de RAM', $juego['min']['ram']);
        $this->assertSame('GeForce GTX 1060 6GB', $juego['min']['gpu']); // sin el punto final
        $this->assertSame('GeForce RTX 2060 SUPER', $juego['rec']['gpu']); // etiqueta en inglés
        $this->assertSame('Un RPG de "mundo abierto".', $juego['descripcion']);
    }

    public function test_calcula_precio_y_descuento(): void
    {
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response($this->fichaFalsa())]);

        $precio = app(SteamStore::class)->juego(1091500)['precio'];

        $this->assertSame('US$ 59,99', $precio['inicial']);
        $this->assertSame('US$ 29,99', $precio['final']);
        $this->assertSame(50, $precio['descuento']);
    }

    public function test_sin_requisitos_devuelve_null(): void
    {
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response($this->fichaFalsa(['pc_requirements' => []]))]);

        $juego = app(SteamStore::class)->juego(1091500);

        $this->assertNull($juego['min']);
        $this->assertNull($juego['rec']);
    }

    public function test_aplica_el_tope_de_fps_configurado(): void
    {
        config(['juegos.topes_fps' => [1091500 => 60]]);
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response($this->fichaFalsa())]);

        $this->assertSame(60, app(SteamStore::class)->juego(1091500)['tope_fps']);
    }

    public function test_usa_la_cache_y_no_vuelve_a_consultar_steam(): void
    {
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response($this->fichaFalsa())]);

        app(SteamStore::class)->juego(1091500);
        app(SteamStore::class)->juego(1091500);

        Http::assertSentCount(1);
    }

    public function test_la_busqueda_descarta_bandas_sonoras_y_juegos_sin_windows(): void
    {
        Http::fake(['store.steampowered.com/api/storesearch*' => Http::response(['items' => [
            ['type' => 'app', 'id' => 1, 'name' => 'Juego', 'platforms' => ['windows' => true]],
            ['type' => 'app', 'id' => 2, 'name' => 'Juego Soundtrack', 'platforms' => ['windows' => true]],
            ['type' => 'app', 'id' => 3, 'name' => 'Juego para Mac', 'platforms' => ['windows' => false]],
        ]])]);

        $resultados = app(SteamStore::class)->buscar('juego');

        $this->assertSame([1], array_column($resultados, 'id'));
    }

    public function test_la_busqueda_con_menos_de_dos_letras_no_consulta_steam(): void
    {
        $this->assertSame([], app(SteamStore::class)->buscar('a'));
        Http::assertNothingSent();
    }
}
