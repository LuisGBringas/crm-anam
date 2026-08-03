<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'CRM ANAM') }}</title>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased">
        <div class="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
            <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
                <div class="mb-6 flex flex-col items-center gap-3 text-center">
                    <img src="{{ asset('logo-anam.png') }}" alt="ANAM" class="h-12 w-auto">
                    <div>
                        <h1 class="text-lg font-semibold text-[#611232]">Sistema de Gestión de Unidades de Energía</h1>
                        <p class="text-sm text-slate-500">Agencia Nacional de Aduanas de México</p>
                    </div>
                </div>
                {{ $slot }}
            </div>
        </div>
    </body>
</html>
