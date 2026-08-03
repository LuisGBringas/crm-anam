<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'CRM ANAM') }}</title>

        <!-- Fonts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    </head>
    <body class="font-sans antialiased bg-neutral-50 text-slate-800">
        <div class="min-h-screen flex flex-col">
            <header class="border-b border-slate-200 bg-white">
                <div class="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3">
                    <div class="flex items-center gap-3">
                        <img src="{{ asset('logo-anam.png') }}" alt="ANAM" class="h-9 w-auto">
                        <div class="border-l border-slate-200 pl-3">
                            <p class="text-sm font-semibold text-[#611232]">Sistema de Gestión de Unidades de Energía</p>
                            <p class="text-xs text-slate-500">Agencia Nacional de Aduanas de México</p>
                        </div>
                    </div>
                    @auth
                    <div class="flex items-center gap-3">
                        <span class="hidden text-xs text-slate-500 sm:block">{{ auth()->user()->email }}</span>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button class="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#611232] hover:text-[#611232]">Cerrar sesión</button>
                        </form>
                    </div>
                    @endauth
                </div>
            </header>

            @auth
            <nav class="border-b border-slate-200 bg-white">
                <div class="mx-auto flex w-full max-w-[1200px] flex-wrap gap-2 px-4 py-2 text-sm">
                    <a class="rounded px-2 py-1 {{ request()->routeIs('dashboard') ? 'bg-[#611232] text-white' : 'text-slate-700 hover:bg-slate-100' }}" href="{{ route('dashboard') }}">Dashboard</a>
                    <a class="rounded px-2 py-1 {{ request()->routeIs('map') ? 'bg-[#611232] text-white' : 'text-slate-700 hover:bg-slate-100' }}" href="{{ route('map') }}">Mapa</a>
                    <a class="rounded px-2 py-1 {{ request()->routeIs('unidades.*') ? 'bg-[#611232] text-white' : 'text-slate-700 hover:bg-slate-100' }}" href="{{ route('unidades.index') }}">Unidades</a>
                    <a class="rounded px-2 py-1 {{ request()->routeIs('tickets.*') ? 'bg-[#611232] text-white' : 'text-slate-700 hover:bg-slate-100' }}" href="{{ route('tickets.index') }}">Tickets</a>
                </div>
            </nav>
            @endauth

            @isset($header)
                <header class="mx-auto w-full max-w-[1200px] px-4 py-4">
                    {{ $header }}
                </header>
            @endisset

            <main class="mx-auto w-full max-w-[1200px] flex-1 px-4 py-5">
                @if (session('success'))
                    <div class="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {{ session('success') }}
                    </div>
                @endif
                {{ $slot }}
            </main>
        </div>
    </body>
</html>
