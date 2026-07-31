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
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  state: string | null;
  source: "manual" | "osm" | "cosisi";
  external_ref: string | null;
  notes: string | null;
  vpn_code: string | null;
  site_name: string | null;
  hostname: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  capacity_label: string | null;
  rack_location: string | null;
  iniciativa: string | null;
  responsable_administracion: string | null;
  criticidad: string | null;
  es_virtual: string | null;
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
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  state?: string;
  notes?: string;
  vpn_code?: string;
  site_name?: string;
  hostname?: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  capacity_label?: string;
  rack_location?: string;
  iniciativa?: string;
  responsable_administracion?: string;
  criticidad?: string;
  es_virtual?: string;
}

export type TicketOrigen = "cosisi" | "erni_sedena" | "erni_semar" | "manual";

export type TicketStatus = "abierto" | "en_proceso" | "resuelto" | "cancelado";

export interface Ticket {
  id: string;
  ticket_number: string | null;
  origen: TicketOrigen;
  unit_id: string | null;
  site_name: string | null;
  area: string | null;
  equipo: string | null;
  numero_serie: string | null;
  problema: string | null;
  ultimo_avance: string | null;
  estatus: TicketStatus;
  fecha_apertura: string | null;
  contacto_aduana: string | null;
  contacto_anam: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketStatusHistoryEntry {
  id: string;
  ticket_id: string;
  previous_status: TicketStatus | null;
  new_status: TicketStatus;
  note: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface TicketFormInput {
  ticket_number?: string;
  origen: TicketOrigen;
  unit_id?: string | null;
  site_name?: string;
  area?: string;
  equipo?: string;
  numero_serie?: string;
  problema?: string;
  ultimo_avance?: string;
  fecha_apertura?: string;
  contacto_aduana?: string;
  contacto_anam?: string;
  notes?: string;
}
