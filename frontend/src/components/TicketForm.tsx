"use client";

import { useState } from "react";
import { TICKET_ORIGEN_LABELS } from "@/lib/status";
import type { TicketFormInput, TicketOrigen } from "@/lib/types";

interface TicketFormProps {
  initialValue?: Partial<TicketFormInput>;
  submitLabel: string;
  onSubmit: (values: TicketFormInput) => Promise<void>;
  onCancel?: () => void;
}

export function TicketForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: TicketFormProps) {
  const [values, setValues] = useState<TicketFormInput>({
    ticket_number: initialValue?.ticket_number ?? "",
    origen: (initialValue?.origen as TicketOrigen) ?? "manual",
    site_name: initialValue?.site_name ?? "",
    area: initialValue?.area ?? "",
    equipo: initialValue?.equipo ?? "",
    numero_serie: initialValue?.numero_serie ?? "",
    problema: initialValue?.problema ?? "",
    ultimo_avance: initialValue?.ultimo_avance ?? "",
    fecha_apertura: initialValue?.fecha_apertura ?? "",
    contacto_aduana: initialValue?.contacto_aduana ?? "",
    contacto_anam: initialValue?.contacto_anam ?? "",
    notes: initialValue?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof TicketFormInput>(
    key: K,
    value: TicketFormInput[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Origen *</label>
          <select
            className={inputClass}
            value={values.origen}
            onChange={(e) => update("origen", e.target.value as TicketOrigen)}
          >
            {Object.entries(TICKET_ORIGEN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Número de ticket</label>
          <input
            className={inputClass}
            value={values.ticket_number}
            onChange={(e) => update("ticket_number", e.target.value)}
            placeholder="ej. COS-SRM-INC001097"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Aduana / Sitio *</label>
          <input
            required
            className={inputClass}
            value={values.site_name}
            onChange={(e) => update("site_name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Área</label>
          <input
            className={inputClass}
            value={values.area}
            onChange={(e) => update("area", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Equipo</label>
          <input
            className={inputClass}
            value={values.equipo}
            onChange={(e) => update("equipo", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Número de serie</label>
          <input
            className={inputClass}
            value={values.numero_serie}
            onChange={(e) => update("numero_serie", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Problemática</label>
        <textarea
          className={inputClass}
          rows={3}
          value={values.problema}
          onChange={(e) => update("problema", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Último avance</label>
        <textarea
          className={inputClass}
          rows={2}
          value={values.ultimo_avance}
          onChange={(e) => update("ultimo_avance", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Fecha de apertura</label>
          <input
            type="date"
            className={inputClass}
            value={values.fecha_apertura}
            onChange={(e) => update("fecha_apertura", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Contacto Aduana</label>
          <input
            className={inputClass}
            value={values.contacto_aduana}
            onChange={(e) => update("contacto_aduana", e.target.value)}
            placeholder="Nombre <correo>"
          />
        </div>
        <div>
          <label className={labelClass}>Contacto ANAM</label>
          <input
            className={inputClass}
            value={values.contacto_anam}
            onChange={(e) => update("contacto_anam", e.target.value)}
            placeholder="Nombre <correo>"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notas</label>
        <textarea
          className={inputClass}
          rows={2}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-status-needed">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
