'use client';

import { usePublicRoute } from '@/hooks/useRouteProtection';
import { Loader } from '@/components/common/Loader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePublicRoute();

  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
}
