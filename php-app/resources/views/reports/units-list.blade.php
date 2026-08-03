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
    <div class="title">Informe de Unidades de Energía y Auxiliares</div>
    <div class="subtitle">Filtros: {{ collect($filters)->filter()->map(fn($v, $k) => $k.': '.$v)->join(' · ') ?: 'Sin filtros' }}</div>

    <div class="box">Total de unidades en el informe: <strong>{{ $units->count() }}</strong></div>
    <table>
        <thead><tr><th>Nombre</th><th>Tipo</th><th>Categoría</th><th>Sitio</th><th>Estatus</th></tr></thead>
        <tbody>
            @foreach ($units as $unit)
                <tr>
                    <td>{{ $unit->name }}</td>
                    <td>{{ $unit->unit_type }}</td>
                    <td>{{ $unit->category ?: '—' }}</td>
                    <td>{{ $unit->site_name ?: '—' }}</td>
                    <td>{{ $unit->status }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
