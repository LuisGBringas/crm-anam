<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between gap-2">
            <h1 class="text-xl font-semibold text-[#611232]">{{ $unit->name }}</h1>
            <div class="flex gap-2">
                <a href="{{ route('units.report', $unit) }}" class="rounded-md border border-[#611232] px-3 py-2 text-sm font-semibold text-[#611232] hover:bg-[#611232]/5">Descargar informe PDF</a>
                <a href="{{ route('unidades.edit', $unit) }}" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Editar</a>
                <form method="POST" action="{{ route('unidades.destroy', $unit) }}" onsubmit="return confirm('¿Eliminar esta unidad?')">
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
                <dt class="text-slate-500">Sitio / Aduana</dt><dd>{{ $unit->site_name ?: '—' }}</dd>
                <dt class="text-slate-500">Código VPN</dt><dd>{{ $unit->vpn_code ?: '—' }}</dd>
                <dt class="text-slate-500">Categoría</dt><dd>{{ $unit->category ?: '—' }}</dd>
                <dt class="text-slate-500">Marca / Modelo</dt><dd>{{ collect([$unit->marca, $unit->modelo])->filter()->join(' / ') ?: '—' }}</dd>
                <dt class="text-slate-500">Número de serie</dt><dd>{{ $unit->numero_serie ?: '—' }}</dd>
                <dt class="text-slate-500">Ubicación</dt><dd>{{ $unit->latitude && $unit->longitude ? $unit->latitude.', '.$unit->longitude : 'Sin geocodificar' }}</dd>
                <dt class="text-slate-500">Estatus</dt><dd><span class="rounded px-2 py-1 text-xs {{ $unit->status === 'correcto' ? 'bg-green-100 text-green-700' : ($unit->status === 'mantenimiento_programado' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') }}">{{ $unit->status }}</span></dd>
            </dl>

            @if ($unit->notes)
                <div class="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{{ $unit->notes }}</div>
            @endif
        </div>

        <div class="rounded-md border border-slate-200 bg-white p-5">
            <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Cambiar estatus</h3>
            <form method="POST" action="{{ route('units.status', $unit) }}" class="space-y-2">
                @csrf
                <select name="status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                    <option value="correcto">Correcto</option>
                    <option value="mantenimiento_programado">Mantenimiento programado</option>
                    <option value="mantenimiento_necesario">Mantenimiento necesario</option>
                </select>
                <input name="note" placeholder="Nota (opcional)" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <button class="w-full rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white">Actualizar estatus</button>
            </form>
        </div>
    </div>

    <div class="mt-6 grid gap-6 xl:grid-cols-2">
        <div class="rounded-md border border-slate-200 bg-white p-5">
            <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Tickets relacionados</h3>
            <ul class="space-y-2 text-sm">
                @forelse ($tickets as $ticket)
                    <li class="flex items-center justify-between rounded border border-slate-100 px-3 py-2">
                        <a href="{{ route('tickets.show', $ticket) }}" class="truncate hover:underline">{{ $ticket->ticket_number ?: $ticket->origen }} · {{ $ticket->problema ?: 'Sin descripción' }}</a>
                        <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{{ $ticket->estatus }}</span>
                    </li>
                @empty
                    <li class="text-slate-500">Sin tickets relacionados.</li>
                @endforelse
            </ul>
        </div>
        <div class="rounded-md border border-slate-200 bg-white p-5">
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
    </div>
</x-app-layout>
