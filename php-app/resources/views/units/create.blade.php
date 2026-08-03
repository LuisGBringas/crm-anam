<x-app-layout>
    <x-slot name="header">
        <h1 class="text-xl font-semibold text-[#611232]">Nueva unidad</h1>
    </x-slot>

    <div class="rounded-md border border-slate-200 bg-white p-6">
        @if ($errors->any())
            <div class="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {{ $errors->first() }}
            </div>
        @endif
        <form method="POST" action="{{ route('unidades.store') }}">
            @include('units._form', ['submitLabel' => 'Crear unidad'])
        </form>
    </div>
</x-app-layout>
