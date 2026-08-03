"use client";

import { FileDown } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { UnitDetailDrawer } from "@/components/UnitDetailDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { listUnits, type UnitFilters } from "@/lib/api";
import { STATUS_LABELS, STATUS_LIST, UNIT_TYPE_LABELS } from "@/lib/status";
import type { Unit } from "@/lib/types";

const PAGE_SIZE = 50;

export default function UnidadesPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UnitFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [downloadingReport, setDownloadingReport] = useState(false);

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
    setPage(1);
  }, [filters, load]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const pageCount = Math.max(1, Math.ceil(units.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => units.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [units, page]
  );

  const filterDescription = useMemo(() => {
    const parts: string[] = [];
    if (filters.type) parts.push(UNIT_TYPE_LABELS[filters.type as keyof typeof UNIT_TYPE_LABELS] ?? filters.type);
    if (filters.status) parts.push(STATUS_LABELS[filters.status as keyof typeof STATUS_LABELS] ?? filters.status);
    if (filters.search) parts.push(`búsqueda "${filters.search}"`);
    return parts.join(" · ");
  }, [filters]);

  async function handleDownloadReport() {
    setDownloadingReport(true);
    try {
      const [{ downloadPdf }, { UnitsReportDocument }] = await Promise.all([
        import("@/lib/pdf/download"),
        import("@/lib/pdf/UnitsReportDocument"),
      ]);
      await downloadPdf(
        <UnitsReportDocument units={units} filterDescription={filterDescription} />,
        "informe-unidades.pdf"
      );
    } finally {
      setDownloadingReport(false);
    }
  }

  return (
    <AppShell>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-primary">
            Lista de unidades
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadReport}
              disabled={downloadingReport || units.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {downloadingReport ? "Generando…" : "Descargar informe PDF"}
            </button>
            <Link
              href="/unidades/nueva"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              + Nueva unidad
            </Link>
          </div>
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

        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-neutral">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Sitio</th>
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
              {pageItems.map((unit) => (
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
                    {unit.site_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={unit.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageCount={pageCount}
          totalItems={units.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
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
