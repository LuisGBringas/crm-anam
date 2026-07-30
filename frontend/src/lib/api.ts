"use client";

import { supabase } from "./supabaseClient";
import type {
  StatusHistoryEntry,
  Unit,
  UnitFormInput,
  UnitStatus,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function authHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Sesión no encontrada. Vuelve a iniciar sesión.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export interface UnitFilters {
  type?: string;
  status?: string;
  search?: string;
  state?: string;
}

export async function listUnits(filters: UnitFilters = {}): Promise<Unit[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.state) params.set("state", filters.state);

  const query = params.toString();
  const { data } = await request<{ data: Unit[] }>(
    `/api/units${query ? `?${query}` : ""}`
  );
  return data;
}

export async function getUnit(id: string): Promise<Unit> {
  const { data } = await request<{ data: Unit }>(`/api/units/${id}`);
  return data;
}

export async function getUnitHistory(id: string): Promise<StatusHistoryEntry[]> {
  const { data } = await request<{ data: StatusHistoryEntry[] }>(
    `/api/units/${id}/history`
  );
  return data;
}

export async function createUnit(input: UnitFormInput): Promise<Unit> {
  const { data } = await request<{ data: Unit }>(`/api/units`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function updateUnit(
  id: string,
  input: Partial<UnitFormInput>
): Promise<Unit> {
  const { data } = await request<{ data: Unit }>(`/api/units/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data;
}

export async function changeUnitStatus(
  id: string,
  status: UnitStatus,
  note?: string
): Promise<Unit> {
  const { data } = await request<{ data: Unit }>(`/api/units/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status, note }),
  });
  return data;
}

export async function deleteUnit(id: string): Promise<void> {
  await request<void>(`/api/units/${id}`, { method: "DELETE" });
}
