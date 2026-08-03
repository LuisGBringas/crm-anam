<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Unit;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $totalUnits = Unit::count();
        $unitsInNeed = Unit::where('status', '!=', 'correcto')->count();
        $totalTickets = Ticket::count();
        $openTickets = Ticket::whereIn('estatus', ['abierto', 'en_proceso'])->count();

        $unitsByStatus = Unit::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $ticketsByStatus = Ticket::selectRaw('estatus, count(*) as total')
            ->groupBy('estatus')
            ->pluck('total', 'estatus');

        $ticketsByOrigen = Ticket::selectRaw('origen, count(*) as total')
            ->groupBy('origen')
            ->pluck('total', 'origen');

        $topSites = Ticket::selectRaw('site_name, count(*) as total')
            ->whereNotNull('site_name')
            ->where('site_name', '!=', '')
            ->groupBy('site_name')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        $recentTickets = Ticket::orderByDesc('created_at')->limit(6)->get();

        return view('dashboard', compact(
            'totalUnits',
            'unitsInNeed',
            'totalTickets',
            'openTickets',
            'unitsByStatus',
            'ticketsByStatus',
            'ticketsByOrigen',
            'topSites',
            'recentTickets',
        ));
    }
}
