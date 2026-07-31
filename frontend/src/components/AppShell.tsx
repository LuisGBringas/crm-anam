"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useRequireAuth } from "./AuthProvider";

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
    <div className="flex min-h-full flex-col">
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
            <svg
              className={`menuMain__gatilloIco ${collapsed ? "is-collapsed" : ""}`}
              focusable="false"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid meet"
              fill="currentColor"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 16L20 6 21.4 7.4 12.8 16 21.4 24.6 20 26z" />
            </svg>
          </button>

          <div className="menuMain__header">
            <div className="menuMain__headerCont">
              <img
                src="https://www.snd.gob.mx/assets/icons/document.svg"
                alt="CRM ANAM"
              />
              {!collapsed && <span className="menuMain__headerTxt">CRM ANAM</span>}
            </div>
          </div>

          <ul className="menuMain__lista">
            {[
              { href: "/mapa", label: "Mapa", icon: "home.svg" },
              { href: "/unidades", label: "Lista de unidades", icon: "folder.svg" },
              { href: "/unidades/nueva", label: "Nueva unidad", icon: "document--add.svg" },
              { href: "/tickets", label: "Tickets", icon: "document.svg" },
              { href: "/tickets/nuevo", label: "Nuevo ticket", icon: "add--alt.svg" },
            ].map((item) => {
              const active = pathname === item.href;
              return (
                <li className="menuMain__item" key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="menuMain__link menuMain__linkSm"
                  >
                    <img
                      src={`https://www.snd.gob.mx/assets/icons/${item.icon}`}
                      alt=""
                      aria-hidden="true"
                      className="menuMain__icono"
                    />
                    {!collapsed && <span className="menuMain__txt">{item.label}</span>}
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
                <img
                  src="https://www.snd.gob.mx/assets/icons/overflow-menu--horizontal.svg"
                  alt=""
                  aria-hidden="true"
                  className="menuMain__icono"
                />
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
              <img src="https://www.snd.gob.mx/assets/icons/close.svg" alt="" aria-hidden="true" />
            </button>

            <hr className="hr my--10" />
            <div className="menuMovil__tit">Cuenta</div>
            <ul className="menuMovil__list">
              <li className="menuMovil__item">
                <button className="menuMovil__link" onClick={handleSignOut}>
                  <img
                    src="https://www.snd.gob.mx/assets/icons/user--avatar.svg"
                    alt=""
                    aria-hidden="true"
                    className="ico--blanco--24"
                  />
                  <span className="menuMain__txt">Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="flex-1 min-h-0 bg-neutral-50">{children}</main>
      </div>

    </div>
  );
}
