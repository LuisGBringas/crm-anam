"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/status";
import { listUnits } from "@/lib/api";
import type { Unit } from "@/lib/types";
import { UnitDetailDrawer } from "@/components/UnitDetailDrawer";

const MapView = dynamic(
  () => import("@/components/MapView").then((mod) => mod.MapView),
  { ssr: false }
);

export default function MapaPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUnits(await listUnits());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar unidades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <div className="relative h-[calc(100vh-104px)] w-full">
        {loading && (
          <div className="absolute inset-x-0 top-0 z-[1000] bg-white/90 px-4 py-2 text-center text-sm text-neutral">
            Cargando unidades…
          </div>
        )}
        {error && (
          <div className="absolute inset-x-0 top-0 z-[1000] bg-red-50 px-4 py-2 text-center text-sm text-status-needed">
            {error}
          </div>
        )}

        <div className="absolute right-4 top-4 z-[1000] rounded-md border border-slate-200 bg-white/95 p-3 text-xs shadow-sm">
          <p className="mb-1 font-semibold text-slate-700">Estatus</p>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="flex items-center gap-2 py-0.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <MapView units={units} onSelectUnit={(unit) => setSelectedId(unit.id)} />
      </div>

      {selectedId && (
        <UnitDetailDrawer
          unitId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={load}
        />
      )}
    </AppShell>
  );
}
