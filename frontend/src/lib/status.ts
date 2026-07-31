import type { TicketOrigen, TicketStatus, UnitStatus, UnitType } from "./types";

export const STATUS_LABELS: Record<UnitStatus, string> = {
  correcto: "Correcto",
  mantenimiento_programado: "Mantenimiento programado",
  mantenimiento_necesario: "Mantenimiento necesario",
};

export const STATUS_COLORS: Record<UnitStatus, string> = {
  correcto: "#2E7D32",
  mantenimiento_programado: "#F2A900",
  mantenimiento_necesario: "#C62828",
};

export const STATUS_LIST: UnitStatus[] = [
  "correcto",
  "mantenimiento_programado",
  "mantenimiento_necesario",
];

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  energia: "Unidad de energía",
  auxiliar: "Unidad auxiliar",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cancelado: "Cancelado",
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  abierto: "#C62828",
  en_proceso: "#F2A900",
  resuelto: "#2E7D32",
  cancelado: "#75787B",
};

export const TICKET_STATUS_LIST: TicketStatus[] = [
  "abierto",
  "en_proceso",
  "resuelto",
  "cancelado",
];

export const TICKET_ORIGEN_LABELS: Record<TicketOrigen, string> = {
  cosisi: "COSISI",
  erni_sedena: "ERNI · SEDENA",
  erni_semar: "ERNI · SEMAR",
  manual: "Manual",
};

export const TICKET_ORIGEN_LIST: TicketOrigen[] = [
  "cosisi",
  "erni_sedena",
  "erni_semar",
  "manual",
];
