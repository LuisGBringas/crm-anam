import * as fs from "fs";
import * as path from "path";

const CACHE_PATH = path.join(__dirname, ".geocode-cache.json");
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "sin-contacto@example.com";

type CacheEntry = { lat: number; lon: number } | null;
type Cache = Record<string, CacheEntry>;

function loadCache(): Cache {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

const cache = loadCache();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryNominatim(query: string): Promise<CacheEntry> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(
    query
  )}`;
  const response = await fetch(url, {
    headers: { "User-Agent": `crm-anam-import/1.0 (contacto: ${CONTACT_EMAIL})` },
  });
  if (!response.ok) return null;
  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (results.length === 0) return null;
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

/** Deriva 1-3 variantes de búsqueda a partir de un nombre de sitio tipo
 * "VPN 47 Aduana Agua Prieta - Sede" para maximizar el acierto en Nominatim. */
function buildQueryVariants(siteName: string): string[] {
  const withoutVpn = siteName.replace(/^VPN\s*\d+\s*/i, "").trim();
  const beforeDash = withoutVpn.split(" - ")[0].trim();
  const stripped = beforeDash
    .replace(/^(Aduana|Local|Secci[oó]n Aduanera|Pto\.?\s*Front\.?|Cruce Int\.?|Puente Int\.?)\s+/i, "")
    .trim();
  const lastWords = stripped.split(/\s+/).slice(-2).join(" ");

  const variants = [beforeDash, stripped, lastWords]
    .map((v) => v.trim())
    .filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i);

  return variants.map((v) => `${v}, México`);
}

/** Geocodifica un sitio (con caché) probando variantes del nombre hasta
 * encontrar coordenadas. Devuelve null si ninguna variante resuelve. */
export async function geocodeSite(
  siteName: string
): Promise<{ lat: number; lon: number } | null> {
  if (siteName in cache) return cache[siteName];

  let result: CacheEntry = null;
  for (const variant of buildQueryVariants(siteName)) {
    result = await queryNominatim(variant);
    await sleep(1100); // política de Nominatim: máx. 1 req/seg
    if (result) break;
  }

  cache[siteName] = result;
  saveCache(cache);
  return result;
}
