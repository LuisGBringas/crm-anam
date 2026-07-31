/**
 * Siembra el CRM ANAM con el inventario real COSISI (UPS, Aires
 * Acondicionados y Plantas de Emergencia en aduanas de todo el país).
 *
 * Uso:
 *   cd scripts && npm install && npm run import-cosisi
 *
 * Variables de entorno (ver .env.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CONTACT_EMAIL
 *   COSISI_XLSX_PATH (opcional, default: "../Inventario Inicial COSISI 2.0.xlsx")
 *
 * El archivo .xlsx NUNCA se sube al repo (ver .gitignore raíz) — contiene
 * números de serie y ubicaciones exactas de equipo crítico de ANAM.
 */
import "dotenv/config";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { geocodeSite } from "./geocode";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const xlsxPath = path.resolve(
  __dirname,
  process.env.COSISI_XLSX_PATH ?? "../Inventario Inicial COSISI 2.0.xlsx"
);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copia .env.example a .env y complétalo."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const SHEET_NAME = "Consolidado Final - ANAM_SAT";

const EQUIPO_TO_UNIT_TYPE: Record<string, "energia" | "auxiliar"> = {
  UPS: "energia",
  "Planta de Emergencia": "energia",
  "Aire Acondicionado": "auxiliar",
};

const EQUIPO_TO_CATEGORY: Record<string, string> = {
  UPS: "ups",
  "Planta de Emergencia": "planta_emergencia",
  "Aire Acondicionado": "aire_acondicionado",
};

function cleanStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  if (s === "" || s === "-" || s === ".") return null;
  return s;
}

function shortSiteName(siteName: string): string {
  return siteName.replace(/^VPN\s*\d+\s*/i, "").trim();
}

function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  try {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      const year = value.getFullYear();
      if (year < 1990 || year > 2100) return null; // fechas corruptas del Excel
      return value.toISOString().slice(0, 10);
    }
    const s = cleanStr(value);
    if (!s || /^\d+(\.\d+)?$/.test(s)) return null; // número de serie Excel sin parsear
    const parsed = new Date(s);
    if (Number.isNaN(parsed.getTime())) return null;
    const year = parsed.getFullYear();
    if (year < 1990 || year > 2100) return null;
    return parsed.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

interface Row {
  vpn: unknown;
  sitio: unknown;
  equipo: unknown;
  hostname: unknown;
  marca: unknown;
  modelo: unknown;
  numeroSerie: unknown;
  direccion: unknown;
  capacidad: unknown;
  observaciones: unknown;
  iniciativa: unknown;
  fechaIncidente: unknown;
  noIncidente: unknown;
  estatusCambio: unknown;
  estado: unknown;
  esVirtual: unknown;
  criticidad: unknown;
  responsable: unknown;
  rowNumber: number;
}

function readRows(): Row[] {
  const workbook = XLSX.readFile(xlsxPath, { cellDates: true });
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) throw new Error(`No se encontró la hoja "${SHEET_NAME}" en ${xlsxPath}`);

  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true });
  const dataRows = raw.slice(2); // fila 0 = título, fila 1 = encabezados

  return dataRows
    .map((r, i) => ({
      vpn: r[0],
      sitio: r[1],
      equipo: r[2],
      hostname: r[3],
      marca: r[4],
      modelo: r[5],
      numeroSerie: r[6],
      direccion: r[7],
      capacidad: r[8],
      observaciones: r[9],
      iniciativa: r[11],
      fechaIncidente: r[12],
      noIncidente: r[13],
      estatusCambio: r[14],
      estado: r[15],
      esVirtual: r[17],
      criticidad: r[18],
      responsable: r[19],
      rowNumber: i + 3, // fila real en el Excel (1-indexed, +2 encabezados)
    }))
    .filter((r) => cleanStr(r.sitio) && cleanStr(r.equipo));
}

