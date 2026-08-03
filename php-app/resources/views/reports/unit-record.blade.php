<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    @include('reports._styles')
</head>
<body>
    <div class="header"><img src="{{ public_path('reportes/header-letterhead.png') }}" style="width:100%"></div>
    <div class="footer">
        <img src="{{ public_path('reportes/footer-banner.png') }}" style="width:100%">
        <div>2026, año de Margarita Maza · Sistema de Gestión de Unidades de Energía · ANAM</div>
    </div>

    <div class="meta">Ciudad de México, {{ now()->format('d/m/Y') }}</div>
    <div class="title">Informe de Estatus de Unidad</div>
    <div class="subtitle">{{ $unit->name }}</div>

    <div class="box"><strong>Estatus actual:</strong> {{ $unit->status }}</div>
    <table>
        <tbody>
            <tr><th style="width:35%">Sitio / Aduana</th><td>{{ $unit->site_name ?: '—' }}</td></tr>
            <tr><th>Código VPN</th><td>{{ $unit->vpn_code ?: '—' }}</td></tr>
            <tr><th>Marca / Modelo</th><td>{{ collect([$unit->marca, $unit->modelo])->filter()->join(' / ') ?: '—' }}</td></tr>
            <tr><th>Número de serie</th><td>{{ $unit->numero_serie ?: '—' }}</td></tr>
            <tr><th>Ubicación</th><td>{{ $unit->latitude && $unit->longitude ? $unit->latitude.', '.$unit->longitude : 'Sin geocodificar' }}</td></tr>
            <tr><th>Notas</th><td>{{ $unit->notes ?: '—' }}</td></tr>
        </tbody>
    </table>

    <h3>Tickets relacionados</h3>
    <table>
        <thead><tr><th>Ticket</th><th>Problema</th><th>Estatus</th></tr></thead>
        <tbody>
            @forelse ($tickets as $ticket)
                <tr><td>{{ $ticket->ticket_number ?: $ticket->origen }}</td><td>{{ $ticket->problema ?: '—' }}</td><td>{{ $ticket->estatus }}</td></tr>
            @empty
                <tr><td colspan="3">Sin tickets relacionados.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>Bitácora de estatus</h3>
    <table>
        <thead><tr><th>Fecha</th><th>Cambio</th><th>Nota</th></tr></thead>
        <tbody>
            @forelse ($history as $entry)
                <tr>
                    <td>{{ $entry->changed_at?->format('d/m/Y H:i') }}</td>
                    <td>{{ $entry->previous_status ? $entry->previous_status.' → '.$entry->new_status : 'Creado como '.$entry->new_status }}</td>
                    <td>{{ $entry->note ?: '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="3">Sin cambios registrados.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
