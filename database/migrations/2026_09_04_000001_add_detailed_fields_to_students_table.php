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
        Schema::table('students', function (Blueprint $table) {
            // Step 1: Personal Information
            $table->string('father_name')->nullable()->after('full_name');
            $table->string('gender')->nullable()->after('father_name'); // Male, Female, Other
            $table->string('domicile_province')->nullable()->after('date_of_birth');
            $table->string('domicile_district')->nullable()->after('domicile_province');
            $table->string('nationality')->default('Pakistani')->after('domicile_district');

            // Step 2: Contact Information
            $table->string('alternate_phone')->nullable()->after('phone');
            $table->text('current_address')->nullable()->after('address');
            $table->string('province')->nullable()->after('current_address');
            $table->string('district')->nullable()->after('province');
            $table->string('tehsil')->nullable()->after('district');
            $table->string('city')->nullable()->after('tehsil');
            $table->string('postal_code')->nullable()->after('city');

            // Step 3: Academic Information - Matric/SSC
            $table->string('matric_board')->nullable()->after('qualification');
            $table->string('matric_roll_no')->nullable()->after('matric_board');
            $table->string('matric_reg_no')->nullable()->after('matric_roll_no');
            $table->string('matric_passing_year')->nullable()->after('matric_reg_no');
            $table->decimal('matric_total_marks', 8, 2)->nullable()->after('matric_passing_year');
            $table->decimal('matric_obtained_marks', 8, 2)->nullable()->after('matric_total_marks');
            $table->decimal('matric_percentage', 5, 2)->nullable()->after('matric_obtained_marks');
            $table->string('matric_grade')->nullable()->after('matric_percentage');
            $table->string('matric_status')->default('Pass')->after('matric_grade'); // Pass, Awaiting

            // Step 3: Academic Information - Intermediate/HSSC
            $table->string('inter_board')->nullable()->after('matric_status');
            $table->string('inter_roll_no')->nullable()->after('inter_board');
            $table->string('inter_reg_no')->nullable()->after('inter_roll_no');
            $table->string('inter_passing_year')->nullable()->after('inter_reg_no');
            $table->decimal('inter_total_marks', 8, 2)->nullable()->after('inter_passing_year');
            $table->decimal('inter_obtained_marks', 8, 2)->nullable()->after('inter_total_marks');
            $table->decimal('inter_percentage', 5, 2)->nullable()->after('inter_obtained_marks');
            $table->string('inter_group')->nullable()->after('inter_percentage'); // Pre-Medical, Pre-Engineering, ICS, Arts
            $table->string('inter_status')->default('Pass')->after('inter_group'); // Pass, Awaiting
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'father_name',
                'gender',
                'domicile_province',
                'domicile_district',
                'nationality',
                'alternate_phone',
                'current_address',
                'province',
                'district',
                'tehsil',
                'city',
                'postal_code',
                'matric_board',
                'matric_roll_no',
                'matric_reg_no',
                'matric_passing_year',
                'matric_total_marks',
                'matric_obtained_marks',
                'matric_percentage',
                'matric_grade',
                'matric_status',
                'inter_board',
                'inter_roll_no',
                'inter_reg_no',
                'inter_passing_year',
                'inter_total_marks',
                'inter_obtained_marks',
                'inter_percentage',
                'inter_group',
                'inter_status',
            ]);
        });
    }
};
