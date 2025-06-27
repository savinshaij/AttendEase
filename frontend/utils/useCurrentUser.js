'use client';
import { useEffect, useState } from 'react';
import api from './axios'; // Make sure you have an Axios instance

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error('Error loading user:', err))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
