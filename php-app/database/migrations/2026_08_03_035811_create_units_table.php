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
        Schema::create('units', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('unit_type');
            $table->string('category')->nullable();
            $table->string('operator')->nullable();
            $table->decimal('capacity_mw', 12, 3)->nullable();
            $table->string('status')->default('correcto');
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->text('address')->nullable();
            $table->string('state')->nullable();
            $table->string('source')->default('manual');
            $table->string('external_ref')->nullable()->unique();
            $table->text('notes')->nullable();
            $table->string('vpn_code')->nullable();
            $table->string('site_name')->nullable();
            $table->string('hostname')->nullable();
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->string('numero_serie')->nullable();
            $table->string('capacity_label')->nullable();
            $table->string('rack_location')->nullable();
            $table->string('iniciativa')->nullable();
            $table->string('responsable_administracion')->nullable();
            $table->string('criticidad')->nullable();
            $table->string('es_virtual')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('unit_type');
            $table->index('site_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
