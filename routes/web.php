<?php

use App\Http\Controllers\JuegoController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'inicio')->name('inicio');
Route::get('/buscar-juegos', [JuegoController::class, 'buscar'])->name('juegos.buscar');
Route::get('/juego/{appId}', [JuegoController::class, 'mostrar'])->whereNumber('appId')->name('juego');
Route::get('/juego/{appId}/datos', [JuegoController::class, 'datos'])->whereNumber('appId')->name('juego.datos');
Route::get('/juego/{appId}/videos', [JuegoController::class, 'videos'])->whereNumber('appId')->name('juego.videos');
Route::view('/comparador', 'comparador')->name('comparador');
Route::view('/calculadora', 'calculadora')->name('calculadora');
Route::view('/componentes', 'componentes')->name('componentes');
