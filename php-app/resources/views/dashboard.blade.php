<x-app-layout>
    <x-slot name="header">
        <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#611232]">Dashboard</p>
            <h2 class="text-2xl font-semibold text-slate-800">Resumen operativo de ANAM</h2>
        </div>
    </x-slot>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-sm text-slate-500">Unidades registradas</p>
            <p class="mt-2 text-3xl font-semibold text-slate-800">{{ $totalUnits }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-sm text-slate-500">Unidades en alerta</p>
            <p class="mt-2 text-3xl font-semibold text-slate-800">{{ $unitsInNeed }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-sm text-slate-500">Tickets activos</p>
            <p class="mt-2 text-3xl font-semibold text-slate-800">{{ $openTickets }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-sm text-slate-500">Tickets registrados</p>
            <p class="mt-2 text-3xl font-semibold text-slate-800">{{ $totalTickets }}</p>
        </div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-lg font-semibold text-slate-800">Estado de unidades</h3>
            @foreach (['correcto' => 'Correcto', 'mantenimiento_programado' => 'Mantenimiento programado', 'mantenimiento_necesario' => 'Mantenimiento necesario'] as $status => $label)
                <div class="mb-2 flex items-center justify-between text-sm">
                    <span>{{ $label }}</span>
                    <span class="font-semibold">{{ $unitsByStatus[$status] ?? 0 }}</span>
                </div>
            @endforeach
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-lg font-semibold text-slate-800">Estado de tickets</h3>
            @foreach (['abierto' => 'Abierto', 'en_proceso' => 'En proceso', 'resuelto' => 'Resuelto', 'cancelado' => 'Cancelado'] as $status => $label)
                <div class="mb-2 flex items-center justify-between text-sm">
                    <span>{{ $label }}</span>
                    <span class="font-semibold">{{ $ticketsByStatus[$status] ?? 0 }}</span>
                </div>
            @endforeach
        </div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-2">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-lg font-semibold text-slate-800">Sitios con más tickets</h3>
            <ul class="space-y-2 text-sm">
                @forelse ($topSites as $site)
                    <li class="flex items-center justify-between">
                        <span class="truncate">{{ $site->site_name }}</span>
                        <span class="font-semibold">{{ $site->total }}</span>
                    </li>
                @empty
                    <li class="text-slate-500">Sin tickets registrados.</li>
                @endforelse
            </ul>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="mb-3 text-lg font-semibold text-slate-800">Actividad reciente</h3>
            <ul class="space-y-2 text-sm">
                @forelse ($recentTickets as $ticket)
                    <li class="flex items-center justify-between gap-2">
                        <span class="truncate">{{ $ticket->site_name ?: 'Sitio sin nombre' }} @if($ticket->equipo)· {{ $ticket->equipo }}@endif</span>
                        <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{{ $ticket->estatus }}</span>
                    </li>
                @empty
                    <li class="text-slate-500">Sin tickets registrados.</li>
                @endforelse
            </ul>
        </div>
    </div>
</x-app-layout>
