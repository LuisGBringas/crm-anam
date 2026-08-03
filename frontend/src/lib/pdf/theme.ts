// Identidad visual de los informes PDF, tomada de la plantilla oficial
// de comunicados (Seguridad · Hacienda · ANAM, sexenio 2024-2030).
export const PDF_COLORS = {
  primary: "#611232", // guinda institucional
  accent: "#a57f2c", // dorado
  text: "#1a1a1a",
  muted: "#5b5b5b",
  border: "#d8d0d3",
  rowAlt: "#f6f1f3",
};

// Designación oficial del año en curso. Cambia cada año calendario;
// actualízala aquí cuando la dependencia publique la nueva.
export const OFFICIAL_YEAR_LABEL = "2026, año de Margarita Maza";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatLongDateEs(date: Date = new Date()): string {
  const dia = date.getDate();
  const mes = MESES[date.getMonth()];
  const anio = date.getFullYear();
  return `Ciudad de México, a ${dia} de ${mes} de ${anio}`;
}

export function formatShortDateEs(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
