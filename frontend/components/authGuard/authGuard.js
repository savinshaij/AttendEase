'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';

export default function AuthGuard({ children }) {
  const { authToken, loading } = useAuth();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  // ✅ Always call hooks (this runs on first mount only)
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ✅ Also always called
  useEffect(() => {
    if (hasMounted && !authToken && !loading) {
      router.replace('/');
    }
  }, [authToken, loading, router, hasMounted]);

  // ✅ Never conditionally skip hooks
  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  if (!authToken || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking authentication...
      </div>
    );
  }

  return children;
}
