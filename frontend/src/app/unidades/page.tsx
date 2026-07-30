"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { UnitDetailDrawer } from "@/components/UnitDetailDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { listUnits, type UnitFilters } from "@/lib/api";
import { STATUS_LABELS, STATUS_LIST, UNIT_TYPE_LABELS } from "@/lib/status";
import type { Unit } from "@/lib/types";

export default function UnidadesPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UnitFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (nextFilters: UnitFilters) => {
    setLoading(true);
    setError(null);
    try {
      setUnits(await listUnits(nextFilters));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar unidades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-primary">
            Lista de unidades
          </h1>
          <Link
            href="/unidades/nueva"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Nueva unidad
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 rounded-md border border-slate-200 bg-white p-4">
          <input
            placeholder="Buscar por nombre, operador o dirección…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={filters.type ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value || undefined }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value || undefined }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los estatus</option>
            {STATUS_LIST.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-status-needed">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-neutral">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral">
                    Cargando…
                  </td>
                </tr>
              )}
              {!loading && units.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral">
                    No se encontraron unidades.
                  </td>
                </tr>
              )}
              {units.map((unit) => (
                <tr
                  key={unit.id}
                  onClick={() => setSelectedId(unit.id)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {unit.name}
                  </td>
                  <td className="px-4 py-3 text-neutral">
                    {UNIT_TYPE_LABELS[unit.unit_type]}
                  </td>
                  <td className="px-4 py-3 text-neutral">
                    {unit.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral">
                    {unit.state || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={unit.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-neutral">
          {units.length} unidad{units.length === 1 ? "" : "es"} encontrada
          {units.length === 1 ? "" : "s"}.
        </p>
      </div>

      {selectedId && (
        <UnitDetailDrawer
          unitId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load(filters)}
        />
      )}
    </AppShell>
  );
}
