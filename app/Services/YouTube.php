<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Búsqueda de videos con la API oficial de YouTube (Data API v3).
 * Cada búsqueda consume 100 de las 10.000 unidades diarias gratuitas, por eso se guardan una semana.
 */
class YouTube
{
    public function configurado(): bool
    {
        return filled(config('services.youtube.key'));
    }

    public static function urlBusqueda(string $consulta): string
    {
        return 'https://www.youtube.com/results?search_query='.urlencode($consulta);
    }

    /** @return array<int, array{id:string, titulo:string, canal:string, miniatura:?string, fecha:?string}> */
    public function buscar(string $consulta, int $cantidad = 4): array
    {
        return Cache::remember('youtube:'.md5($consulta), now()->addWeek(), function () use ($consulta, $cantidad) {
            $items = Http::timeout(8)->get('https://www.googleapis.com/youtube/v3/search', [
                'part' => 'snippet',
                'type' => 'video',
                'q' => $consulta,
                'maxResults' => $cantidad,
                'safeSearch' => 'strict',
                'key' => config('services.youtube.key'),
            ])->throw()->json('items', []);

            return collect($items)->map(fn ($item) => [
                'id' => $item['id']['videoId'],
                'titulo' => html_entity_decode($item['snippet']['title'], ENT_QUOTES | ENT_HTML5),
                'canal' => $item['snippet']['channelTitle'],
                'miniatura' => $item['snippet']['thumbnails']['medium']['url'] ?? null,
                'fecha' => substr($item['snippet']['publishedAt'] ?? '', 0, 10) ?: null,
            ])->all();
        });
    }
}
