<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Datos de juegos desde la tienda de Steam (búsqueda y ficha con requisitos de PC).
 * Las respuestas se guardan en caché para no superar el límite de consultas de Steam.
 */
class SteamStore
{
    private const BASE = 'https://store.steampowered.com/api';

    private const CAMPOS = [
        'so' => ['so', 'sistema operativo', 'os'],
        'cpu' => ['procesador', 'processor', 'cpu'],
        'ram' => ['memoria', 'memory'],
        'gpu' => ['gráficos', 'graficos', 'tarjeta gráfica', 'graphics', 'video card'],
        'directx' => ['directx'],
        'disco' => ['almacenamiento', 'disco duro', 'storage', 'hard drive', 'hard disk space'],
        'notas' => ['notas adicionales', 'additional notes'],
    ];

    /** @return array<int, array{id:int, nombre:string, imagen:?string, metascore:?string}> */
    public function buscar(string $texto): array
    {
        $texto = trim($texto);
        if (mb_strlen($texto) < 2) {
            return [];
        }

        // Caché corta: los precios y descuentos cambian seguido.
        return Cache::remember('steam:buscar:'.mb_strtolower($texto), now()->addHour(), function () use ($texto) {
            $respuesta = Http::timeout(8)->get(self::BASE.'/storesearch/', [
                'term' => $texto,
                'l' => 'spanish',
                'cc' => 'AR',
            ]);

            if (! $respuesta->ok()) {
                return [];
            }

            return collect($respuesta->json('items', []))
                ->where('type', 'app')
                ->filter(fn ($item) => $item['platforms']['windows'] ?? false)
                ->reject(fn ($item) => preg_match('/\b(soundtrack|ost|artbook|wallpapers?)\b/i', $item['name']))
                ->take(8)
                ->map(fn ($item) => [
                    'id' => $item['id'],
                    'nombre' => $item['name'],
                    'imagen' => $item['tiny_image'] ?? null,
                    'metacritic' => ($item['metascore'] ?? '') !== '' ? (int) $item['metascore'] : null,
                    'precio' => isset($item['price']) ? $this->precio(
                        $item['price']['currency'],
                        $item['price']['initial'],
                        $item['price']['final'],
                    ) : null,
                ])
                ->values()
                ->all();
        });
    }

    /** Ficha del juego, o null si Steam no la tiene. */
    public function juego(int $appId): ?array
    {
        $datos = Cache::remember("steam:juego:$appId", now()->addHours(3), function () use ($appId) {
            $respuesta = Http::timeout(10)->get(self::BASE.'/appdetails', [
                'appids' => $appId,
                'l' => 'spanish',
                'cc' => 'AR',
            ]);

            $bloque = $respuesta->json((string) $appId);
            if (! $respuesta->ok() || ! ($bloque['success'] ?? false)) {
                return false;
            }

            return $this->normalizar($bloque['data']) + ['consultado' => now()->toIso8601String()];
        });

        return $datos ?: null;
    }

    private function normalizar(array $d): array
    {
        $requisitos = is_array($d['pc_requirements'] ?? null) ? $d['pc_requirements'] : [];

        return [
            'id' => $d['steam_appid'],
            'tipo' => $d['type'] ?? 'game',
            'nombre' => $d['name'],
            'descripcion' => html_entity_decode(strip_tags($d['short_description'] ?? ''), ENT_QUOTES | ENT_HTML5),
            'imagen' => $d['header_image'] ?? null,
            'desarrolladores' => $d['developers'] ?? [],
            'editores' => $d['publishers'] ?? [],
            'generos' => collect($d['genres'] ?? [])->pluck('description')->all(),
            'lanzamiento' => $d['release_date']['date'] ?? null,
            'metacritic' => isset($d['metacritic']['score']) ? [
                'puntaje' => $d['metacritic']['score'],
                'url' => $d['metacritic']['url'] ?? null,
            ] : null,
            'web' => filled($d['website'] ?? null) ? $d['website'] : null,
            'tope_fps' => config("juegos.topes_fps.{$d['steam_appid']}"),
            'gratis' => (bool) ($d['is_free'] ?? false),
            'precio' => isset($d['price_overview']) ? $this->precio(
                $d['price_overview']['currency'],
                $d['price_overview']['initial'],
                $d['price_overview']['final'],
            ) : null,
            'url' => "https://store.steampowered.com/app/{$d['steam_appid']}/",
            'min' => $this->requisitos($requisitos['minimum'] ?? ''),
            'rec' => $this->requisitos($requisitos['recommended'] ?? ''),
        ];
    }

    /** Steam informa los montos en centavos. */
    private function precio(string $moneda, int $inicial, int $final): array
    {
        $formato = fn (int $centavos) => ($moneda === 'USD' ? 'US$ ' : "$moneda ").number_format($centavos / 100, 2, ',', '.');

        return [
            'moneda' => $moneda,
            'inicial' => $formato($inicial),
            'final' => $formato($final),
            'descuento' => $inicial > 0 && $final < $inicial ? (int) round((1 - $final / $inicial) * 100) : 0,
        ];
    }

    /** Convierte el HTML de requisitos de Steam en campos sueltos (texto original). */
    private function requisitos(string $html): ?array
    {
        if (trim($html) === '') {
            return null;
        }

        $campos = [];
        foreach (preg_split('/<li>/i', $html) as $item) {
            $texto = trim(html_entity_decode(strip_tags(str_ireplace(['<br>', '<br/>', '<br />'], ' ', $item)), ENT_QUOTES | ENT_HTML5));
            if (! preg_match('/^([^:]{2,40}):\s*(.+)$/su', $texto, $m)) {
                continue;
            }
            $etiqueta = mb_strtolower(trim($m[1]));
            foreach (self::CAMPOS as $clave => $alias) {
                if (in_array($etiqueta, $alias, true) && ! isset($campos[$clave])) {
                    $campos[$clave] = rtrim(preg_replace('/\s+/u', ' ', $m[2]), ' .');
                }
            }
        }

        return $campos ?: null;
    }
}
