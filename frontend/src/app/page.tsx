"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { listTickets, listUnits } from "@/lib/api";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
  UNIT_TYPE_LABELS,
} from "@/lib/status";

interface DashboardStats {
  totalUnits: number;
  unitsByType: Record<string, number>;
  unitsByStatus: Record<string, number>;
  totalTickets: number;
  ticketsByStatus: Record<string, number>;
  openTickets: number;
  unitsInNeed: number;
}

const emptyStats = (): DashboardStats => ({
  totalUnits: 0,
  unitsByType: {},
  unitsByStatus: {},
  totalTickets: 0,
  ticketsByStatus: {},
  openTickets: 0,
  unitsInNeed: 0,
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

        const unitsByType = units.reduce<Record<string, number>>((acc, unit) => {
          acc[unit.unit_type] = (acc[unit.unit_type] ?? 0) + 1;
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

        setStats({
          totalUnits: units.length,
          unitsByType,
          unitsByStatus,
          totalTickets: tickets.length,
          ticketsByStatus,
          openTickets: tickets.filter((ticket) => ticket.estatus === "abierto").length,
          unitsInNeed: units.filter((unit) => unit.status !== "correcto").length,
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

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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
                Distribución por tipo
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {loading
                  ? null
                  : (["energia", "auxiliar"] as const).map((type) => {
                      const value = stats.unitsByType[type] ?? 0;
                      return (
                        <div key={type} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-semibold text-slate-700">
                            {UNIT_TYPE_LABELS[type]}
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
      </div>
    </AppShell>
  );
}
