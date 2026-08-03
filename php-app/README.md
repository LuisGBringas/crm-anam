# CRM ANAM PHP (Laravel + MySQL)

Migración de la plataforma CRM ANAM a stack PHP para despliegue en cPanel.

## Requisitos

- PHP 8.2+
- MySQL 8+
- Composer
- Node.js (solo para compilar assets con Vite)

## Configuración local

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
npm install
npm run build
php artisan serve
```

## Importar datos existentes de Supabase a MySQL

Configura en `.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Luego:

```bash
php artisan app:import-from-supabase --truncate
```

## Funcionalidad migrada

- Login y sesión (Laravel Auth/Breeze)
- Dashboard operativo
- Mapa de unidades (Leaflet)
- CRUD completo de unidades
- CRUD completo de tickets
- Bitácora de estatus para unidades y tickets
- Reportes PDF (lista y detalle) con estilo institucional

## Despliegue cPanel (sin Node runtime)

1. Subir app Laravel al servidor.
2. Publicar el contenido de `public/` en `public_html/`.
3. Ajustar `public_html/index.php` para apuntar al `bootstrap` y `vendor` reales.
4. Configurar `.env` con MySQL del cPanel.
5. Ejecutar migraciones e importación de datos.

> Nota: esta migración elimina la dependencia de Node/Next/Express en runtime.
