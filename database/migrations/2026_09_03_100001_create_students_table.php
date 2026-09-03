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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('full_name');
            $table->string('cnic_bform')->unique();
            $table->string('email');
            $table->string('phone');
            $table->date('date_of_birth');
            $table->text('address');
            $table->string('previous_institution');
            $table->string('qualification');
            $table->decimal('total_marks', 8, 2);
            $table->decimal('obtained_marks', 8, 2);
            $table->string('marks_grade')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
