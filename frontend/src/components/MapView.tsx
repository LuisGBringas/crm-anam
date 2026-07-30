"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { STATUS_COLORS, STATUS_LABELS, UNIT_TYPE_LABELS } from "@/lib/status";
import type { Unit } from "@/lib/types";

const MEXICO_CENTER: [number, number] = [23.6345, -102.5528];

function statusIcon(unit: Unit) {
  const color = STATUS_COLORS[unit.status];
  const shape = unit.unit_type === "energia" ? "50%" : "4px";
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;
      width:16px;
      height:16px;
      border-radius:${shape};
      background:${color};
      border:2px solid white;
      box-shadow:0 0 0 1px rgba(0,0,0,0.25);
    "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function MapView({
  units,
  onSelectUnit,
}: {
  units: Unit[];
  onSelectUnit: (unit: Unit) => void;
}) {
  return (
    <MapContainer
      center={MEXICO_CENTER}
      zoom={5}
      minZoom={4}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {units.map((unit) => (
          <Marker
            key={unit.id}
            position={[unit.latitude, unit.longitude]}
            icon={statusIcon(unit)}
            eventHandlers={{ click: () => onSelectUnit(unit) }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky>
              <div className="text-xs">
                <p className="font-semibold">{unit.name}</p>
                <p className="text-slate-500">
                  {UNIT_TYPE_LABELS[unit.unit_type]}
                </p>
                <p style={{ color: STATUS_COLORS[unit.status] }}>
                  {STATUS_LABELS[unit.status]}
                </p>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
