/**
 * Siembra la base de datos del CRM ANAM con unidades reales de energía
 * (power=plant) y unidades auxiliares (power=substation) de México,
 * obtenidas de OpenStreetMap vía Overpass API.
 *
 * Uso:
 *   cd scripts && npm install && npm run import-osm
 *
 * Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en scripts/.env
 * (ver .env.example).
 *
 * Fuente de datos: © OpenStreetMap contributors, licencia ODbL.
 * Referencia: https://openinframap.org/stats/area/Mexico/plants
 */
import "dotenv/config";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "sin-contacto@example.com";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copia .env.example a .env y complétalo."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

async function runOverpassQuery(
  query: string,
  retries = 4
): Promise<OverpassElement[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "User-Agent": `crm-anam-import/1.0 (contacto: ${CONTACT_EMAIL})`,
      },
      body: query,
    });

    if (response.ok) {
      const data = (await response.json()) as OverpassResponse;
      return data.elements;
    }

    const body = await response.text();
    const retryable = response.status === 504 || response.status === 429;
    if (!retryable || attempt === retries) {
      throw new Error(`Overpass respondió ${response.status}: ${body}`);
    }

    const waitMs = attempt * 15_000;
    console.log(
      `  Overpass ocupado (${response.status}), reintentando en ${
        waitMs / 1000
      }s… (intento ${attempt}/${retries})`
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  throw new Error("No se pudo completar la consulta a Overpass.");
}

function centerOf(el: OverpassElement): { lat: number; lon: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center) return el.center;
  return null;
}

const SOURCE_TO_CATEGORY: Record<string, string> = {
  solar: "solar",
  wind: "eolica",
  hydro: "hidroelectrica",
  gas: "termica",
  oil: "termica",
  coal: "termica",
  diesel: "termica",
  nuclear: "nuclear",
  geothermal: "geotermica",
  biomass: "termica",
  biogas: "termica",
};

function categoryFromPlantSource(tags: Record<string, string>): string {
  const raw = tags["plant:source"] ?? tags["generator:source"];
  if (!raw) return "otro";
  const first = raw.split(";")[0].trim().toLowerCase();
  return SOURCE_TO_CATEGORY[first] ?? "otro";
}

function parseCapacityMW(tags: Record<string, string>): number | null {
  const raw =
    tags["plant:output:electricity"] ?? tags["generator:output:electricity"];
  if (!raw) return null;

  const match = raw.match(/([\d.,]+)\s*(GW|MW|kW|W)?/i);
  if (!match) return null;

  const value = parseFloat(match[1].replace(",", "."));
  if (Number.isNaN(value)) return null;

  const unit = (match[2] ?? "MW").toUpperCase();
  switch (unit) {
    case "GW":
      return value * 1000;
    case "MW":
      return value;
    case "KW":
      return value / 1000;
    case "W":
      return value / 1_000_000;
    default:
      return value;
  }
}

interface UnitRow {
  id?: string;
  name: string;
  unit_type: "energia" | "auxiliar";
  category: string;
  operator: string | null;
  capacity_mw: number | null;
  status: "correcto";
  latitude: number;
  longitude: number;
  address: string | null;
  state: string | null;
  source: "osm";
  external_ref: string;
  notes: string;
}

function elementToUnitRow(
  el: OverpassElement,
  unitType: "energia" | "auxiliar"
): UnitRow | null {
  const tags = el.tags ?? {};
  const center = centerOf(el);
  if (!center) return null;

  const name = tags.name ?? tags["name:es"];
  if (!name) return null;

  return {
    name,
    unit_type: unitType,
    category:
      unitType === "energia" ? categoryFromPlantSource(tags) : "subestacion",
    operator: tags.operator ?? null,
    capacity_mw: unitType === "energia" ? parseCapacityMW(tags) : null,
    status: "correcto",
    latitude: center.lat,
    longitude: center.lon,
    address: null,
    state: tags["addr:state"] ?? tags["is_in:state"] ?? null,
    source: "osm",
    external_ref: `${el.type}/${el.id}`,
    notes: `Importado de OpenStreetMap/OpenInfraMap el ${new Date()
      .toISOString()
      .slice(0, 10)}.`,
  };
}

async function upsertInChunks(rows: UnitRow[], chunkSize = 200) {
  // No hay un constraint único "de verdad" sobre external_ref (es un índice
  // parcial), así que PostgREST no puede resolver ON CONFLICT (external_ref).
  // En su lugar, resolvemos manualmente el id existente por external_ref y
  // hacemos upsert sobre la primary key, que sí es un constraint único real.
  const { data: existing, error: existingError } = await supabase
    .from("units")
    .select("id, external_ref")
    .not("external_ref", "is", null);

  if (existingError)
    throw new Error(`Error al leer unidades existentes: ${existingError.message}`);

  const idByExternalRef = new Map(
    (existing ?? []).map((row) => [row.external_ref as string, row.id as string])
  );

  const rowsWithId = rows.map((row) => ({
    ...row,
    id: idByExternalRef.get(row.external_ref) ?? randomUUID(),
  }));

  let inserted = 0;
  for (let i = 0; i < rowsWithId.length; i += chunkSize) {
    const chunk = rowsWithId.slice(i, i + chunkSize);
    const { error } = await supabase.from("units").upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`Error al insertar lote: ${error.message}`);
    inserted += chunk.length;
    console.log(`  … ${inserted}/${rowsWithId.length} registros`);
  }
}

async function main() {
  console.log("Consultando plantas de energía (power=plant) en México…");
  const plantElements = await runOverpassQuery(`
    [out:json][timeout:180];
    area["ISO3166-1"="MX"][admin_level=2]->.mx;
    (
      node["power"="plant"](area.mx);
      way["power"="plant"](area.mx);
      relation["power"="plant"](area.mx);
    );
    out center tags;
  `);

  const plantRows = plantElements
    .map((el) => elementToUnitRow(el, "energia"))
    .filter((row): row is UnitRow => row !== null);

  console.log(
    `Encontradas ${plantElements.length} plantas, ${plantRows.length} con nombre y ubicación válidos.`
  );
  console.log("Insertando unidades de energía en Supabase…");
  await upsertInChunks(plantRows);

  console.log("\nConsultando subestaciones (power=substation) con nombre…");
  const substationElements = await runOverpassQuery(`
    [out:json][timeout:180];
    area["ISO3166-1"="MX"][admin_level=2]->.mx;
    (
      node["power"="substation"]["name"](area.mx);
      way["power"="substation"]["name"](area.mx);
      relation["power"="substation"]["name"](area.mx);
    );
    out center tags;
  `);

  const substationRows = substationElements
    .map((el) => elementToUnitRow(el, "auxiliar"))
    .filter((row): row is UnitRow => row !== null);

  console.log(
    `Encontradas ${substationElements.length} subestaciones, ${substationRows.length} con nombre y ubicación válidos.`
  );
  console.log("Insertando unidades auxiliares en Supabase…");
  await upsertInChunks(substationRows);

  console.log(
    `\nListo. ${plantRows.length} unidades de energía y ${substationRows.length} unidades auxiliares sembradas/actualizadas.`
  );
}

main().catch((err) => {
  console.error("Falló la siembra de datos:", err);
  process.exit(1);
});
