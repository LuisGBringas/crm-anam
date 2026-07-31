/**
 * Siembra el CRM ANAM con los tickets de "Fallas o falta de suministro
 * eléctrico ERNI" (equipo de inspección no intrusiva) de las hojas
 * SEDENA y SEMAR.
 *
 * Uso:
 *   cd scripts && npm install && npm run import-erni-fallas
 *
 * Variables de entorno (ver .env.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   ERNI_XLSX_PATH (opcional, default: "../Actualizado Fallas - Falta de
 *   suministro eléctrico ERNI, 29julio2026.xlsx")
 *
 * El archivo .xlsx NUNCA se sube al repo (ver .gitignore raíz).
 */
import "dotenv/config";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const xlsxPath = path.resolve(
  __dirname,
  process.env.ERNI_XLSX_PATH ??
    "../Actualizado Fallas - Falta de suministro eléctrico ERNI, 29julio2026.xlsx"
);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copia .env.example a .env y complétalo."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function cleanStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (s === "" || s === "-" || s === "." || /^sin detalle$/i.test(s)) return null;
  return s;
}

function contact(name: unknown, email: unknown): string | null {
  const n = cleanStr(name);
  const e = cleanStr(email);
  if (n && e) return `${n} <${e.replace(/[<>]/g, "").trim()}>`;
  return n ?? e;
}

interface TicketDraft {
  origen: "erni_sedena" | "erni_semar";
  site_name: string | null;
  area: string | null;
  equipo: string | null;
  numero_serie: string | null;
  problema: string | null;
  ultimo_avance: string | null;
  contacto_aduana: string | null;
  contacto_anam: string | null;
  notes: string | null;
}

function readSedena(): TicketDraft[] {
  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets["SEDENA"];
  if (!sheet) throw new Error(`No se encontró la hoja "SEDENA" en ${xlsxPath}`);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });

  return rows
    .filter((r) => typeof r[0] === "number")
    .map((r) => ({
      origen: "erni_sedena" as const,
      site_name: cleanStr(r[1]),
      area: cleanStr(r[2]),
      equipo: cleanStr(r[3]),
      numero_serie: null,
      problema: cleanStr(r[4]),
      ultimo_avance: cleanStr(r[5]),
      contacto_aduana: contact(r[6], r[7]),
      contacto_anam: contact(r[8], r[9]),
      notes: null,
    }));
}

function readSemar(): TicketDraft[] {
  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets["SEMAR"];
  if (!sheet) throw new Error(`No se encontró la hoja "SEMAR" en ${xlsxPath}`);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });

  return rows
    .filter((r) => typeof r[0] === "number")
    .map((r) => {
      const problemas = [cleanStr(r[6]), cleanStr(r[7])].filter(Boolean);
      return {
        origen: "erni_semar" as const,
        site_name: cleanStr(r[1]),
        area: cleanStr(r[2]),
        equipo: cleanStr(r[3]),
        numero_serie: cleanStr(r[4]),
        problema: problemas.length > 0 ? problemas.join(" / ") : null,
        ultimo_avance: cleanStr(r[5]),
        contacto_aduana: null,
        contacto_anam: null,
        notes: cleanStr(r[8]),
      };
    });
}

// Import de una sola vez: cada fila del Excel se convierte en un ticket,
// sin intentar deduplicar por contenido (dos equipos distintos pueden
// describirse con el mismo texto, ej. numero_serie "PENDIENTE").
// Para re-ejecutar de cero, borra antes los tickets de ese origen.
async function insertTicket(draft: TicketDraft) {
  const { error } = await supabase.from("tickets").insert({
    ...draft,
    estatus: "abierto",
  });
  if (error) throw new Error(`Error creando ticket: ${error.message}`);
}

async function main() {
  console.log(`Leyendo ${xlsxPath}...`);
  const sedena = readSedena();
  const semar = readSemar();
  console.log(`SEDENA: ${sedena.length} filas. SEMAR: ${semar.length} filas.`);

  for (const draft of [...sedena, ...semar]) {
    await insertTicket(draft);
  }

  console.log(`\nListo. ${sedena.length + semar.length} tickets creados.`);
}

main().catch((err) => {
  console.error("Falló la siembra de fallas ERNI:", err);
  process.exit(1);
});
