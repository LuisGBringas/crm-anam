"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TicketDetailDrawer } from "@/components/TicketDetailDrawer";
import { TicketStatusBadge } from "@/components/StatusBadge";
import { listTickets, type TicketFilters } from "@/lib/api";
import {
  TICKET_ORIGEN_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_LIST,
} from "@/lib/status";
import type { Ticket } from "@/lib/types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
          <h1 className="text-xl font-semibold text-primary">Tickets</h1>
          <Link
            href="/tickets/nuevo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            + Nuevo ticket
          </Link>
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

        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
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
              {tickets.map((ticket) => (
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
        <p className="mt-2 text-xs text-neutral">
          {tickets.length} ticket{tickets.length === 1 ? "" : "s"} encontrado
          {tickets.length === 1 ? "" : "s"}.
        </p>
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
