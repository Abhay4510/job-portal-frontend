import { useState, useEffect } from 'react';
import { Job } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/jobs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          setJobs(data.jobs);
        } else {
          setError(data.message);
        }
      } catch {
        setError('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  return { jobs, loading, error };
}