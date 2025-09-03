'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface AdminData {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useUserAdmin(): AdminData {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isLoaded || !user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/admin-status');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, isLoaded]);

  return {
    isAdmin,
    isLoading,
  };
}
