# CRM ANAM — Sistema de Gestión de Unidades de Energía y Auxiliares

Sistema de gestión (tipo CRM) para dar seguimiento al estatus de las
unidades de energía y unidades auxiliares de la Agencia Nacional de
Aduanas de México (ANAM): mapa interactivo, vista de lista y CRUD completo.

- **Frontend**: Next.js + TypeScript + Tailwind + Leaflet → se despliega en **Vercel**.
- **Backend**: Node + Express + TypeScript → se despliega en **Render**.
- **Base de datos**: Supabase (Postgres + Auth).

## Estructura del repositorio

```
CRM ANAM/
├── frontend/            Next.js (App Router) — mapa, lista, CRUD, login
├── backend/              API REST (Express) que habla con Supabase
├── supabase/migrations/  SQL para crear tablas, RLS y policies
├── scripts/               Script de siembra de datos reales (OpenStreetMap)
└── render.yaml            Blueprint de despliegue para Render
```

## 1. Crear el proyecto de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido de
   `supabase/migrations/0001_init.sql`. Esto crea las tablas `units`,
   `status_history`, `profiles`, sus índices y las políticas de RLS
   (solo usuarios autenticados pueden leer/escribir).
3. En **Authentication → Providers**, deja habilitado *Email* (usuario y
   contraseña).
4. Crea al menos un usuario en **Authentication → Users → Add user** (o
   habilita el registro y créalo desde el CRM más adelante) — con ese
   usuario iniciarás sesión en el sistema.
5. En **Settings → API** copia:
   - `Project URL` → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (¡nunca la expongas
     en el frontend, solo la usa el backend!)

## 2. Backend (local)

```bash
cd backend
cp .env.example .env   # completa SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CORS_ORIGIN
npm install
npm run dev             # http://localhost:4000
```

## 3. Frontend (local)

```bash
cd frontend
cp .env.example .env.local   # completa las 3 variables NEXT_PUBLIC_*
npm install
npm run dev              # http://localhost:3000
```

Inicia sesión con el usuario creado en Supabase Auth.

## 4. Sembrar datos reales (OpenStreetMap / OpenInfraMap)

El mapa se puebla con datos reales de plantas de energía y subestaciones
de México obtenidos de OpenStreetMap (la misma fuente que usa
[OpenInfraMap](https://openinframap.org/stats/area/Mexico/plants)), vía
Overpass API.

```bash
cd scripts
cp .env.example .env   # completa SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run import-osm
```

Esto inserta ~400+ plantas de energía (`unit_type = energia`) y las
subestaciones con nombre (`unit_type = auxiliar`), todas con
`status = correcto` por defecto. A partir de ahí, todo el mantenimiento
de estatus, altas, bajas y ediciones se hace desde el propio CRM.

> Atribución obligatoria (licencia ODbL): el CRM ya muestra en el pie de
> página "Datos © OpenStreetMap contributors, vía Overpass API /
> OpenInfraMap".

## 5. Despliegue

### Backend en Render

1. Sube este repositorio a GitHub.
2. En Render: **New → Blueprint**, selecciona el repo (usa `render.yaml`
   automáticamente) — o crea un **Web Service** manual con:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
3. Configura las variables de entorno: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN` (déjalo apuntando a
   `http://localhost:3000` temporalmente; lo actualizas cuando tengas la
   URL de Vercel).
4. Copia la URL pública que te da Render (algo como
   `https://crm-anam-backend.onrender.com`).

### Frontend en Vercel

1. En Vercel: **New Project**, importa el repo y selecciona `frontend`
   como *Root Directory*.
2. Configura las variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` (la URL de
   Render del paso anterior).
3. Despliega. Copia la URL de Vercel.
4. Vuelve a Render y actualiza `CORS_ORIGIN` con la URL de Vercel (puedes
   separar varias con coma si usas dominios de preview y producción).

## Funcionalidades

- **Mapa interactivo** (`/mapa`): todas las unidades agrupadas por
  clusters; el color del marcador refleja el estatus (verde = correcto,
  ámbar = mantenimiento programado, rojo = mantenimiento necesario). Al
  pasar el mouse se ve un resumen; al hacer clic se abre la vista
  ampliada con todos los datos, historial y acciones.
- **Vista de lista** (`/unidades`): tabla con búsqueda y filtros por tipo
  y estatus, con badges de color.
- **CRUD completo**: crear (`/unidades/nueva`), editar, cambiar estatus
  (con bitácora automática en `status_history`) y eliminar, tanto desde
  el mapa como desde la lista.
- **Vista de detalle directa** (`/unidades/[id]`): enlace permanente a
  cada unidad.
- **Login** con Supabase Auth — todo el sistema requiere sesión iniciada.

## Identidad gráfica

La paleta y tipografía están inspiradas en el logo oficial de
Hacienda/ANAM (`contenidos/Logos ANAM/`) y en las convenciones típicas de
los sitios gob.mx (limpio, alto contraste, institucional). El portal
snd.gob.mx bloqueó las solicitudes automatizadas (HTTP 403) durante el
desarrollo; si se requiere un match pixel-perfecto con esa guía en
particular, comparte capturas de pantalla para ajustar los estilos en
`frontend/tailwind.config.ts`.
