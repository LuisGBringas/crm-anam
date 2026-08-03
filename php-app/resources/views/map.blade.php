<x-app-layout>
    <x-slot name="header">
        <h1 class="text-xl font-semibold text-[#611232]">Mapa de unidades</h1>
    </x-slot>

    <div class="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div id="map" style="height: 70vh;"></div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const units = @json($units);
        const map = L.map('map').setView([23.6345, -102.5528], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        units.forEach((unit) => {
            const color = unit.status === 'correcto' ? '#2E7D32' : (unit.status === 'mantenimiento_programado' ? '#F2A900' : '#C62828');
            const marker = L.circleMarker([unit.latitude, unit.longitude], {
                radius: 8,
                color: '#fff',
                weight: 2,
                fillColor: color,
                fillOpacity: 1,
            }).addTo(map);
            marker.bindPopup(
                `<strong>${unit.name}</strong><br>${unit.site_name ?? 'Sitio no definido'}<br><a href="/unidades/${unit.id}" style="color:#611232">Ver detalle</a>`
            );
        });
    </script>
</x-app-layout>
