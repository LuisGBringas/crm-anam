<?php

namespace App\Http\Controllers;

use App\Models\StatusHistory;
use App\Models\Ticket;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class UnitController extends Controller
{
    public function index(Request $request): View
    {
        $query = Unit::query();

        if ($request->filled('type')) {
            $query->where('unit_type', $request->string('type'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($nested) use ($search): void {
                $nested
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('site_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $units = $query->orderBy('name')->paginate(50)->withQueryString();

        return view('units.index', [
            'units' => $units,
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    public function create(): View
    {
        return view('units.create', ['unit' => new Unit()]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatePayload($request);
        $unit = Unit::create($data);

        StatusHistory::create([
            'unit_id' => $unit->id,
            'previous_status' => null,
            'new_status' => $unit->status,
            'note' => 'Unidad creada.',
            'changed_by' => auth()->id(),
        ]);

        return redirect()->route('unidades.show', $unit)->with('success', 'Unidad creada.');
    }

    public function show(Unit $unit): View
    {
        $history = $unit->statusHistory()->latest('changed_at')->get();
        $tickets = Ticket::where('unit_id', $unit->id)->latest()->get();

        return view('units.show', compact('unit', 'history', 'tickets'));
    }

    public function edit(Unit $unit): View
    {
        return view('units.edit', compact('unit'));
    }

    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $unit->update($this->validatePayload($request, $unit));

        return redirect()->route('unidades.show', $unit)->with('success', 'Unidad actualizada.');
    }

    public function updateStatus(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Unit::STATUSES)],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $previous = $unit->status;
        $unit->update(['status' => $validated['status']]);

        StatusHistory::create([
            'unit_id' => $unit->id,
            'previous_status' => $previous,
            'new_status' => $validated['status'],
            'note' => $validated['note'] ?? null,
            'changed_by' => auth()->id(),
        ]);

        return redirect()->route('unidades.show', $unit)->with('success', 'Estatus actualizado.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $unit->delete();
        return redirect()->route('unidades.index')->with('success', 'Unidad eliminada.');
    }

    public function report(Unit $unit)
    {
        $history = $unit->statusHistory()->latest('changed_at')->get();
        $tickets = Ticket::where('unit_id', $unit->id)->latest()->get();

        $pdf = Pdf::loadView('reports.unit-record', compact('unit', 'history', 'tickets'))
            ->setPaper('letter');

        return $pdf->download('informe-unidad-'.$unit->id.'.pdf');
    }

    public function reportList(Request $request)
    {
        $query = Unit::query();
        if ($request->filled('type')) {
            $query->where('unit_type', $request->string('type'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($nested) use ($search): void {
                $nested
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('site_name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $units = $query->orderBy('name')->limit(400)->get();
        $filters = $request->only(['type', 'status', 'search']);
        $pdf = Pdf::loadView('reports.units-list', compact('units', 'filters'))->setPaper('letter');

        return $pdf->download('informe-unidades.pdf');
    }

    private function validatePayload(Request $request, ?Unit $unit = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'unit_type' => ['required', Rule::in(Unit::TYPES)],
            'category' => ['nullable', 'string', 'max:100'],
            'operator' => ['nullable', 'string', 'max:255'],
            'capacity_mw' => ['nullable', 'numeric'],
            'status' => ['nullable', Rule::in(Unit::STATUSES)],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'address' => ['nullable', 'string'],
            'state' => ['nullable', 'string', 'max:255'],
            'source' => ['nullable', 'string', 'max:30'],
            'external_ref' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'vpn_code' => ['nullable', 'string', 'max:255'],
            'site_name' => ['nullable', 'string', 'max:255'],
            'hostname' => ['nullable', 'string', 'max:255'],
            'marca' => ['nullable', 'string', 'max:255'],
            'modelo' => ['nullable', 'string', 'max:255'],
            'numero_serie' => ['nullable', 'string', 'max:255'],
            'capacity_label' => ['nullable', 'string', 'max:255'],
            'rack_location' => ['nullable', 'string', 'max:255'],
            'iniciativa' => ['nullable', 'string', 'max:255'],
            'responsable_administracion' => ['nullable', 'string', 'max:255'],
            'criticidad' => ['nullable', 'string', 'max:255'],
            'es_virtual' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['status'] = $validated['status'] ?? ($unit?->status ?? 'correcto');
        $validated['source'] = $validated['source'] ?? ($unit?->source ?? 'manual');
        return $validated;
    }
}
