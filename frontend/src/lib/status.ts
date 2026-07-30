import type { UnitStatus, UnitType } from "./types";

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
