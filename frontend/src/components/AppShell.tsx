"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "./AuthProvider";

const NAV_ITEMS = [
  { href: "/mapa", label: "Mapa" },
  { href: "/unidades", label: "Lista de unidades" },
  { href: "/unidades/nueva", label: "Nueva unidad" },
  { href: "/tickets", label: "Tickets" },
  { href: "/tickets/nuevo", label: "Nuevo ticket" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral">
        Cargando…
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-primary px-6 py-3 text-white">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-anam.png"
            alt="ANAM"
            width={180}
            height={48}
            className="h-9 w-auto bg-white rounded px-2 py-1"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight">
              Sistema de Gestión de Unidades de Energía
            </p>
            <p className="text-xs text-white/70 leading-tight">
              Agencia Nacional de Aduanas de México
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-white/80 md:inline">
            {session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-md border border-white/30 px-3 py-1.5 text-xs font-medium transition hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/unidades"
                  ? pathname === "/unidades"
                  : pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 bg-neutral-50">{children}</main>
      </div>

      <footer className="border-t border-slate-200 bg-white px-6 py-2 text-center text-[11px] text-neutral">
        Inventario de unidades: COSISI. Ubicaciones aproximadas por
        aduana/sitio (© OpenStreetMap contributors, ODbL, vía Nominatim).
      </footer>
    </div>
  );
}
