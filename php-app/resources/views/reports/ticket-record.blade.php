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
    <div class="title">Informe de Ticket de Mantenimiento / Incidencia</div>
    <div class="subtitle">{{ $ticket->site_name ?: 'Sitio sin nombre' }}</div>

    <div class="box"><strong>Estatus actual:</strong> {{ $ticket->estatus }}</div>
    <table>
        <tbody>
            <tr><th style="width:35%">Origen</th><td>{{ $ticket->origen }}</td></tr>
            <tr><th>Número de ticket</th><td>{{ $ticket->ticket_number ?: '—' }}</td></tr>
            <tr><th>Sitio / Aduana</th><td>{{ $ticket->site_name ?: '—' }}</td></tr>
            <tr><th>Equipo</th><td>{{ $ticket->equipo ?: '—' }}</td></tr>
            <tr><th>Número de serie</th><td>{{ $ticket->numero_serie ?: '—' }}</td></tr>
            <tr><th>Fecha de apertura</th><td>{{ optional($ticket->fecha_apertura)->format('d/m/Y') ?: '—' }}</td></tr>
            <tr><th>Problemática</th><td>{{ $ticket->problema ?: '—' }}</td></tr>
            <tr><th>Último avance</th><td>{{ $ticket->ultimo_avance ?: '—' }}</td></tr>
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
