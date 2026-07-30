export type UnitType = "energia" | "auxiliar";

export type UnitStatus =
  | "correcto"
  | "mantenimiento_programado"
  | "mantenimiento_necesario";

export interface Unit {
  id: string;
  name: string;
  unit_type: UnitType;
  category: string | null;
  operator: string | null;
  capacity_mw: number | null;
  status: UnitStatus;
  latitude: number;
  longitude: number;
  address: string | null;
  state: string | null;
  source: "manual" | "osm";
  external_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryEntry {
  id: string;
  unit_id: string;
  previous_status: UnitStatus | null;
  new_status: UnitStatus;
  note: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface UnitFormInput {
  name: string;
  unit_type: UnitType;
  category?: string;
  operator?: string;
  capacity_mw?: number | null;
  latitude: number;
  longitude: number;
  address?: string;
  state?: string;
  notes?: string;
}
