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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('programme_id')->constrained('programmes')->cascadeOnDelete();
            $table->string('university_name')->default('National Campus');
            $table->timestamp('application_date')->useCurrent();
            $table->string('status')->default('submitted'); // submitted, under review, accepted, rejected
            $table->decimal('merit_score', 5, 2)->nullable();
            $table->integer('merit_rank')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'programme_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
