"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TicketStatusBadge } from "@/components/StatusBadge";
import { listTickets, listUnits } from "@/lib/api";
import {
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  TICKET_ORIGEN_LABELS,
  TICKET_ORIGEN_LIST,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
} from "@/lib/status";
import type { Ticket, TicketOrigen } from "@/lib/types";

interface SiteCount {
  site: string;
  count: number;
}

interface DashboardStats {
  totalUnits: number;
  unitsByCategory: Record<string, number>;
  unitsByStatus: Record<string, number>;
  totalTickets: number;
  ticketsByStatus: Record<string, number>;
  ticketsByOrigen: Record<string, number>;
  openTickets: number;
  unitsInNeed: number;
  topSites: SiteCount[];
  recentTickets: Ticket[];
}

const emptyStats = (): DashboardStats => ({
  totalUnits: 0,
  unitsByCategory: {},
  unitsByStatus: {},
  totalTickets: 0,
  ticketsByStatus: {},
  ticketsByOrigen: {},
  openTickets: 0,
  unitsInNeed: 0,
  topSites: [],
  recentTickets: [],
});

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [units, tickets] = await Promise.all([listUnits(), listTickets()]);
        if (!mounted) return;

        const unitsByCategory = units.reduce<Record<string, number>>((acc, unit) => {
          const key = unit.category ?? "otro";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {});

        const unitsByStatus = units.reduce<Record<string, number>>((acc, unit) => {
          acc[unit.status] = (acc[unit.status] ?? 0) + 1;
          return acc;
        }, {});

        const ticketsByStatus = tickets.reduce<Record<string, number>>((acc, ticket) => {
          acc[ticket.estatus] = (acc[ticket.estatus] ?? 0) + 1;
          return acc;
        }, {});

        const ticketsByOrigen = tickets.reduce<Record<string, number>>((acc, ticket) => {
          acc[ticket.origen] = (acc[ticket.origen] ?? 0) + 1;
          return acc;
        }, {});

        const siteCounts = tickets.reduce<Record<string, number>>((acc, ticket) => {
          const site = ticket.site_name?.trim();
          if (!site) return acc;
          acc[site] = (acc[site] ?? 0) + 1;
          return acc;
        }, {});
        const topSites = Object.entries(siteCounts)
          .map(([site, count]) => ({ site, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const recentTickets = [...tickets]
          .sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 6);

        setStats({
          totalUnits: units.length,
          unitsByCategory,
          unitsByStatus,
          totalTickets: tickets.length,
          ticketsByStatus,
          ticketsByOrigen,
          openTickets: tickets.filter(
            (ticket) => ticket.estatus === "abierto" || ticket.estatus === "en_proceso"
          ).length,
          unitsInNeed: units.filter((unit) => unit.status !== "correcto").length,
          topSites,
          recentTickets,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const summaryCards = useMemo(
    () => [
      {
        title: "Unidades registradas",
        value: stats.totalUnits,
        hint: "Total en el sistema",
      },
      {
        title: "Unidades en alerta",
        value: stats.unitsInNeed,
        hint: "Requieren atención",
      },
      {
        title: "Tickets activos",
        value: stats.openTickets,
        hint: "Abiertos o en proceso",
      },
      {
        title: "Tickets registrados",
        value: stats.totalTickets,
        hint: "Historial general",
      },
    ],
    [stats]
  );

  return (
    <AppShell>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-slate-800">
              Resumen operativo de ANAM
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Consulta el estado general de unidades y tickets desde un solo lugar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/mapa"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Ver mapa
            </Link>
            <Link
              href="/unidades"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Ver unidades
            </Link>
            <Link
              href="/tickets"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Ver tickets
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800">
                {loading ? "—" : card.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Estado de unidades</h2>
              <span className="text-sm text-slate-500">Por estatus</span>
            </div>
            <div className="space-y-4">
              {loading
                ? null
                : (["correcto", "mantenimiento_programado", "mantenimiento_necesario"] as const).map(
                    (status) => {
                      const value = stats.unitsByStatus[status] ?? 0;
                      const width = stats.totalUnits ? (value / stats.totalUnits) * 100 : 0;
                      return (
                        <div key={status}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">
                              {STATUS_LABELS[status]}
                            </span>
                            <span className="text-slate-500">{value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.max(width, 6)}%`,
                                backgroundColor: STATUS_COLORS[status],
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Distribución por tipo de equipo
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {loading
                  ? null
                  : (["ups", "planta_emergencia", "aire_acondicionado"] as const).map((cat) => {
                      const value = stats.unitsByCategory[cat] ?? 0;
                      return (
                        <div key={cat} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-700">
                            {CATEGORY_LABELS[cat]}
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Tickets</h2>
              <span className="text-sm text-slate-500">Por estatus</span>
            </div>
            <div className="space-y-4">
              {loading
                ? null
                : (["abierto", "en_proceso", "resuelto", "cancelado"] as const).map((status) => {
                    const value = stats.ticketsByStatus[status] ?? 0;
                    const width = stats.totalTickets ? (value / stats.totalTickets) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {TICKET_STATUS_LABELS[status]}
                          </span>
                          <span className="text-slate-500">{value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.max(width, 6)}%`,
                              backgroundColor: TICKET_STATUS_COLORS[status],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Por origen
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TICKET_ORIGEN_LIST.filter((o) => o !== "manual").map((origen: TicketOrigen) => (
                  <div key={origen} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                    <p className="text-xs font-medium text-slate-500">
                      {TICKET_ORIGEN_LABELS[origen]}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-800">
                      {loading ? "—" : stats.ticketsByOrigen[origen] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Acciones rápidas</p>
              <div className="mt-3 space-y-2">
                <Link href="/unidades/nueva" className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary hover:text-primary">
                  Registrar una nueva unidad
                </Link>
                <Link href="/tickets/nuevo" className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-primary hover:text-primary">
                  Crear un nuevo ticket
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Sitios con más tickets
              </h2>
              <span className="text-sm text-slate-500">Top 6</span>
            </div>
            <ul className="space-y-3">
              {!loading && stats.topSites.length === 0 && (
                <li className="text-sm text-neutral">Sin tickets registrados.</li>
              )}
              {stats.topSites.map((item, index) => {
                const width = stats.topSites[0]
                  ? (item.count / stats.topSites[0].count) * 100
                  : 0;
                return (
                  <li key={item.site}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate font-medium text-slate-700">
                        <span className="mr-1.5 text-slate-400">{index + 1}.</span>
                        {item.site}
                      </span>
                      <span className="shrink-0 text-slate-500">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.max(width, 6)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Actividad reciente</h2>
              <Link href="/tickets" className="text-sm font-medium text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {!loading && stats.recentTickets.length === 0 && (
                <li className="py-3 text-sm text-neutral">Sin tickets registrados.</li>
              )}
              {stats.recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {ticket.site_name || "Sitio sin nombre"}
                        {ticket.equipo ? ` · ${ticket.equipo}` : ""}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {TICKET_ORIGEN_LABELS[ticket.origen]}
                        {ticket.ticket_number ? ` · ${ticket.ticket_number}` : ""}
                      </p>
                    </div>
                    <TicketStatusBadge status={ticket.estatus} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
