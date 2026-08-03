"use client";

import { FileDown } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { TicketDetailDrawer } from "@/components/TicketDetailDrawer";
import { TicketStatusBadge } from "@/components/StatusBadge";
import { listTickets, type TicketFilters } from "@/lib/api";
import {
  TICKET_ORIGEN_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_LIST,
} from "@/lib/status";
import type { Ticket } from "@/lib/types";

const PAGE_SIZE = 50;

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const load = useCallback(async (nextFilters: TicketFilters) => {
    setLoading(true);
    setError(null);
    try {
      setTickets(await listTickets(nextFilters));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tickets.");
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

  const pageCount = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => tickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [tickets, page]
  );

  const filterDescription = useMemo(() => {
    const parts: string[] = [];
    if (filters.origen)
      parts.push(TICKET_ORIGEN_LABELS[filters.origen as keyof typeof TICKET_ORIGEN_LABELS] ?? filters.origen);
    if (filters.estatus)
      parts.push(TICKET_STATUS_LABELS[filters.estatus as keyof typeof TICKET_STATUS_LABELS] ?? filters.estatus);
    if (filters.search) parts.push(`búsqueda "${filters.search}"`);
    return parts.join(" · ");
  }, [filters]);

  async function handleDownloadReport() {
    setDownloadingReport(true);
    try {
      const [{ downloadPdf }, { TicketsReportDocument }] = await Promise.all([
        import("@/lib/pdf/download"),
        import("@/lib/pdf/TicketsReportDocument"),
      ]);
      await downloadPdf(
        <TicketsReportDocument tickets={tickets} filterDescription={filterDescription} />,
        "informe-tickets.pdf"
      );
    } finally {
      setDownloadingReport(false);
    }
  }

  return (
    <AppShell>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-primary">Tickets</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadReport}
              disabled={downloadingReport || tickets.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {downloadingReport ? "Generando…" : "Descargar informe PDF"}
            </button>
            <Link
              href="/tickets/nuevo"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              + Nuevo ticket
            </Link>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 rounded-md border border-slate-200 bg-white p-4">
          <input
            placeholder="Buscar por sitio, equipo, problema o número de ticket…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={filters.origen ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, origen: e.target.value || undefined }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los orígenes</option>
            {Object.entries(TICKET_ORIGEN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filters.estatus ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, estatus: e.target.value || undefined }))
            }
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los estatus</option>
            {TICKET_STATUS_LIST.map((estatus) => (
              <option key={estatus} value={estatus}>
                {TICKET_STATUS_LABELS[estatus]}
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
                <th className="px-4 py-3">Sitio</th>
                <th className="px-4 py-3">Equipo</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Ticket #</th>
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
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral">
                    No se encontraron tickets.
                  </td>
                </tr>
              )}
              {pageItems.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {ticket.site_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral">
                    {ticket.equipo || "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral">
                    {TICKET_ORIGEN_LABELS[ticket.origen]}
                  </td>
                  <td className="px-4 py-3 text-neutral">
                    {ticket.ticket_number || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <TicketStatusBadge status={ticket.estatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageCount={pageCount}
          totalItems={tickets.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {selectedId && (
        <TicketDetailDrawer
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load(filters)}
        />
      )}
    </AppShell>
  );
}
