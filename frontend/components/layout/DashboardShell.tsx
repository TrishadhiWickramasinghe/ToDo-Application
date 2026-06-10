'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useProtectedRoute } from '@/hooks/useRouteProtection';
import { Loader } from '@/components/common/Loader';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useProtectedRoute();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
