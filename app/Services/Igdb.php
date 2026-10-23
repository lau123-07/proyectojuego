<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Tiempos para terminar un juego desde la API oficial de IGDB (Twitch).
 * IGDB los informa en segundos a partir de lo que reportan sus usuarios.
 */
class Igdb
{
    private const API = 'https://api.igdb.com/v4';

    private const FUENTE_STEAM = 1;

    public function configurado(): bool
    {
        return filled(config('services.igdb.client_id')) && filled(config('services.igdb.client_secret'));
    }

    /**
     * Horas por estilo de juego, o null si IGDB no tiene tiempos para ese juego.
     *
     * @return array{principal:?float, extras:?float, completo:?float, reportes:int, url:?string}|null
     */
    public function tiemposDeSteam(int $appId): ?array
    {
        $datos = Cache::remember("igdb:tiempos:$appId", now()->addWeek(), function () use ($appId) {
            $externo = $this->consultar('external_games', "fields game.id, game.url; where uid = \"$appId\" & external_game_source = ".self::FUENTE_STEAM.'; limit 1;');
            $juego = $externo[0]['game'] ?? null;
            if (! $juego) {
                return false;
            }

            $tiempos = $this->consultar('game_time_to_beats', "fields hastily, normally, completely, count; where game_id = {$juego['id']}; limit 1;")[0] ?? null;
            if (! $tiempos) {
                return false;
            }

            $horas = fn (?int $segundos) => $segundos ? round($segundos / 3600, 1) : null;

            return [
                'principal' => $horas($tiempos['hastily'] ?? null),
                'extras' => $horas($tiempos['normally'] ?? null),
                'completo' => $horas($tiempos['completely'] ?? null),
                'reportes' => $tiempos['count'] ?? 0,
                'url' => $juego['url'] ?? null,
            ];
        });

        return $datos ?: null;
    }

    private function consultar(string $endpoint, string $consulta): array
    {
        return Http::timeout(8)
            ->withHeaders(['Client-ID' => config('services.igdb.client_id')])
            ->withToken($this->token())
            ->withBody($consulta, 'text/plain')
            ->post(self::API.'/'.$endpoint)
            ->throw()
            ->json();
    }

    private function token(): string
    {
        $guardado = Cache::get('igdb:token');
        if ($guardado) {
            return $guardado;
        }

        $respuesta = Http::timeout(8)->asForm()->post('https://id.twitch.tv/oauth2/token', [
            'client_id' => config('services.igdb.client_id'),
            'client_secret' => config('services.igdb.client_secret'),
            'grant_type' => 'client_credentials',
        ])->throw();

        $token = $respuesta->json('access_token');
        Cache::put('igdb:token', $token, now()->addSeconds(max(60, $respuesta->json('expires_in', 3600) - 300)));

        return $token;
    }
}
