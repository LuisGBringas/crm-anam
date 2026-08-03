<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-[#611232]">Lista de unidades</h1>
            <div class="flex gap-2">
                <a href="{{ route('units.report.list', request()->query()) }}" class="rounded-md border border-[#611232] px-3 py-2 text-sm font-semibold text-[#611232] hover:bg-[#611232]/5">Descargar informe PDF</a>
                <a href="{{ route('unidades.create') }}" class="rounded-md bg-[#611232] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4e0e27]">+ Nueva unidad</a>
            </div>
        </div>
    </x-slot>

    <form method="GET" class="mb-4 flex flex-wrap gap-3 rounded-md border border-slate-200 bg-white p-4">
        <input name="search" value="{{ $filters['search'] ?? '' }}" placeholder="Buscar por nombre, sitio o dirección…" class="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm">
        <select name="type" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Todos los tipos</option>
            <option value="energia" @selected(($filters['type'] ?? '') === 'energia')>Unidad de energía</option>
            <option value="auxiliar" @selected(($filters['type'] ?? '') === 'auxiliar')>Unidad auxiliar</option>
        </select>
        <select name="status" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Todos los estatus</option>
            <option value="correcto" @selected(($filters['status'] ?? '') === 'correcto')>Correcto</option>
            <option value="mantenimiento_programado" @selected(($filters['status'] ?? '') === 'mantenimiento_programado')>Mantenimiento programado</option>
            <option value="mantenimiento_necesario" @selected(($filters['status'] ?? '') === 'mantenimiento_necesario')>Mantenimiento necesario</option>
        </select>
        <button class="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white">Filtrar</button>
    </form>

    <div class="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                    <th class="px-4 py-3">Nombre</th>
                    <th class="px-4 py-3">Tipo</th>
                    <th class="px-4 py-3">Categoría</th>
                    <th class="px-4 py-3">Sitio</th>
                    <th class="px-4 py-3">Estatus</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($units as $unit)
                    <tr class="border-t border-slate-100 hover:bg-slate-50">
                        <td class="px-4 py-3 font-medium text-slate-800"><a class="hover:underline" href="{{ route('unidades.show', $unit) }}">{{ $unit->name }}</a></td>
                        <td class="px-4 py-3">{{ $unit->unit_type === 'energia' ? 'Unidad de energía' : 'Unidad auxiliar' }}</td>
                        <td class="px-4 py-3">{{ $unit->category ?: '—' }}</td>
                        <td class="px-4 py-3">{{ $unit->site_name ?: '—' }}</td>
                        <td class="px-4 py-3"><span class="rounded px-2 py-1 text-xs {{ $unit->status === 'correcto' ? 'bg-green-100 text-green-700' : ($unit->status === 'mantenimiento_programado' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700') }}">{{ $unit->status }}</span></td>
                    </tr>
                @empty
                    <tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">No se encontraron unidades.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $units->links() }}</div>
</x-app-layout>
