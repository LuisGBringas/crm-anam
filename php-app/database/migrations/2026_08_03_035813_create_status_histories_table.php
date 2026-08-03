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
        Schema::create('status_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('unit_id')->index();
            $table->string('previous_status')->nullable();
            $table->string('new_status');
            $table->text('note')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('changed_at')->useCurrent();
            $table->timestamps();

            $table
                ->foreign('unit_id')
                ->references('id')
                ->on('units')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_histories');
    }
};
