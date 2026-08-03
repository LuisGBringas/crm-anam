<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-[#611232]">Tickets</h1>
            <div class="flex gap-2">
                <a href="{{ route('tickets.report.list', request()->query()) }}" class="rounded-md border border-[#611232] px-3 py-2 text-sm font-semibold text-[#611232] hover:bg-[#611232]/5">Descargar informe PDF</a>
                <a href="{{ route('tickets.create') }}" class="rounded-md bg-[#611232] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4e0e27]">+ Nuevo ticket</a>
            </div>
        </div>
    </x-slot>

    <form method="GET" class="mb-4 flex flex-wrap gap-3 rounded-md border border-slate-200 bg-white p-4">
        <input name="search" value="{{ $filters['search'] ?? '' }}" placeholder="Buscar por sitio, equipo, problema o ticket…" class="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm">
        <select name="origen" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Todos los orígenes</option>
            <option value="cosisi" @selected(($filters['origen'] ?? '') === 'cosisi')>COSISI</option>
            <option value="erni_sedena" @selected(($filters['origen'] ?? '') === 'erni_sedena')>ERNI · SEDENA</option>
            <option value="erni_semar" @selected(($filters['origen'] ?? '') === 'erni_semar')>ERNI · SEMAR</option>
            <option value="manual" @selected(($filters['origen'] ?? '') === 'manual')>Manual</option>
        </select>
        <select name="estatus" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Todos los estatus</option>
            <option value="abierto" @selected(($filters['estatus'] ?? '') === 'abierto')>Abierto</option>
            <option value="en_proceso" @selected(($filters['estatus'] ?? '') === 'en_proceso')>En proceso</option>
            <option value="resuelto" @selected(($filters['estatus'] ?? '') === 'resuelto')>Resuelto</option>
            <option value="cancelado" @selected(($filters['estatus'] ?? '') === 'cancelado')>Cancelado</option>
        </select>
        <button class="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Filtrar</button>
    </form>

    <div class="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                    <th class="px-4 py-3">Sitio</th>
                    <th class="px-4 py-3">Equipo</th>
                    <th class="px-4 py-3">Origen</th>
                    <th class="px-4 py-3">Ticket #</th>
                    <th class="px-4 py-3">Estatus</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($tickets as $ticket)
                    <tr class="border-t border-slate-100 hover:bg-slate-50">
                        <td class="px-4 py-3 font-medium text-slate-800"><a class="hover:underline" href="{{ route('tickets.show', $ticket) }}">{{ $ticket->site_name ?: '—' }}</a></td>
                        <td class="px-4 py-3">{{ $ticket->equipo ?: '—' }}</td>
                        <td class="px-4 py-3">{{ $ticket->origen }}</td>
                        <td class="px-4 py-3">{{ $ticket->ticket_number ?: '—' }}</td>
                        <td class="px-4 py-3"><span class="rounded bg-slate-100 px-2 py-1 text-xs">{{ $ticket->estatus }}</span></td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">No se encontraron tickets.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $tickets->links() }}</div>
</x-app-layout>
