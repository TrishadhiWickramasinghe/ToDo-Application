'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTodo } from '@/context/TodoContext';
import { todoService } from '@/services/todoService';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { todos } = useTodo();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await todoService.getTodos();
        const allTodos = response.data || response;
        const completedCount = allTodos.filter(
          (t: any) => t.status === 'completed'
        ).length;
        const pendingCount = allTodos.filter(
          (t: any) => t.status === 'pending'
        ).length;

        setStats({
          total: allTodos.length,
          completed: completedCount,
          pending: pendingCount,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
        <p className="text-blue-100">
          You're all set! Let's organize your tasks and boost your productivity.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Todos */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Todos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
          <div className="mt-4 h-1 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Completed Todos */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
          <div className="mt-4 h-1 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Todos */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
          <div className="mt-4 h-1 bg-yellow-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-600"
              style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-gray-600 text-sm mb-4">
          Get started by creating your first todo or manage your existing tasks.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link href="/dashboard/todos/create">
            <Button variant="primary">+ Create Todo</Button>
          </Link>
          <Link href="/dashboard/todos">
            <Button variant="outline">View All Todos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
