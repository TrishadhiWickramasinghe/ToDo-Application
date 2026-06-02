<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use App\Http\Requests\CreateTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use Illuminate\Http\JsonResponse;

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
                'user_id' => $user->id,
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Todo created successfully',
                'data' => [
                    'id' => $todo->id,
                    'title' => $todo->title,
                    'description' => $todo->description,
                    'status' => $todo->status,
                    'user_id' => $todo->user_id,
                    'created_at' => $todo->created_at,
                    'updated_at' => $todo->updated_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create todo',
                'error' => $e->getMessage(),
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

            $todos = Todo::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $todos,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todos',
                'error' => $e->getMessage(),
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

            return response()->json([
                'success' => true,
                'data' => $todo,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch todo',
                'error' => $e->getMessage(),
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

            // Update only provided fields
            if ($request->has('title')) {
                $todo->title = $request->validated('title');
            }
            if ($request->has('description')) {
                $todo->description = $request->validated('description');
            }
            if ($request->has('status')) {
                $todo->status = $request->validated('status');
            }

            $todo->save();

            return response()->json([
                'success' => true,
                'message' => 'Todo updated successfully',
                'data' => $todo,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo',
                'error' => $e->getMessage(),
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

            $todo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Todo deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete todo',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
