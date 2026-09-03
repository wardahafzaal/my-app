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
        Schema::create('merit_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('programme_id')->nullable()->constrained('programmes')->cascadeOnDelete();
            $table->string('criteria_name')->default('Standard Academic Merit');
            $table->decimal('academic_weight_pct', 5, 2)->default(100.00);
            $table->decimal('entry_test_weight_pct', 5, 2)->default(0.00);
            $table->decimal('minimum_eligibility_pct', 5, 2)->default(50.00);
            $table->string('tiebreaker_rule')->default('earlier_submission');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merit_criteria');
    }
};
