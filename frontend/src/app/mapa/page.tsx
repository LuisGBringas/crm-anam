"use client";

import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [legendOpen, setLegendOpen] = useState(true);

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
      <div className="relative h-full min-h-[420px] w-full">
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

        <div className="absolute right-2 top-2 z-[1000] max-w-[calc(100vw-1rem)] rounded-md border border-slate-200 bg-white/95 text-xs shadow-sm sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={() => setLegendOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 font-semibold text-slate-700"
          >
            Estatus
            {legendOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {legendOpen && (
            <div className="flex flex-col gap-1 px-3 pb-2.5">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
                    }}
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
          )}
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
