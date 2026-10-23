<?php

use App\Http\Controllers\JuegoController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'inicio')->name('inicio');
Route::get('/buscar-juegos', [JuegoController::class, 'buscar'])->name('juegos.buscar');
Route::get('/juego/{appId}', [JuegoController::class, 'mostrar'])->whereNumber('appId')->name('juego');
Route::view('/comparador', 'comparador')->name('comparador');
Route::view('/calculadora', 'calculadora')->name('calculadora');
Route::view('/componentes', 'componentes')->name('componentes');
