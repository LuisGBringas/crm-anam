@csrf
<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Nombre *</label>
        <input name="name" required value="{{ old('name', $unit->name) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Tipo *</label>
        <select name="unit_type" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="energia" @selected(old('unit_type', $unit->unit_type) === 'energia')>Unidad de energía</option>
            <option value="auxiliar" @selected(old('unit_type', $unit->unit_type) === 'auxiliar')>Unidad auxiliar</option>
        </select>
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Categoría</label>
        <input name="category" value="{{ old('category', $unit->category) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Sitio / Aduana</label>
        <input name="site_name" value="{{ old('site_name', $unit->site_name) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Código VPN</label>
        <input name="vpn_code" value="{{ old('vpn_code', $unit->vpn_code) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Número de serie</label>
        <input name="numero_serie" value="{{ old('numero_serie', $unit->numero_serie) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Marca</label>
        <input name="marca" value="{{ old('marca', $unit->marca) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Modelo</label>
        <input name="modelo" value="{{ old('modelo', $unit->modelo) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Latitud</label>
        <input type="number" step="any" name="latitude" value="{{ old('latitude', $unit->latitude) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Longitud</label>
        <input type="number" step="any" name="longitude" value="{{ old('longitude', $unit->longitude) }}" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
    </div>
    <div class="sm:col-span-2">
        <label class="mb-1 block text-sm font-medium text-slate-700">Notas</label>
        <textarea name="notes" rows="3" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">{{ old('notes', $unit->notes) }}</textarea>
    </div>
</div>
<div class="mt-4 flex justify-end gap-2">
    <a href="{{ route('unidades.index') }}" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">Cancelar</a>
    <button class="rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white">{{ $submitLabel }}</button>
</div>
