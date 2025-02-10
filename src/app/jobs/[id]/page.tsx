'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Building2, Clock, Briefcase, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: {
    _id: string;
    name: string;
    company?: {
      name: string;
      description: string;
      website: string;
    }
  };
  location: string;
  requirements: string[];
  type: string;
  experience: {
    min: number;
    max: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function JobDetailsPage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token, loading: authLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `https://job-portal-backend-82a8.vercel.app/api/job/jobs/${resolvedParams.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setJob(data.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchJobDetails();
    }
  }, [token, resolvedParams.id]);

  if (authLoading || (loading && user)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (!job) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </motion.button>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-start"
          >
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {job.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{job.company.name}</span>
              </div>
            </div>
            <Badge variant={job.type === 'full-time' ? 'default' : 'secondary'}>
              {job.type}
            </Badge>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>{job.experience.min}-{job.experience.max} years</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((req, index) => (
                <Badge key={index} variant="outline">
                  {req}
                </Badge>
              ))}
            </div>
          </motion.div>

          {job.company.company && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Company</h3>
              <p className="text-gray-600">{job.company.company.description}</p>
              {job.company.company.website && (
                <a
                  href={job.company.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  Visit Website
                </a>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-end gap-4 mt-8"
          >
            {role === 'user' ? (
              <Button
                onClick={() => router.push(`/jobs/${job._id}/apply`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            ) : (
              <Button
                onClick={() => router.push(`/jobs/${job._id}/edit`)}
                variant="outline"
              >
                Edit Job
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}