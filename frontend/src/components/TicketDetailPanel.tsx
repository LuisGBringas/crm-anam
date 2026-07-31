"use client";

import { useEffect, useState } from "react";
import {
  changeTicketStatus,
  deleteTicket,
  getTicket,
  getTicketHistory,
  updateTicket,
} from "@/lib/api";
import {
  TICKET_ORIGEN_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_LIST,
} from "@/lib/status";
import type { Ticket, TicketStatus, TicketStatusHistoryEntry } from "@/lib/types";
import { TicketForm } from "./TicketForm";
import { TicketStatusBadge } from "./StatusBadge";

export function TicketDetailPanel({
  ticketId,
  onChanged,
  onDeleted,
}: {
  ticketId: string;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<TicketStatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");

  async function reload() {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        getTicket(ticketId),
        getTicketHistory(ticketId),
      ]);
      setTicket(t);
      setHistory(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el ticket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function handleStatusChange(estatus: TicketStatus) {
    if (!ticket) return;
    await changeTicketStatus(ticket.id, estatus, statusNote || undefined);
    setStatusNote("");
    await reload();
    onChanged();
  }

  async function handleDelete() {
    if (!ticket) return;
    if (
      !confirm(
        `¿Eliminar el ticket de "${ticket.site_name ?? "sitio sin nombre"}"? Esta acción no se puede deshacer.`
      )
    )
      return;
    await deleteTicket(ticket.id);
    onChanged();
    onDeleted();
  }

  if (loading) return <p className="text-sm text-neutral">Cargando…</p>;
  if (error)
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-status-needed">
        {error}
      </p>
    );
  if (!ticket) return null;

  if (editing) {
    return (
      <TicketForm
        submitLabel="Guardar cambios"
        initialValue={{
          ticket_number: ticket.ticket_number ?? "",
          origen: ticket.origen,
          site_name: ticket.site_name ?? "",
          area: ticket.area ?? "",
          equipo: ticket.equipo ?? "",
          numero_serie: ticket.numero_serie ?? "",
          problema: ticket.problema ?? "",
          ultimo_avance: ticket.ultimo_avance ?? "",
          fecha_apertura: ticket.fecha_apertura ?? "",
          contacto_aduana: ticket.contacto_aduana ?? "",
          contacto_anam: ticket.contacto_anam ?? "",
          notes: ticket.notes ?? "",
        }}
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          await updateTicket(ticket.id, values);
          setEditing(false);
          await reload();
          onChanged();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">
          {ticket.site_name || "Sitio sin nombre"}
        </h3>
        <p className="text-sm text-neutral">
          {TICKET_ORIGEN_LABELS[ticket.origen]}
          {ticket.ticket_number ? ` · ${ticket.ticket_number}` : ""}
        </p>
        <div className="mt-2">
          <TicketStatusBadge status={ticket.estatus} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-neutral">Área</dt>
        <dd>{ticket.area || "—"}</dd>
        <dt className="text-neutral">Equipo</dt>
        <dd>{ticket.equipo || "—"}</dd>
        <dt className="text-neutral">Número de serie</dt>
        <dd>{ticket.numero_serie || "—"}</dd>
        <dt className="text-neutral">Fecha de apertura</dt>
        <dd>{ticket.fecha_apertura || "—"}</dd>
        <dt className="text-neutral">Contacto Aduana</dt>
        <dd>{ticket.contacto_aduana || "—"}</dd>
        <dt className="text-neutral">Contacto ANAM</dt>
        <dd>{ticket.contacto_anam || "—"}</dd>
      </dl>

      {ticket.problema && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-slate-700">
            Problemática
          </h4>
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {ticket.problema}
          </p>
        </div>
      )}

      {ticket.ultimo_avance && (
        <div>
          <h4 className="mb-1 text-sm font-semibold text-slate-700">
            Último avance
          </h4>
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {ticket.ultimo_avance}
          </p>
        </div>
      )}

      {ticket.notes && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          {ticket.notes}
        </p>
      )}

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Cambiar estatus
        </h4>
        <input
          className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Nota (opcional)"
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {TICKET_STATUS_LIST.map((estatus) => (
            <button
              key={estatus}
              disabled={estatus === ticket.estatus}
              onClick={() => handleStatusChange(estatus)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              {TICKET_STATUS_LABELS[estatus]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setEditing(true)}
          className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Editar datos
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 rounded-md border border-status-needed px-4 py-2 text-sm font-medium text-status-needed hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-700">
          Bitácora de estatus
        </h4>
        <ul className="flex flex-col gap-2">
          {history.length === 0 && (
            <li className="text-sm text-neutral">Sin cambios registrados.</li>
          )}
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-slate-200 p-2 text-xs"
            >
              <p className="font-medium text-slate-700">
                {entry.previous_status
                  ? `${TICKET_STATUS_LABELS[entry.previous_status]} → ${TICKET_STATUS_LABELS[entry.new_status]}`
                  : `Creado como ${TICKET_STATUS_LABELS[entry.new_status]}`}
              </p>
              {entry.note && <p className="text-neutral">{entry.note}</p>}
              <p className="text-neutral">
                {new Date(entry.changed_at).toLocaleString("es-MX")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
