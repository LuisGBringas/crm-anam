<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\Unit;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class TicketController extends Controller
{
    public function index(Request $request): View
    {
        $query = Ticket::query();
        if ($request->filled('origen')) {
            $query->where('origen', $request->string('origen'));
        }
        if ($request->filled('estatus')) {
            $query->where('estatus', $request->string('estatus'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($nested) use ($search): void {
                $nested
                    ->where('site_name', 'like', "%{$search}%")
                    ->orWhere('equipo', 'like', "%{$search}%")
                    ->orWhere('problema', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        $tickets = $query->latest()->paginate(50)->withQueryString();

        return view('tickets.index', [
            'tickets' => $tickets,
            'filters' => $request->only(['origen', 'estatus', 'search']),
        ]);
    }

    public function create(): View
    {
        return view('tickets.create', [
            'ticket' => new Ticket(),
            'units' => Unit::orderBy('name')->limit(500)->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatePayload($request);
        $ticket = Ticket::create($data);

        TicketStatusHistory::create([
            'ticket_id' => $ticket->id,
            'previous_status' => null,
            'new_status' => $ticket->estatus,
            'note' => 'Ticket creado.',
            'changed_by' => auth()->id(),
        ]);

        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket creado.');
    }

    public function show(Ticket $ticket): View
    {
        $history = $ticket->statusHistory()->latest('changed_at')->get();
        return view('tickets.show', compact('ticket', 'history'));
    }

    public function edit(Ticket $ticket): View
    {
        return view('tickets.edit', [
            'ticket' => $ticket,
            'units' => Unit::orderBy('name')->limit(500)->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $ticket->update($this->validatePayload($request, $ticket));
        return redirect()->route('tickets.show', $ticket)->with('success', 'Ticket actualizado.');
    }

    public function updateStatus(Request $request, Ticket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'estatus' => ['required', Rule::in(Ticket::STATUSES)],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $previous = $ticket->estatus;
        $ticket->update(['estatus' => $validated['estatus']]);

        TicketStatusHistory::create([
            'ticket_id' => $ticket->id,
            'previous_status' => $previous,
            'new_status' => $validated['estatus'],
            'note' => $validated['note'] ?? null,
            'changed_by' => auth()->id(),
        ]);

        return redirect()->route('tickets.show', $ticket)->with('success', 'Estatus actualizado.');
    }

    public function destroy(Ticket $ticket): RedirectResponse
    {
        $ticket->delete();
        return redirect()->route('tickets.index')->with('success', 'Ticket eliminado.');
    }

    public function report(Ticket $ticket)
    {
        $history = $ticket->statusHistory()->latest('changed_at')->get();
        $pdf = Pdf::loadView('reports.ticket-record', compact('ticket', 'history'))
            ->setPaper('letter');
        return $pdf->download('informe-ticket-'.$ticket->id.'.pdf');
    }

    public function reportList(Request $request)
    {
        $query = Ticket::query();
        if ($request->filled('origen')) {
            $query->where('origen', $request->string('origen'));
        }
        if ($request->filled('estatus')) {
            $query->where('estatus', $request->string('estatus'));
        }
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($nested) use ($search): void {
                $nested
                    ->where('site_name', 'like', "%{$search}%")
                    ->orWhere('equipo', 'like', "%{$search}%")
                    ->orWhere('problema', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        $tickets = $query->latest()->limit(400)->get();
        $filters = $request->only(['origen', 'estatus', 'search']);
        $pdf = Pdf::loadView('reports.tickets-list', compact('tickets', 'filters'))->setPaper('letter');
        return $pdf->download('informe-tickets.pdf');
    }

    private function validatePayload(Request $request, ?Ticket $ticket = null): array
    {
        $validated = $request->validate([
            'ticket_number' => ['nullable', 'string', 'max:255'],
            'origen' => ['required', Rule::in(Ticket::ORIGENS)],
            'unit_id' => ['nullable', 'exists:units,id'],
            'site_name' => ['nullable', 'string', 'max:255'],
            'area' => ['nullable', 'string', 'max:255'],
            'equipo' => ['nullable', 'string', 'max:255'],
            'numero_serie' => ['nullable', 'string', 'max:255'],
            'problema' => ['nullable', 'string'],
            'ultimo_avance' => ['nullable', 'string'],
            'estatus' => ['nullable', Rule::in(Ticket::STATUSES)],
            'fecha_apertura' => ['nullable', 'date'],
            'contacto_aduana' => ['nullable', 'string', 'max:255'],
            'contacto_anam' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['estatus'] = $validated['estatus'] ?? ($ticket?->estatus ?? 'abierto');
        return $validated;
    }
}
