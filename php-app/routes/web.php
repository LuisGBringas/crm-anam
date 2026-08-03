<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/mapa', MapController::class)->name('map');

    Route::get('/unidades/report', [UnitController::class, 'reportList'])->name('units.report.list');
    Route::post('/unidades/{unit}/status', [UnitController::class, 'updateStatus'])->name('units.status');
    Route::get('/unidades/{unit}/report', [UnitController::class, 'report'])->name('units.report');
    Route::resource('unidades', UnitController::class)->parameters(['unidades' => 'unit']);

    Route::get('/tickets/report', [TicketController::class, 'reportList'])->name('tickets.report.list');
    Route::post('/tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.status');
    Route::get('/tickets/{ticket}/report', [TicketController::class, 'report'])->name('tickets.report');
    Route::resource('tickets', TicketController::class)->parameters(['tickets' => 'ticket']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
