<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('ticket_number')->nullable()->index();
            $table->string('origen')->default('manual')->index();
            $table->uuid('unit_id')->nullable()->index();
            $table->string('site_name')->nullable();
            $table->string('area')->nullable();
            $table->string('equipo')->nullable();
            $table->string('numero_serie')->nullable();
            $table->text('problema')->nullable();
            $table->text('ultimo_avance')->nullable();
            $table->string('estatus')->default('abierto')->index();
            $table->date('fecha_apertura')->nullable();
            $table->string('contacto_aduana')->nullable();
            $table->string('contacto_anam')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table
                ->foreign('unit_id')
                ->references('id')
                ->on('units')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
