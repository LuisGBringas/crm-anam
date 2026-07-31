"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  FilePlus2,
  List,
  LogOut,
  Map as MapIcon,
  MoreHorizontal,
  PlusCircle,
  Ticket,
  X,
  Zap,
} from "lucide-react";
import { useAuth, useRequireAuth } from "./AuthProvider";

const NAV_ITEMS = [
  { href: "/mapa", label: "Mapa", Icon: MapIcon },
  { href: "/unidades", label: "Lista de unidades", Icon: List },
  { href: "/unidades/nueva", label: "Nueva unidad", Icon: FilePlus2 },
  { href: "/tickets", label: "Tickets", Icon: Ticket },
  { href: "/tickets/nuevo", label: "Nuevo ticket", Icon: PlusCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  useEffect(() => {
    setMobileMoreOpen(false);
  }, [pathname]);

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
    <div className="flex flex-1 min-h-0 flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-anam.png"
              alt="ANAM"
              width={180}
              height={48}
              className="h-8 w-auto sm:h-9"
            />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <p className="text-sm font-semibold leading-tight text-primary">
                Sistema de Gestión de Unidades de Energía
              </p>
              <p className="hidden text-xs leading-tight text-slate-500 sm:block">
                Agencia Nacional de Aduanas de México
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="hidden truncate text-xs text-slate-500 sm:inline sm:text-sm">
              {session.user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 snd-app-shell">
        <nav
          className={`menuMain ${collapsed ? "menuMain--collapsed" : ""}`}
          aria-label="Navegación principal"
          id="menuMain"
        >
          <button
            type="button"
            aria-controls="menuMain"
            aria-expanded={!collapsed}
            aria-haspopup="menu"
            className="menuMain__gatillo"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <span className="oculto">Mostrar menú</span>
            <ChevronLeft
              className={`menuMain__gatilloIco ${collapsed ? "is-collapsed" : ""}`}
              aria-hidden="true"
            />
          </button>

          <div className="menuMain__header">
            <div className="menuMain__headerCont">
              <Zap className="menuMain__icono" aria-hidden="true" />
              {!collapsed && <span className="menuMain__headerTxt">CRM ANAM</span>}
            </div>
          </div>

          <ul className="menuMain__lista">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <li className="menuMain__item" key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="menuMain__link menuMain__linkSm"
                  >
                    <Icon className="menuMain__icono" aria-hidden="true" />
                    {!collapsed && <span className="menuMain__txt">{label}</span>}
                  </Link>
                </li>
              );
            })}
            <li className="menuMain__item menuMain__item--mas">
              <button
                className="menuMain__link"
                id="menuMovil__gatillo"
                aria-expanded={mobileMoreOpen}
                onClick={() => setMobileMoreOpen((prev) => !prev)}
              >
                <MoreHorizontal className="menuMain__icono" aria-hidden="true" />
                <span className="menuMain__txt">Más</span>
              </button>
            </li>
          </ul>

          <div
            className={`menuMovil ${mobileMoreOpen ? "menuMovil--abierto" : "menuMovil--colapsado"}`}
            id="menuMovil"
          >
            <button
              type="button"
              className="menuMovil__gatilloTop"
              id="menuMovil__gatilloTop"
              onClick={() => setMobileMoreOpen(false)}
            >
              <span className="oculto">Cerrar</span>
              <X className="ico--blanco--24" aria-hidden="true" />
            </button>

            <hr className="hr my--10" />
            <div className="menuMovil__tit">Cuenta</div>
            <ul className="menuMovil__list">
              <li className="menuMovil__item">
                <button className="menuMovil__link" onClick={handleSignOut}>
                  <LogOut className="ico--blanco--24" aria-hidden="true" />
                  <span className="menuMain__txt">Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="flex-1 min-h-0 overflow-auto bg-neutral-50">{children}</main>
      </div>
    </div>
  );
}
