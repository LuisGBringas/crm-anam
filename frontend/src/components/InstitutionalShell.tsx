import Link from "next/link";

export function InstitutionalShell({ children }: { children: React.ReactNode }) {
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
              <details className="snd-mexico-mobile-menu">
                <summary aria-label="Abrir menú institucional">Menú</summary>
                <div className="snd-mexico-mobile-links">
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
              </details>
            </div>
          </div>
        </section>

        <nav className="snd-navbar" aria-label="Navegación institucional">
          <div className="snd-container snd-navbar-inner">
            <Link href="/" className="snd-navbar-brand">
              CRM ANAM
            </Link>
            <div className="snd-navbar-items">
              <Link href="/mapa" className="snd-navbar-item">
                Mapa
              </Link>
              <Link href="/unidades" className="snd-navbar-item">
                Unidades
              </Link>
              <Link href="/tickets" className="snd-navbar-item">
                Tickets
              </Link>
              <a
                href="https://www.gob.mx"
                target="_blank"
                rel="noreferrer"
                className="snd-navbar-item"
              >
                Portal gob.mx
              </a>
            </div>
          </div>
        </nav>
      </header>

      <div id="mainContent" className="snd-content">
        {children}
      </div>

      <footer className="snd-footer snd-footer--lite">
        <div className="snd-container snd-footer-lite-content">
          <p>
            Agencia Nacional de Aduanas de México · Sistema interno de gestión de unidades de
            energía y auxiliares.
          </p>
          <a href="https://www.gob.mx/que-es-gobmx" target="_blank" rel="noreferrer">
            ¿Qué es gob.mx?
          </a>
        </div>
        <div className="snd-pleca" />
      </footer>
    </div>
  );
}
