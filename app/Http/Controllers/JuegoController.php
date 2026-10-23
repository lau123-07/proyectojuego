<?php

namespace App\Http\Controllers;

use App\Services\Igdb;
use App\Services\SteamStore;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JuegoController extends Controller
{
    public function __construct(private SteamStore $steam, private Igdb $igdb) {}

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
