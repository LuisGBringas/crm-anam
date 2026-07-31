import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import {
  TICKET_ORIGENS,
  TICKET_STATUSES,
  type TicketOrigen,
  type TicketStatus,
} from "../types";

export const ticketsRouter = Router();

ticketsRouter.use(requireAuth);

function isTicketOrigen(value: unknown): value is TicketOrigen {
  return typeof value === "string" && (TICKET_ORIGENS as string[]).includes(value);
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (TICKET_STATUSES as string[]).includes(value);
}

// GET /api/tickets?origen=&estatus=&search=&unit_id=
ticketsRouter.get("/", async (req, res) => {
  const { origen, estatus, search, unit_id } = req.query;

  function buildQuery() {
    let query = supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (typeof origen === "string" && isTicketOrigen(origen)) {
      query = query.eq("origen", origen);
    }
    if (typeof estatus === "string" && isTicketStatus(estatus)) {
      query = query.eq("estatus", estatus);
    }
    if (typeof unit_id === "string" && unit_id.trim() !== "") {
      query = query.eq("unit_id", unit_id);
    }
    if (typeof search === "string" && search.trim() !== "") {
      query = query.or(
        `site_name.ilike.%${search}%,equipo.ilike.%${search}%,problema.ilike.%${search}%,ticket_number.ilike.%${search}%`
      );
    }
    return query;
  }

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

// GET /api/tickets/:id
ticketsRouter.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Ticket no encontrado." });
  res.json({ data });
});

// GET /api/tickets/:id/history
ticketsRouter.get("/:id/history", async (req, res) => {
  const { data, error } = await supabase
    .from("ticket_status_history")
    .select("*")
    .eq("ticket_id", req.params.id)
    .order("changed_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// POST /api/tickets
ticketsRouter.post("/", async (req, res) => {
  const body = req.body ?? {};

  const origen: TicketOrigen = isTicketOrigen(body.origen) ? body.origen : "manual";
  const estatus: TicketStatus = isTicketStatus(body.estatus) ? body.estatus : "abierto";

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      ticket_number: body.ticket_number ?? null,
      origen,
      unit_id: body.unit_id ?? null,
      site_name: body.site_name ?? null,
      area: body.area ?? null,
      equipo: body.equipo ?? null,
      numero_serie: body.numero_serie ?? null,
      problema: body.problema ?? null,
      ultimo_avance: body.ultimo_avance ?? null,
      estatus,
      fecha_apertura: body.fecha_apertura ?? null,
      contacto_aduana: body.contacto_aduana ?? null,
      contacto_anam: body.contacto_anam ?? null,
      notes: body.notes ?? null,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("ticket_status_history").insert({
    ticket_id: data.id,
    previous_status: null,
    new_status: estatus,
    note: "Ticket creado.",
    changed_by: req.userId,
  });

  res.status(201).json({ data });
});

// PATCH /api/tickets/:id
ticketsRouter.patch("/:id", async (req, res) => {
  const body = req.body ?? {};
  const allowedFields = [
    "ticket_number",
    "origen",
    "unit_id",
    "site_name",
    "area",
    "equipo",
    "numero_serie",
    "problema",
    "ultimo_avance",
    "fecha_apertura",
    "contacto_aduana",
    "contacto_anam",
    "notes",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }
  if ("origen" in updates && !isTicketOrigen(updates.origen)) {
    return res.status(400).json({ error: "origen inválido." });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No se enviaron campos para actualizar." });
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// POST /api/tickets/:id/status — cambia estatus y registra bitácora
ticketsRouter.post("/:id/status", async (req, res) => {
  const { estatus, note } = req.body ?? {};

  if (!isTicketStatus(estatus)) {
    return res.status(400).json({ error: "estatus inválido." });
  }

  const { data: current, error: currentError } = await supabase
    .from("tickets")
    .select("estatus")
    .eq("id", req.params.id)
    .single();

  if (currentError) return res.status(404).json({ error: "Ticket no encontrado." });

  const { data, error } = await supabase
    .from("tickets")
    .update({ estatus })
    .eq("id", req.params.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("ticket_status_history").insert({
    ticket_id: req.params.id,
    previous_status: current.estatus,
    new_status: estatus,
    note: note ?? null,
    changed_by: req.userId,
  });

  res.json({ data });
});

// DELETE /api/tickets/:id
ticketsRouter.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("tickets").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});
