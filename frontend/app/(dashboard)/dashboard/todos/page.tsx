'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { TodoCard } from '@/components/todo/TodoCard';
import { EditTodoModal } from '@/components/todo/EditTodoModal';
import { DeleteConfirmModal } from '@/components/todo/DeleteConfirmModal';
import { todoService, Todo } from '@/services/todoService';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterValue = 'all' | 'pending' | 'completed';
type SortValue   = 'date' | 'title';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TodosPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [todos,       setTodos]       = useState<Todo[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter,      setFilter]      = useState<FilterValue>('all');
  const [sortBy,      setSortBy]      = useState<SortValue>('date');

  // Edit modal
  const [editTodo,       setEditTodo]       = useState<Todo | null>(null);
  const [isEditOpen,     setIsEditOpen]     = useState(false);
  const [isEditLoading,  setIsEditLoading]  = useState(false);

  // Delete modal
  const [deleteTodoId,     setDeleteTodoId]     = useState<number | null>(null);
  const [isDeleteOpen,     setIsDeleteOpen]     = useState(false);
  const [isDeleteLoading,  setIsDeleteLoading]  = useState(false);

  // Per-card toggle loading (keyed by todo id)
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // ── Fetch todos from backend ───────────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await todoService.getTodos();
      setTodos(data);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const msg = error.response?.data?.message ?? 'Failed to load todos.';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ── Derived: filter + search + sort (client-side, instant) ────────────────
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (filter !== 'all') {
      result = result.filter((t) => t.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'date') {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [todos, filter, searchQuery, sortBy]);

  // ── Stats (always from full list, not filtered) ────────────────────────────
  const stats = useMemo(() => ({
    total:     todos.length,
    completed: todos.filter((t) => t.status === 'completed').length,
    pending:   todos.filter((t) => t.status === 'pending').length,
  }), [todos]);

  // ── Toggle status ──────────────────────────────────────────────────────────
  const handleToggleStatus = useCallback(
    async (id: number, newStatus: 'pending' | 'completed') => {
      setTogglingIds((prev) => new Set(prev).add(id));
      try {
        const updated = await todoService.updateStatus(id, newStatus);
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast.success(
          newStatus === 'completed' ? 'Marked as completed! ✅' : 'Marked as pending ⏳'
        );
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        toast.error(error.response?.data?.message ?? 'Failed to update status.');
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    []
  );

  // ── Open edit modal ────────────────────────────────────────────────────────
  const handleOpenEdit = useCallback((todo: Todo) => {
    setEditTodo(todo);
    setIsEditOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditOpen(false);
    setEditTodo(null);
  }, []);

  // ── Submit edit ────────────────────────────────────────────────────────────
  const handleEditSubmit = useCallback(
    async (id: number, title: string, description: string) => {
      setIsEditLoading(true);
      try {
        const updated = await todoService.updateTodo(id, { title, description });
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toast.success('Todo updated! ✏️');
        handleCloseEdit();
      } catch (err) {
        const error = err as AxiosError<{
          message?: string;
          errors?: Record<string, string[]>;
        }>;
        if (error.response?.status === 422 && error.response.data?.errors) {
          // Surface the first validation message so the modal can display it
          const firstMsg = Object.values(error.response.data.errors)[0]?.[0];
          toast.error(firstMsg ?? 'Validation error.');
        } else {
          toast.error(error.response?.data?.message ?? 'Failed to update todo.');
        }
        // Re-throw so EditTodoModal can keep itself open
        throw err;
      } finally {
        setIsEditLoading(false);
      }
    },
    [handleCloseEdit]
  );

  // ── Open delete modal ──────────────────────────────────────────────────────
  const handleOpenDelete = useCallback((id: number) => {
    setDeleteTodoId(id);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDeleteTodoId(null);
  }, []);

  // ── Confirm delete ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTodoId === null) return;
    setIsDeleteLoading(true);
    try {
      await todoService.deleteTodo(deleteTodoId);
      setTodos((prev) => prev.filter((t) => t.id !== deleteTodoId));
      toast.success('Todo deleted! 🗑️');
      handleCloseDelete();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(error.response?.data?.message ?? 'Failed to delete todo.');
    } finally {
      setIsDeleteLoading(false);
    }
  }, [deleteTodoId, handleCloseDelete]);

  // ── Loading / error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-5xl">⚠️</p>
        <h2 className="text-xl font-semibold text-gray-800">Could not load todos</h2>
        <p className="text-gray-500 text-sm max-w-sm">{fetchError}</p>
        <Button variant="primary" onClick={fetchTodos}>
          Try again
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">📋 My Todos</h1>
            <p className="text-blue-100">
              Manage all your tasks efficiently and stay productive
            </p>
          </div>
          <Link href="/dashboard/todos/create">
            <Button
              variant="secondary"
              size="lg"
              className="bg-blue text-blue-600 hover:bg-dark-100"
            >
              ✨ Create Todo
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium">Total Todos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-2">All tasks combined</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
          <p className="text-gray-600 text-sm font-medium">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-2">Waiting to be completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
          <p className="text-xs text-gray-400 mt-2">
            {stats.total > 0
              ? Math.round((stats.completed / stats.total) * 100)
              : 0}
            % completion rate
          </p>
        </div>
      </div>

      {/* ── Search & filter controls ── */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Todos
          </label>
          <Input
            type="search"
            placeholder="Search by title or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    filter === f
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all'       && '📋 All'}
                  {f === 'pending'   && '⏳ Pending'}
                  {f === 'completed' && '✅ Completed'}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortValue)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="date">📅 Newest First</option>
              <option value="title">🔤 Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Todo list ── */}
      {filteredTodos.length === 0 ? (
        <EmptyState
          icon="📝"
          title={searchQuery || filter !== 'all' ? 'No results found' : 'No todos yet'}
          description={
            searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Create your first todo to get started and stay organised!'
          }
          action={
            !searchQuery && filter === 'all'
              ? {
                  label: '✨ Create Your First Todo',
                  onClick: () => {
                    window.location.href = '/dashboard/todos/create';
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Showing {filteredTodos.length} of {todos.length} todo
            {todos.length !== 1 ? 's' : ''}
          </p>

          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleStatus={handleToggleStatus}
              isLoading={togglingIds.has(todo.id)}
            />
          ))}
        </div>
      )}

      {/* ── Bottom CTA ── */}
      {filteredTodos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Ready to add more tasks?</p>
          <Link href="/dashboard/todos/create">
            <Button variant="primary">+ Create New Todo</Button>
          </Link>
        </div>
      )}

      {/* ── Edit modal ── */}
      <EditTodoModal
        isOpen={isEditOpen}
        todo={editTodo}
        onClose={handleCloseEdit}
        onSubmit={handleEditSubmit}
        isLoading={isEditLoading}
      />

      {/* ── Delete confirm modal ── */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
