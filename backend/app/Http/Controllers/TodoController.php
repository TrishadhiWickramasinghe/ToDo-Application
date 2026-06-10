<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use App\Models\TodoImage;
use App\Http\Requests\CreateTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TodoController extends Controller
{
    /**
     * Create a new todo
     * POST /api/todos
     *
     * @param CreateTodoRequest $request
     * @return JsonResponse
     */
    public function store(CreateTodoRequest $request): JsonResponse
    {
        Log::info($request->all());
        try {
            // Get authenticated user
            $user = auth('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Create new todo
            $todo = Todo::create([
                'user_id'         => $user->id,
                'title'           => $request->validated('title'),
                'description'     => $request->validated('description'),
                'status'          => 'pending',
                'start_date_time' => $request->validated('startDateTime'),
            ]);

            // ── Handle image uploads ──────────────────────────────────────────
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    // Store in storage/app/public/todo_images/<uuid>.<ext>
                    $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                    $path     = $file->storeAs('todo_images', $filename, 'public');

                    $todo->images()->create([
                        'path'          => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'size'          => $file->getSize(),
                        'mime_type'     => $file->getMimeType(),
                    ]);
                }
            }

            // Reload images so they appear in the response
            $todo->load('images');

            return response()->json([
                'success' => true,
                'message' => 'Todo created successfully',
                'data'    => $todo,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create todo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all todos for authenticated user
     * GET /api/todos
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                ], 401);
            }

            // Eager-load images so the list returns image URLs too
            $todos = Todo::where('user_id', $user->id)
                ->with('images')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $todos,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todos',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single todo
     * GET /api/todos/{id}
     *
     * @param Todo $todo
     * @return JsonResponse
     */
    public function show(Todo $todo): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();

            if (!$user || $todo->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $todo->load('images');

            return response()->json([
                'success' => true,
                'data'    => $todo,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a todo
     * PUT /api/todos/{id}
     *
     * @param UpdateTodoRequest $request
     * @param Todo $todo
     * @return JsonResponse
     */
    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();

            if (!$user || $todo->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            if ($request->has('title')) {
                $todo->title = $request->validated('title');
            }
            if ($request->has('description')) {
                $todo->description = $request->validated('description');
            }
            if ($request->has('status')) {
                $todo->status = $request->validated('status');
            }
            if ($request->has('startDateTime')) {
                $todo->start_date_time = $request->validated('startDateTime');
            }

            $todo->save();
            $todo->load('images');

            return response()->json([
                'success' => true,
                'message' => 'Todo updated successfully',
                'data'    => $todo,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a todo
     * DELETE /api/todos/{id}
     *
     * @param Todo $todo
     * @return JsonResponse
     */
    public function destroy(Todo $todo): JsonResponse
    {
        try {
            $user = auth('sanctum')->user();

            if (!$user || $todo->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            // Delete image files from disk before removing the record
            foreach ($todo->images as $image) {
                Storage::disk('public')->delete($image->path);
            }

            $todo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Todo deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete todo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
