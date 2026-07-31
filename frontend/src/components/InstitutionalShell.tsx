"use client";

import { useState } from "react";

export function InstitutionalShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="snd-layout snd-institutional">
      <header className="snd-header">
        <a className="snd-ir-content" href="#mainContent">
          Ir al contenido principal
        </a>

        <section className="snd-mexico">
          <div className="snd-container snd-mexico-contenedor">
            <a
              href="https://www.gob.mx/"
              className="snd-mexico-escudo-link"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://framework-gb.cdn.gob.mx/gobmx/img/logo_blanco.svg"
                className="snd-mexico-img"
                alt="Gobierno de México"
              />
            </a>

            <div className="snd-mexico-actions">
              <div className="snd-mexico-links">
                <a href="https://www.gob.mx/tramites" target="_blank" rel="noreferrer">
                  Trámites
                </a>
                <a href="https://www.gob.mx/gobierno" target="_blank" rel="noreferrer">
                  Gobierno
                </a>
                <a href="https://www.gob.mx/busqueda" target="_blank" rel="noreferrer">
                  Buscar
                </a>
              </div>

              <button
                type="button"
                className="snd-mexico-trigger"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-institutional-menu"
                onClick={() => setMobileMenuOpen((value) => !value)}
              >
                <span>Menú</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </header>

      <div
        id="mobile-institutional-menu"
        className={`snd-mexico-mobile-panel ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="snd-mexico-mobile-panel__content">
          <div className="snd-mexico-mobile-panel__top">
            <span>Secciones</span>
            <button
              type="button"
              className="snd-mexico-mobile-close"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cerrar
            </button>
          </div>

          <nav className="snd-mexico-mobile-nav" aria-label="Menú móvil institucional">
            <a href="https://www.gob.mx/tramites" target="_blank" rel="noreferrer">
              Trámites
            </a>
            <a href="https://www.gob.mx/gobierno" target="_blank" rel="noreferrer">
              Gobierno
            </a>
            <a href="https://www.gob.mx/busqueda" target="_blank" rel="noreferrer">
              Buscar
            </a>
            <a href="https://www.gob.mx" target="_blank" rel="noreferrer">
              Portal gob.mx
            </a>
          </nav>
        </div>
      </div>

      <div id="mainContent" className="snd-content">
        {children}
      </div>

      <footer className="snd-footer">
        <div className="snd-container snd-footer-main">
          <div className="snd-footer-col snd-footer-col--logo">
            <img
              src="https://framework-gb.cdn.gob.mx/gobmx/img/logo_blanco.svg"
              alt="Gobierno de México"
              className="snd-footer-goblogo"
            />
          </div>

          <div className="snd-footer-col">
            <h3>Enlaces</h3>
            <a href="https://www.gob.mx/" target="_blank" rel="noreferrer">
              Portal gob.mx
            </a>
            <a href="https://www.gob.mx/que-es-gobmx" target="_blank" rel="noreferrer">
              ¿Qué es gob.mx?
            </a>
            <a href="https://www.gob.mx/terminos" target="_blank" rel="noreferrer">
              Términos y condiciones
            </a>
          </div>

          <div className="snd-footer-col">
            <h3>Transparencia</h3>
            <a href="https://datos.gob.mx/" target="_blank" rel="noreferrer">
              Datos abiertos
            </a>
            <a
              href="https://www.plataformadetransparencia.org.mx/Inicio"
              target="_blank"
              rel="noreferrer"
            >
              Plataforma Nacional de Transparencia
            </a>
            <a href="https://www.gob.mx/accesibilidad" target="_blank" rel="noreferrer">
              Declaración de accesibilidad
            </a>
          </div>

          <div className="snd-footer-col">
            <h3>Atención</h3>
            <p>
              Sistema interno para la gestión de unidades de energía y unidades auxiliares de la
              Agencia Nacional de Aduanas de México.
            </p>
            <div className="snd-footer-079">
              <img
                src="https://www.snd.gob.mx/assets/icons-base/footer-flor.svg"
                alt=""
                aria-hidden="true"
              />
              <span>079</span>
              <small>Comunícate, estamos para ayudarte</small>
            </div>
            <p className="snd-footer-copy">© Gobierno de México · ANAM</p>
          </div>
        </div>
        <div className="snd-pleca" />
      </footer>
    </div>
  );
}
