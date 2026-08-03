<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold text-[#611232]">{{ $ticket->site_name ?: 'Sitio sin nombre' }}</h1>
            <div class="flex gap-2">
                <a href="{{ route('tickets.report', $ticket) }}" class="rounded-md border border-[#611232] px-3 py-2 text-sm font-semibold text-[#611232] hover:bg-[#611232]/5">Descargar informe PDF</a>
                <a href="{{ route('tickets.edit', $ticket) }}" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Editar</a>
                <form method="POST" action="{{ route('tickets.destroy', $ticket) }}" onsubmit="return confirm('¿Eliminar este ticket?')">
                    @csrf
                    @method('DELETE')
                    <button class="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700">Eliminar</button>
                </form>
            </div>
        </div>
    </x-slot>

    <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="rounded-md border border-slate-200 bg-white p-5">
            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt class="text-slate-500">Origen</dt><dd>{{ $ticket->origen }}</dd>
                <dt class="text-slate-500">Ticket #</dt><dd>{{ $ticket->ticket_number ?: '—' }}</dd>
                <dt class="text-slate-500">Sitio</dt><dd>{{ $ticket->site_name ?: '—' }}</dd>
                <dt class="text-slate-500">Equipo</dt><dd>{{ $ticket->equipo ?: '—' }}</dd>
                <dt class="text-slate-500">Número de serie</dt><dd>{{ $ticket->numero_serie ?: '—' }}</dd>
                <dt class="text-slate-500">Fecha de apertura</dt><dd>{{ optional($ticket->fecha_apertura)->format('d/m/Y') ?: '—' }}</dd>
                <dt class="text-slate-500">Estatus</dt><dd><span class="rounded bg-slate-100 px-2 py-1 text-xs">{{ $ticket->estatus }}</span></dd>
            </dl>
            @if ($ticket->problema)
                <div class="mt-4">
                    <h3 class="mb-1 text-sm font-semibold text-slate-700">Problemática</h3>
                    <p class="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{{ $ticket->problema }}</p>
                </div>
            @endif
            @if ($ticket->ultimo_avance)
                <div class="mt-4">
                    <h3 class="mb-1 text-sm font-semibold text-slate-700">Último avance</h3>
                    <p class="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{{ $ticket->ultimo_avance }}</p>
                </div>
            @endif
        </div>

        <div class="rounded-md border border-slate-200 bg-white p-5">
            <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Cambiar estatus</h3>
            <form method="POST" action="{{ route('tickets.status', $ticket) }}" class="space-y-2">
                @csrf
                <select name="estatus" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <input name="note" placeholder="Nota (opcional)" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <button class="w-full rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white">Actualizar estatus</button>
            </form>
        </div>
    </div>

    <div class="mt-6 rounded-md border border-slate-200 bg-white p-5">
        <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Bitácora de estatus</h3>
        <ul class="space-y-2 text-sm">
            @forelse ($history as $entry)
                <li class="rounded border border-slate-100 px-3 py-2">
                    <p class="font-medium text-slate-700">{{ $entry->previous_status ? $entry->previous_status.' → '.$entry->new_status : 'Creado como '.$entry->new_status }}</p>
                    @if ($entry->note)<p class="text-slate-600">{{ $entry->note }}</p>@endif
                    <p class="text-xs text-slate-500">{{ $entry->changed_at?->format('d/m/Y H:i') }}</p>
                </li>
            @empty
                <li class="text-slate-500">Sin cambios registrados.</li>
            @endforelse
        </ul>
    </div>
</x-app-layout>
