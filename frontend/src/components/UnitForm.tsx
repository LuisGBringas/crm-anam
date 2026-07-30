"use client";

import { useState } from "react";
import { UNIT_TYPE_LABELS } from "@/lib/status";
import type { UnitFormInput, UnitType } from "@/lib/types";

const CATEGORY_OPTIONS = [
  "solar",
  "eolica",
  "hidroelectrica",
  "termica",
  "nuclear",
  "geotermica",
  "subestacion",
  "generador",
  "otro",
];

interface UnitFormProps {
  initialValue?: Partial<UnitFormInput>;
  submitLabel: string;
  onSubmit: (values: UnitFormInput) => Promise<void>;
  onCancel?: () => void;
}

export function UnitForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: UnitFormProps) {
  const [values, setValues] = useState<UnitFormInput>({
    name: initialValue?.name ?? "",
    unit_type: (initialValue?.unit_type as UnitType) ?? "energia",
    category: initialValue?.category ?? "",
    operator: initialValue?.operator ?? "",
    capacity_mw: initialValue?.capacity_mw ?? undefined,
    latitude: initialValue?.latitude ?? 23.6345,
    longitude: initialValue?.longitude ?? -102.5528,
    address: initialValue?.address ?? "",
    state: initialValue?.state ?? "",
    notes: initialValue?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof UnitFormInput>(key: K, value: UnitFormInput[K]) {
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
      <div>
        <label className={labelClass}>Nombre *</label>
        <input
          required
          className={inputClass}
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo *</label>
          <select
            className={inputClass}
            value={values.unit_type}
            onChange={(e) => update("unit_type", e.target.value as UnitType)}
          >
            {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Categoría</label>
          <select
            className={inputClass}
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Sin especificar</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Operador</label>
          <input
            className={inputClass}
            value={values.operator}
            onChange={(e) => update("operator", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Capacidad (MW)</label>
          <input
            type="number"
            step="0.01"
            className={inputClass}
            value={values.capacity_mw ?? ""}
            onChange={(e) =>
              update(
                "capacity_mw",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Latitud *</label>
          <input
            required
            type="number"
            step="any"
            className={inputClass}
            value={values.latitude}
            onChange={(e) => update("latitude", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Longitud *</label>
          <input
            required
            type="number"
            step="any"
            className={inputClass}
            value={values.longitude}
            onChange={(e) => update("longitude", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Dirección</label>
          <input
            className={inputClass}
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Estado</label>
          <input
            className={inputClass}
            value={values.state}
            onChange={(e) => update("state", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notas</label>
        <textarea
          className={inputClass}
          rows={3}
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
