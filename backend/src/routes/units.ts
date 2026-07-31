import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { UNIT_STATUSES, UNIT_TYPES, type UnitStatus, type UnitType } from "../types";

export const unitsRouter = Router();

unitsRouter.use(requireAuth);

function isUnitType(value: unknown): value is UnitType {
  return typeof value === "string" && (UNIT_TYPES as string[]).includes(value);
}

function isUnitStatus(value: unknown): value is UnitStatus {
  return typeof value === "string" && (UNIT_STATUSES as string[]).includes(value);
}

// GET /api/units?type=&status=&search=&state=
unitsRouter.get("/", async (req, res) => {
  const { type, status, search, state } = req.query;

  function buildQuery() {
    let query = supabase.from("units").select("*").order("name", { ascending: true });

    if (typeof type === "string" && isUnitType(type)) {
      query = query.eq("unit_type", type);
    }
    if (typeof status === "string" && isUnitStatus(status)) {
      query = query.eq("status", status);
    }
    if (typeof state === "string" && state.trim() !== "") {
      query = query.eq("state", state);
    }
    if (typeof search === "string" && search.trim() !== "") {
      query = query.or(
        `name.ilike.%${search}%,operator.ilike.%${search}%,address.ilike.%${search}%`
      );
    }
    return query;
  }

  // Supabase/PostgREST limita cada respuesta a un máximo de filas por
  // request (db-max-rows, típicamente 1000): paginamos hasta traer todo.
  const pageSize = 1000;
  const allRows: unknown[] = [];
  for (let page = 0; ; page++) {
    const from = page * pageSize;
    const { data, error } = await buildQuery().range(from, from + pageSize - 1);
    if (error) return res.status(500).json({ error: error.message });
    allRows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }

  res.json({ data: allRows });
});

// GET /api/units/:id
unitsRouter.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Unidad no encontrada." });
  res.json({ data });
});

// GET /api/units/:id/history
unitsRouter.get("/:id/history", async (req, res) => {
  const { data, error } = await supabase
    .from("status_history")
    .select("*")
    .eq("unit_id", req.params.id)
    .order("changed_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// POST /api/units
unitsRouter.post("/", async (req, res) => {
  const body = req.body ?? {};

  if (!body.name || typeof body.name !== "string") {
    return res.status(400).json({ error: "El nombre es obligatorio." });
  }
  if (!isUnitType(body.unit_type)) {
    return res.status(400).json({ error: "unit_type debe ser 'energia' o 'auxiliar'." });
  }
  if (
    (body.latitude !== undefined && body.latitude !== null && typeof body.latitude !== "number") ||
    (body.longitude !== undefined && body.longitude !== null && typeof body.longitude !== "number")
  ) {
    return res.status(400).json({ error: "latitude y longitude deben ser numéricos si se proporcionan." });
  }

  const status: UnitStatus = isUnitStatus(body.status) ? body.status : "correcto";

  const { data, error } = await supabase
    .from("units")
    .insert({
      name: body.name,
      unit_type: body.unit_type,
      category: body.category ?? null,
      operator: body.operator ?? null,
      capacity_mw: body.capacity_mw ?? null,
      status,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      address: body.address ?? null,
      state: body.state ?? null,
      source: body.source === "cosisi" ? "cosisi" : "manual",
      external_ref: body.external_ref ?? null,
      notes: body.notes ?? null,
      vpn_code: body.vpn_code ?? null,
      site_name: body.site_name ?? null,
      hostname: body.hostname ?? null,
      marca: body.marca ?? null,
      modelo: body.modelo ?? null,
      numero_serie: body.numero_serie ?? null,
      capacity_label: body.capacity_label ?? null,
      rack_location: body.rack_location ?? null,
      iniciativa: body.iniciativa ?? null,
      responsable_administracion: body.responsable_administracion ?? null,
      criticidad: body.criticidad ?? null,
      es_virtual: body.es_virtual ?? null,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("status_history").insert({
    unit_id: data.id,
    previous_status: null,
    new_status: status,
    note: "Unidad creada.",
    changed_by: req.userId,
  });

  res.status(201).json({ data });
});

// PATCH /api/units/:id
unitsRouter.patch("/:id", async (req, res) => {
  const body = req.body ?? {};
  const allowedFields = [
    "name",
    "unit_type",
    "category",
    "operator",
    "capacity_mw",
    "latitude",
    "longitude",
    "address",
    "state",
    "notes",
    "vpn_code",
    "site_name",
    "hostname",
    "marca",
    "modelo",
    "numero_serie",
    "capacity_label",
    "rack_location",
    "iniciativa",
    "responsable_administracion",
    "criticidad",
    "es_virtual",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }
  if ("unit_type" in updates && !isUnitType(updates.unit_type)) {
    return res.status(400).json({ error: "unit_type debe ser 'energia' o 'auxiliar'." });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No se enviaron campos para actualizar." });
  }

  const { data, error } = await supabase
    .from("units")
    .update(updates)
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// POST /api/units/:id/status — cambia estatus y registra bitácora
unitsRouter.post("/:id/status", async (req, res) => {
  const { status, note } = req.body ?? {};

  if (!isUnitStatus(status)) {
    return res.status(400).json({ error: "status inválido." });
  }

  const { data: current, error: currentError } = await supabase
    .from("units")
    .select("status")
    .eq("id", req.params.id)
    .single();

  if (currentError) return res.status(404).json({ error: "Unidad no encontrada." });

  const { data, error } = await supabase
    .from("units")
    .update({ status })
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("status_history").insert({
    unit_id: req.params.id,
    previous_status: current.status,
    new_status: status,
    note: note ?? null,
    changed_by: req.userId,
  });

  res.json({ data });
});

// DELETE /api/units/:id
unitsRouter.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("units").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});
