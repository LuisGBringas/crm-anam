/**
 * Actualiza el CRM ANAM con el archivo de validación de tickets y
 * mantenimientos ("VERSION VALI HS"):
 *   - Sincroniza el estatus (Habilitado/No Habilitado) de las 2670
 *     unidades COSISI ya importadas, dejando bitácora del cambio.
 *   - Crea tickets de mantenimiento/incidente reales (columna TICKET)
 *     para las unidades que ya tienen seguimiento documentado.
 *
 * Uso:
 *   cd scripts && npm install && npm run update-val-hs
 *
 * Variables de entorno (ver .env.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   VAL_HS_XLSX_PATH (opcional, default: "../Analisis tickets y
 *   mantenimientos (VERSION  VALI HS).xlsx")
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
  process.env.VAL_HS_XLSX_PATH ??
    "../Analisis tickets y mantenimientos (VERSION  VALI HS).xlsx"
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
  if (s === "" || s === "-" || s === "." || s === "N/A") return null;
  return s;
}

function equipoToCategory(raw: string | null): string {
  const e = (raw ?? "").trim().toLowerCase();
  if (e.startsWith("planta")) return "planta_emergencia";
  if (e === "ups" || e === "upc") return "ups";
  if (e.startsWith("aire")) return "aire_acondicionado";
  return "otro";
}

function isHabilitado(estado: string | null): boolean {
  const e = (estado ?? "").trim().toLowerCase();
  return e.startsWith("habilit");
}

function splitTickets(raw: unknown): string[] {
  const s = cleanStr(raw);
  if (!s) return [];
  return s
    .split(/\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);
}

interface UnitRecord {
  id: string;
  site_name: string | null;
  category: string | null;
  numero_serie: string | null;
  status: string;
}

async function fetchAllCosisiUnits(): Promise<UnitRecord[]> {
  const all: UnitRecord[] = [];
  const pageSize = 1000;
  for (let page = 0; ; page++) {
    const from = page * pageSize;
    const { data, error } = await supabase
      .from("units")
      .select("id, site_name, category, numero_serie, status, external_ref")
      .eq("source", "cosisi")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Error leyendo units: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as unknown as UnitRecord[]));
    if (data.length < pageSize) break;
  }
  return all;
}

async function fetchExistingTicketNumbers(): Promise<Set<string>> {
  const set = new Set<string>();
  const pageSize = 1000;
  for (let page = 0; ; page++) {
    const from = page * pageSize;
    const { data, error } = await supabase
      .from("tickets")
      .select("ticket_number")
      .not("ticket_number", "is", null)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Error leyendo tickets: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row.ticket_number) set.add(row.ticket_number as string);
    }
    if (data.length < pageSize) break;
  }
  return set;
}

async function main() {
  console.log(`Leyendo ${xlsxPath}...`);
  const workbook = XLSX.readFile(xlsxPath, { cellDates: true });

  console.log("Cargando unidades e IDs existentes desde Supabase...");
  const units = await fetchAllCosisiUnits();
  const unitsByExternalRef = new Map<string, UnitRecord & { external_ref: string }>();
  const unitsByComposite = new Map<string, UnitRecord>();
  for (const u of units as Array<UnitRecord & { external_ref: string }>) {
    unitsByExternalRef.set(u.external_ref, u);
    unitsByComposite.set(
      `${u.site_name ?? ""}|${u.category ?? ""}|${u.numero_serie ?? ""}`,
      u
    );
  }
  const existingTicketNumbers = await fetchExistingTicketNumbers();
  console.log(
    `${units.length} unidades cargadas, ${existingTicketNumbers.size} tickets ya existentes.`
  );

  // ── 1) Sincronizar estatus + crear tickets desde el consolidado validado ──
  const sheet = workbook.Sheets["Consolidado Final - (VAL HS)"];
  if (!sheet) throw new Error('No se encontró la hoja "Consolidado Final - (VAL HS)"');
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true }).slice(1);

  let statusUpdates = 0;
  let notesUpdates = 0;
  let ticketsCreated = 0;
  let unmatched = 0;

  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    const externalRef = `cosisi/row-${j + 3}`;
    const unit = unitsByExternalRef.get(externalRef);
    if (!unit) {
      unmatched++;
      continue;
    }

    const siteName = cleanStr(row[0]);
    const equipoRaw = cleanStr(row[1]);
    const numeroSerie = cleanStr(row[3]);
    const estado = cleanStr(row[8]);
    const observacionValidada = cleanStr(row[14]);
    const observaciones2 = cleanStr(row[9]);
    const estatusCambio = cleanStr(row[7]);
    const newStatus = isHabilitado(estado) ? "correcto" : "mantenimiento_necesario";

    const updates: Record<string, unknown> = {};
    if (newStatus !== unit.status) updates.status = newStatus;
    if (observacionValidada) updates.notes = observacionValidada;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("units").update(updates).eq("id", unit.id);
      if (error) throw new Error(`Error actualizando unidad ${unit.id}: ${error.message}`);

      if (updates.status) {
        statusUpdates++;
        await supabase.from("status_history").insert({
          unit_id: unit.id,
          previous_status: unit.status,
          new_status: newStatus,
          note: "Actualizado desde archivo de validación (VAL HS).",
        });
        unit.status = newStatus;
      }
      if (updates.notes) notesUpdates++;
    }

    const problema = observacionValidada ?? observaciones2 ?? estatusCambio;
    for (const ticketNumber of splitTickets(row[15])) {
      if (existingTicketNumbers.has(ticketNumber)) continue;
      existingTicketNumbers.add(ticketNumber);

      const { error } = await supabase.from("tickets").insert({
        ticket_number: ticketNumber,
        origen: "cosisi",
        unit_id: unit.id,
        site_name: siteName,
        equipo: equipoRaw,
        numero_serie: numeroSerie,
        problema,
        estatus: isHabilitado(estado) ? "resuelto" : "en_proceso",
        notes: "Ticket de validación HS (consolidado).",
      });
      if (error) throw new Error(`Error creando ticket ${ticketNumber}: ${error.message}`);
      ticketsCreated++;
    }

    if ((j + 1) % 500 === 0) {
      console.log(`  … ${j + 1}/${rows.length} filas procesadas`);
    }
  }

  console.log(
    `\nConsolidado validado: ${statusUpdates} estatus actualizados, ${notesUpdates} notas actualizadas, ${ticketsCreated} tickets nuevos, ${unmatched} filas sin unidad correspondiente.`
  );

  // ── 2) Tickets curados de "Observaciones UPS-PE (VAL HS)" ──
  const obsSheet = workbook.Sheets["Observaciones UPS-PE (VAL HS)"];
  if (!obsSheet) {
    console.log('No se encontró la hoja "Observaciones UPS-PE (VAL HS)", se omite.');
  } else {
    const obsRows = XLSX.utils
      .sheet_to_json<unknown[]>(obsSheet, { header: 1, raw: true })
      .slice(1)
      .filter((r) => cleanStr(r[0]));

    let obsCreated = 0;
    let obsSkipped = 0;
    for (const row of obsRows) {
      const siteName = cleanStr(row[0]);
      const equipoRaw = cleanStr(row[1]);
      const category = equipoToCategory(equipoRaw);
      const numeroSerie = cleanStr(row[4]);
      const estado = cleanStr(row[6]);
      const observaciones = cleanStr(row[7]);
      const ticketNumber = cleanStr(row[8]);

      if (!ticketNumber || existingTicketNumbers.has(ticketNumber)) {
        obsSkipped++;
        continue;
      }
      existingTicketNumbers.add(ticketNumber);

      const unit = unitsByComposite.get(`${siteName ?? ""}|${category}|${numeroSerie ?? ""}`);

      const { error } = await supabase.from("tickets").insert({
        ticket_number: ticketNumber,
        origen: "cosisi",
        unit_id: unit?.id ?? null,
        site_name: siteName,
        equipo: equipoRaw,
        numero_serie: numeroSerie,
        problema: observaciones,
        estatus: isHabilitado(estado) ? "resuelto" : "en_proceso",
        notes: "Observación curada UPS/Planta de Emergencia (VAL HS).",
      });
      if (error) throw new Error(`Error creando ticket ${ticketNumber}: ${error.message}`);
      obsCreated++;
    }
    console.log(
      `Observaciones UPS-PE: ${obsCreated} tickets nuevos, ${obsSkipped} ya existían u omitidos.`
    );
  }

  console.log("\nListo.");
}

main().catch((err) => {
  console.error("Falló la actualización VAL HS:", err);
  process.exit(1);
});