async function upsertUnit(row: Row, coords: { lat: number; lon: number } | null) {
  const equipo = cleanStr(row.equipo) ?? "otro";
  const unitType = EQUIPO_TO_UNIT_TYPE[equipo] ?? "auxiliar";
  const category = EQUIPO_TO_CATEGORY[equipo] ?? "otro";
  const siteName = cleanStr(row.sitio);
  const estado = cleanStr(row.estado);

  const externalRef = `cosisi/row-${row.rowNumber}`;

  const record = {
    name: `${equipo} · ${siteName ? shortSiteName(siteName) : "sitio sin nombre"}`,
    unit_type: unitType,
    category,
    operator: null,
    capacity_mw: null,
    status: estado?.toLowerCase() === "habilitado" ? "correcto" : "mantenimiento_necesario",
    latitude: coords?.lat ?? null,
    longitude: coords?.lon ?? null,
    address: cleanStr(row.observaciones),
    state: null,
    source: "cosisi",
    external_ref: externalRef,
    notes: cleanStr(row.estatusCambio),
    vpn_code: row.vpn !== null && row.vpn !== undefined ? String(row.vpn) : null,
    site_name: siteName,
    hostname: cleanStr(row.hostname),
    marca: cleanStr(row.marca),
    modelo: row.modelo !== null && row.modelo !== undefined ? String(row.modelo).trim() : null,
    numero_serie: cleanStr(row.numeroSerie),
    capacity_label: cleanStr(row.capacidad),
    rack_location: cleanStr(row.direccion),
    iniciativa: cleanStr(row.iniciativa),
    responsable_administracion: cleanStr(row.responsable),
    criticidad: cleanStr(row.criticidad),
    es_virtual: cleanStr(row.esVirtual),
  };

  const { data: existing } = await supabase
    .from("units")
    .select("id")
    .eq("external_ref", externalRef)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("units").update(record).eq("id", existing.id);
    if (error) throw new Error(`Error actualizando unidad fila ${row.rowNumber}: ${error.message}`);
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("units")
    .insert(record)
    .select("id")
    .single();
  if (error) throw new Error(`Error creando unidad fila ${row.rowNumber}: ${error.message}`);
  return data.id as string;
}

async function upsertIncidentTicket(row: Row, unitId: string) {
  const ticketNumber = cleanStr(row.noIncidente);
  if (!ticketNumber) return false;

  const { data: existing } = await supabase
    .from("tickets")
    .select("id")
    .eq("ticket_number", ticketNumber)
    .eq("origen", "cosisi")
    .maybeSingle();
  if (existing) return false;

  const { error } = await supabase.from("tickets").insert({
    ticket_number: ticketNumber,
    origen: "cosisi",
    unit_id: unitId,
    site_name: cleanStr(row.sitio),
    area: null,
    equipo: cleanStr(row.equipo),
    numero_serie: cleanStr(row.numeroSerie),
    problema: cleanStr(row.estatusCambio),
    ultimo_avance: null,
    estatus: "resuelto",
    fecha_apertura: toDateOnly(row.fechaIncidente),
    contacto_aduana: null,
    contacto_anam: null,
    notes: null,
  });
  if (error) throw new Error(`Error creando ticket fila ${row.rowNumber}: ${error.message}`);
  return true;
}

async function main() {
  console.log(`Leyendo ${xlsxPath}...`);
  const rows = readRows();
  console.log(`${rows.length} filas de equipo encontradas.`);

  const uniqueSites = [...new Set(rows.map((r) => cleanStr(r.sitio)).filter(Boolean))] as string[];
  console.log(`${uniqueSites.length} sitios únicos a geocodificar (Nominatim, ~1 req/seg)...`);

  const coordsBySite = new Map<string, { lat: number; lon: number } | null>();
  let geocoded = 0;
  for (const site of uniqueSites) {
    const coords = await geocodeSite(site);
    coordsBySite.set(site, coords);
    if (coords) geocoded++;
    if ((coordsBySite.size % 25) === 0) {
      console.log(`  … ${coordsBySite.size}/${uniqueSites.length} sitios procesados (${geocoded} geocodificados)`);
    }
  }
  console.log(`Geocodificación completa: ${geocoded}/${uniqueSites.length} sitios con coordenadas.`);

  let unitsCreatedOrUpdated = 0;
  let ticketsCreated = 0;
  for (const row of rows) {
    const siteName = cleanStr(row.sitio);
    const coords = siteName ? coordsBySite.get(siteName) ?? null : null;
    const unitId = await upsertUnit(row, coords);
    unitsCreatedOrUpdated++;
    if (await upsertIncidentTicket(row, unitId)) ticketsCreated++;

    if (unitsCreatedOrUpdated % 200 === 0) {
      console.log(`  … ${unitsCreatedOrUpdated}/${rows.length} unidades procesadas`);
    }
  }

  console.log(
    `\nListo. ${unitsCreatedOrUpdated} unidades procesadas, ${ticketsCreated} tickets de incidente creados.`
  );
}

main().catch((err) => {
  console.error("Falló la siembra de COSISI:", err);
  process.exit(1);
});
