<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TodoImage extends Model
{
    protected $fillable = ['todo_id', 'path', 'original_name', 'size', 'mime_type'];

    /**
     * Append the public URL as a virtual attribute.
     */
    protected $appends = ['url'];

    /**
     * The todo this image belongs to.
     */
    public function todo(): BelongsTo
    {
        return $this->belongsTo(Todo::class);
    }

    /**
     * Full public URL for the image (uses the 'public' disk / storage symlink).
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
