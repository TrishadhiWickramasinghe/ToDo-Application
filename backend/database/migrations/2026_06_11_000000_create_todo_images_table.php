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
        Schema::create('todo_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('todo_id')->constrained()->onDelete('cascade');
            $table->string('path');           // storage path, e.g. todo_images/uuid.jpg
            $table->string('original_name');  // original filename from client
            $table->unsignedBigInteger('size')->default(0); // bytes
            $table->string('mime_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todo_images');
    }
};
