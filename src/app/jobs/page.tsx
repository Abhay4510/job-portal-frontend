"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import JobCard from '@/components/JobCard';
import { Job } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Auth context
  const { user, token, loading: authLoading, role } = useAuth();

  const router = useRouter();

  // If not logged in and done loading, redirect to /login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      // Only fetch jobs if user is logged in
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        'https://job-portal-backend-82a8.vercel.app/api/job/jobs'
      );
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    // Optional: only recruiters can delete, or handle as needed
    if (!token) return;

    try {
      // Example endpoint: /api/job/jobs/:jobId
      const response = await fetch(
        `https://job-portal-backend-82a8.vercel.app/api/job/jobs/${jobId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== jobId));
      } else {
        console.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // While auth context is still loading or we haven't fetched jobs, show spinner
  if (authLoading || (loading && user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is not logged in, we might have triggered a redirect. 
  // This is a safeguard in case there's a flicker or direct visit.
  if (!user) {
    return null; // or some fallback UI
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
        <div className="relative w-full md:w-96">
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            // We can pass isRecruiter if needed:
            isRecruiter={role === 'recruiter'}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search terms or check back later for new
            opportunities.
          </p>
        </div>
      )}
    </div>
  );
}