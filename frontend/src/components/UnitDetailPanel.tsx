"use client";

import { useEffect, useState } from "react";
import {
  changeUnitStatus,
  deleteUnit,
  getUnit,
  getUnitHistory,
  updateUnit,
} from "@/lib/api";
import { STATUS_LABELS, STATUS_LIST, UNIT_TYPE_LABELS } from "@/lib/status";
import type { StatusHistoryEntry, Unit, UnitStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { UnitForm } from "./UnitForm";

export function UnitDetailPanel({
  unitId,
  onChanged,
  onDeleted,
}: {
  unitId: string;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");

  async function reload() {
    setLoading(true);
    try {
      const [u, h] = await Promise.all([
        getUnit(unitId),
        getUnitHistory(unitId),
      ]);
      setUnit(u);
      setHistory(h);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la unidad.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  async function handleStatusChange(status: UnitStatus) {
    if (!unit) return;
    await changeUnitStatus(unit.id, status, statusNote || undefined);
    setStatusNote("");
    await reload();
    onChanged();
  }

  async function handleDelete() {
    if (!unit) return;
    if (!confirm(`¿Eliminar "${unit.name}"? Esta acción no se puede deshacer.`))
      return;
    await deleteUnit(unit.id);
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
  if (!unit) return null;

  if (editing) {
    return (
      <UnitForm
        submitLabel="Guardar cambios"
        initialValue={{
          name: unit.name,
          unit_type: unit.unit_type,
          category: unit.category ?? "",
          operator: unit.operator ?? "",
          capacity_mw: unit.capacity_mw,
          latitude: unit.latitude,
          longitude: unit.longitude,
          address: unit.address ?? "",
          state: unit.state ?? "",
          notes: unit.notes ?? "",
        }}
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          await updateUnit(unit.id, values);
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
        <h3 className="text-lg font-semibold text-slate-800">{unit.name}</h3>
        <p className="text-sm text-neutral">
          {UNIT_TYPE_LABELS[unit.unit_type]}
          {unit.category ? ` · ${unit.category}` : ""}
        </p>
        <div className="mt-2">
          <StatusBadge status={unit.status} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-neutral">Operador</dt>
        <dd>{unit.operator || "—"}</dd>
        <dt className="text-neutral">Capacidad</dt>
        <dd>{unit.capacity_mw ? `${unit.capacity_mw} MW` : "—"}</dd>
        <dt className="text-neutral">Estado</dt>
        <dd>{unit.state || "—"}</dd>
        <dt className="text-neutral">Dirección</dt>
        <dd>{unit.address || "—"}</dd>
        <dt className="text-neutral">Ubicación</dt>
        <dd>
          {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
        </dd>
        <dt className="text-neutral">Fuente</dt>
        <dd>{unit.source === "osm" ? "OpenStreetMap" : "Manual"}</dd>
      </dl>

      {unit.notes && (
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          {unit.notes}
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
          {STATUS_LIST.map((status) => (
            <button
              key={status}
              disabled={status === unit.status}
              onClick={() => handleStatusChange(status)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
            >
              {STATUS_LABELS[status]}
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
                  ? `${STATUS_LABELS[entry.previous_status]} → ${STATUS_LABELS[entry.new_status]}`
                  : `Creado como ${STATUS_LABELS[entry.new_status]}`}
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
