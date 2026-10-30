<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class JuegoControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        // Sin claves de YouTube ni IGDB: la app tiene que andar igual.
        config(['services.youtube.key' => null]);
    }

    private function steamCon(int $appId, array $datos): void
    {
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response([
            (string) $appId => ['success' => true, 'data' => $datos + ['steam_appid' => $appId, 'name' => 'Juego de prueba']],
        ])]);
    }

    public function test_las_pantallas_estaticas_cargan(): void
    {
        foreach (['/', '/comparador', '/calculadora', '/componentes'] as $ruta) {
            $this->get($ruta)->assertOk();
        }
    }

    public function test_datos_devuelve_la_ficha_en_json(): void
    {
        $this->steamCon(123, []);

        $this->getJson('/juego/123/datos')
            ->assertOk()
            ->assertJsonPath('id', 123)
            ->assertJsonPath('nombre', 'Juego de prueba');
    }

    public function test_juego_inexistente_da_404(): void
    {
        Http::fake(['store.steampowered.com/api/appdetails*' => Http::response(['999' => ['success' => false]])]);

        $this->getJson('/juego/999/datos')->assertNotFound();
    }

    public function test_sin_conexion_con_steam_da_503(): void
    {
        Http::fake(['store.steampowered.com/*' => Http::failedConnection()]);

        $this->getJson('/juego/123/datos')->assertStatus(503);
        $this->getJson('/buscar-juegos?q=cyberpunk')->assertStatus(503);
    }

    public function test_la_ruta_del_juego_solo_acepta_numeros(): void
    {
        $this->get('/juego/abc')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_videos_limpia_la_placa_que_manda_el_navegador(): void
    {
        $this->steamCon(123, []);

        $respuesta = $this->getJson('/juego/123/videos?gpu='.urlencode('RTX 3060<script>"&'))->assertOk();

        $this->assertFalse($respuesta->json('configurado'));
        $this->assertSame('Juego de prueba RTX 3060 script benchmark PC', $respuesta->json('rendimiento.consulta'));
    }
}
