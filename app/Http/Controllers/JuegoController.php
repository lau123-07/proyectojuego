<?php

namespace App\Http\Controllers;

use App\Services\Igdb;
use App\Services\SteamStore;
use App\Services\YouTube;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JuegoController extends Controller
{
    public function __construct(private SteamStore $steam, private Igdb $igdb, private YouTube $youtube) {}

    public function buscar(Request $request)
    {
        try {
            return response()->json($this->steam->buscar((string) $request->query('q', '')));
        } catch (ConnectionException) {
            return response()->json(['error' => 'No pudimos conectar con Steam.'], 503);
        }
    }

    public function mostrar(int $appId)
    {
        try {
            $juego = $this->steam->juego($appId);
        } catch (ConnectionException) {
            abort(503, 'No pudimos conectar con Steam. Probá de nuevo en unos minutos.');
        }

        abort_if($juego === null, 404, 'No encontramos ese juego en Steam.');

        return view('juego', [
            'juego' => $juego,
            'tiempos' => $this->tiempos($appId),
        ]);
    }

    /** Ficha del juego en JSON (la usa la calculadora). */
    public function datos(int $appId)
    {
        try {
            $juego = $this->steam->juego($appId);
        } catch (ConnectionException) {
            return response()->json(['error' => 'No pudimos conectar con Steam.'], 503);
        }

        return $juego ? response()->json($juego) : response()->json(['error' => 'No encontramos ese juego en Steam.'], 404);
    }

    /** Videos de rendimiento con la placa de video del usuario y análisis del juego. */
    public function videos(Request $request, int $appId)
    {
        $juego = rescue(fn () => $this->steam->juego($appId), null, false);
        if (! $juego) {
            return response()->json(['error' => 'No encontramos ese juego.'], 404);
        }

        // La placa llega del navegador: se limita a caracteres de nombres de modelos.
        $gpu = trim(preg_replace('/[^\pL\pN ]+/u', ' ', mb_substr((string) $request->query('gpu', ''), 0, 60)));
        $consultas = [
            'rendimiento' => trim("{$juego['nombre']} $gpu benchmark PC"),
            'analisis' => "{$juego['nombre']} análisis review",
        ];

        $respuesta = ['configurado' => $this->youtube->configurado()];
        foreach ($consultas as $clave => $consulta) {
            $respuesta[$clave] = ['consulta' => $consulta, 'url' => YouTube::urlBusqueda($consulta), 'videos' => []];
            if ($respuesta['configurado']) {
                try {
                    $respuesta[$clave]['videos'] = $this->youtube->buscar($consulta);
                } catch (ConnectionException|RequestException $e) {
                    Log::warning('YouTube no respondió', ['consulta' => $consulta, 'error' => $e->getMessage()]);
                    $respuesta['error'] = true;
                }
            }
        }

        return response()->json($respuesta);
    }

    /** Estado de los tiempos de juego: sin configurar, con error, sin datos o con horas. */
    private function tiempos(int $appId): array
    {
        if (! $this->igdb->configurado()) {
            return ['estado' => 'sin-configurar'];
        }

        try {
            $tiempos = $this->igdb->tiemposDeSteam($appId);
        } catch (ConnectionException|RequestException $e) {
            Log::warning('IGDB no respondió', ['appId' => $appId, 'error' => $e->getMessage()]);

            return ['estado' => 'error'];
        }

        return $tiempos ? ['estado' => 'ok'] + $tiempos : ['estado' => 'sin-datos'];
    }
}
