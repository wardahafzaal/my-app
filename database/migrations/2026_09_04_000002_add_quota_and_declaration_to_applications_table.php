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
        Schema::table('applications', function (Blueprint $table) {
            $table->string('quota')->default('General Merit')->after('status');
            $table->boolean('declaration_accepted')->default(false)->after('quota');
            $table->timestamp('submitted_at')->nullable()->after('declaration_accepted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'quota',
                'declaration_accepted',
                'submitted_at',
            ]);
        });
    }
};
