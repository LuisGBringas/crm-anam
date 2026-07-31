"use client";

import { useState } from "react";
import { UNIT_TYPE_LABELS } from "@/lib/status";
import type { UnitFormInput, UnitType } from "@/lib/types";

const CATEGORY_OPTIONS = [
  "ups",
  "planta_emergencia",
  "aire_acondicionado",
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
    latitude: initialValue?.latitude ?? undefined,
    longitude: initialValue?.longitude ?? undefined,
    address: initialValue?.address ?? "",
    state: initialValue?.state ?? "",
    notes: initialValue?.notes ?? "",
    vpn_code: initialValue?.vpn_code ?? "",
    site_name: initialValue?.site_name ?? "",
    hostname: initialValue?.hostname ?? "",
    marca: initialValue?.marca ?? "",
    modelo: initialValue?.modelo ?? "",
    numero_serie: initialValue?.numero_serie ?? "",
    capacity_label: initialValue?.capacity_label ?? "",
    rack_location: initialValue?.rack_location ?? "",
    iniciativa: initialValue?.iniciativa ?? "",
    responsable_administracion: initialValue?.responsable_administracion ?? "",
    criticidad: initialValue?.criticidad ?? "",
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Sitio / Aduana</label>
          <input
            className={inputClass}
            value={values.site_name}
            onChange={(e) => update("site_name", e.target.value)}
            placeholder='ej. "VPN 47 Aduana Agua Prieta - Sede"'
          />
        </div>
        <div>
          <label className={labelClass}>Código VPN</label>
          <input
            className={inputClass}
            value={values.vpn_code}
            onChange={(e) => update("vpn_code", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Marca</label>
          <input
            className={inputClass}
            value={values.marca}
            onChange={(e) => update("marca", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Modelo</label>
          <input
            className={inputClass}
            value={values.modelo}
            onChange={(e) => update("modelo", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Número de serie</label>
          <input
            className={inputClass}
            value={values.numero_serie}
            onChange={(e) => update("numero_serie", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Hostname</label>
          <input
            className={inputClass}
            value={values.hostname}
            onChange={(e) => update("hostname", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Operador</label>
          <input
            className={inputClass}
            value={values.operator}
            onChange={(e) => update("operator", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Capacidad</label>
          <input
            className={inputClass}
            value={values.capacity_label}
            onChange={(e) => update("capacity_label", e.target.value)}
            placeholder='ej. "6 KVA", "3 TON", "220 KW"'
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Ubicación en sitio (rack)</label>
          <input
            className={inputClass}
            value={values.rack_location}
            onChange={(e) => update("rack_location", e.target.value)}
            placeholder="ej. MDF, IDF01"
          />
        </div>
        <div>
          <label className={labelClass}>Iniciativa</label>
          <input
            className={inputClass}
            value={values.iniciativa}
            onChange={(e) => update("iniciativa", e.target.value)}
            placeholder="ej. VIDEO VIGILANCIA"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Responsable de administración</label>
          <input
            className={inputClass}
            value={values.responsable_administracion}
            onChange={(e) => update("responsable_administracion", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Criticidad</label>
          <input
            className={inputClass}
            value={values.criticidad}
            onChange={(e) => update("criticidad", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Latitud</label>
          <input
            type="number"
            step="any"
            className={inputClass}
            value={values.latitude ?? ""}
            onChange={(e) =>
              update("latitude", e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="Sin geocodificar"
          />
        </div>
        <div>
          <label className={labelClass}>Longitud</label>
          <input
            type="number"
            step="any"
            className={inputClass}
            value={values.longitude ?? ""}
            onChange={(e) =>
              update("longitude", e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="Sin geocodificar"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-neutral">
        Si se deja vacío, la unidad no aparecerá en el mapa pero sí en la
        lista.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
