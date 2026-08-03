@csrf
<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Origen *</label>
        <select name="origen" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="manual" @selected(old('origen', $ticket->origen) === 'manual')>Manual</option>
            <option value="cosisi" @selected(old('origen', $ticket->origen) === 'cosisi')>COSISI</option>
            <option value="erni_sedena" @selected(old('origen', $ticket->origen) === 'erni_sedena')>ERNI · SEDENA</option>
            <option value="erni_semar" @selected(old('origen', $ticket->origen) === 'erni_semar')>ERNI · SEMAR</option>
        </select>
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Número de ticket</label>
        <input name="ticket_number" value="{{ old('ticket_number', $ticket->ticket_number) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Unidad relacionada</label>
        <select name="unit_id" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Sin relacionar</option>
            @foreach ($units as $u)
                <option value="{{ $u->id }}" @selected(old('unit_id', $ticket->unit_id) === $u->id)>{{ $u->name }}</option>
            @endforeach
        </select>
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Sitio / Aduana</label>
        <input name="site_name" value="{{ old('site_name', $ticket->site_name) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Equipo</label>
        <input name="equipo" value="{{ old('equipo', $ticket->equipo) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Número de serie</label>
        <input name="numero_serie" value="{{ old('numero_serie', $ticket->numero_serie) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div class="sm:col-span-2">
        <label class="mb-1 block text-sm font-medium text-slate-700">Problemática</label>
        <textarea name="problema" rows="3" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">{{ old('problema', $ticket->problema) }}</textarea>
    </div>
    <div class="sm:col-span-2">
        <label class="mb-1 block text-sm font-medium text-slate-700">Último avance</label>
        <textarea name="ultimo_avance" rows="2" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">{{ old('ultimo_avance', $ticket->ultimo_avance) }}</textarea>
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Fecha de apertura</label>
        <input type="date" name="fecha_apertura" value="{{ old('fecha_apertura', optional($ticket->fecha_apertura)->format('Y-m-d')) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Estatus</label>
        <select name="estatus" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="abierto" @selected(old('estatus', $ticket->estatus) === 'abierto')>Abierto</option>
            <option value="en_proceso" @selected(old('estatus', $ticket->estatus) === 'en_proceso')>En proceso</option>
            <option value="resuelto" @selected(old('estatus', $ticket->estatus) === 'resuelto')>Resuelto</option>
            <option value="cancelado" @selected(old('estatus', $ticket->estatus) === 'cancelado')>Cancelado</option>
        </select>
    </div>
</div>
<div class="mt-4 flex justify-end gap-2">
    <a href="{{ route('tickets.index') }}" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</a>
    <button class="rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white">{{ $submitLabel }}</button>
</div>
