import { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
  isRecruiter?: boolean;
  onDelete?: (id: string) => void;
}

export default function JobCard({ job, isRecruiter, onDelete }: JobCardProps) {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{job.title}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
          {isRecruiter && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(job._id)}
            >
              Delete
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {job.type}
            </div>
          </div>

          <p className="text-gray-600 line-clamp-3">{job.description}</p>

          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 3).map((req, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className="text-gray-600 text-xs">+{job.requirements.length - 3} more</span>
            )}
          </div>

          <Link href={`/jobs/${job._id}`}>
            <Button variant="outline" className="w-full mt-4">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}