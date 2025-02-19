"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import {
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Clock,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react"

interface Job {
  _id: string
  title: string
  description: string
  company: {
    _id: string
    name: string
    logo?: string
    company?: {
      name: string
      industry: string
      description: string
      website?: string
    }
  }
  location: string
  requirements: string[]
  responsibilities?: string[]
  type: string
  experience?: {
    min: number
    max: number
  }
  salary?: {
    min: number
    max: number
  }
  postedDate?: string
  applicationDeadline?: string
  numberOfOpenings?: number
  status: string
  createdAt: string
  updatedAt: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

interface InfoCardProps {
  icon: LucideIcon
  title: string
  value: string
}

interface InfoBadgeProps {
  icon: LucideIcon
  label: string
  value: string
  variant?: "default" | "success" | "error"
}

export default function JobDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const fetchJob = async () => {
      if (!token) return

      try {
        const response = await fetch(
          `https://job-portal-backend-82a8.vercel.app/api/job/jobs/${resolvedParams.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await response.json()
        if (data.success) {
          setJob(data.data)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchJob()
    }
  }, [token, resolvedParams.id])

  if (authLoading || (loading && user)) {
    return <JobDetailSkeleton />
  }

  if (!user) return null
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-800">Job not found</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="bg-white shadow-lg rounded-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <motion.h1 className="text-3xl font-bold mb-2" variants={fadeInUp}>
            {job.title}
          </motion.h1>
          <motion.div className="flex items-center space-x-4" variants={fadeInUp}>
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              <span>{job.company.name}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{job.location}</span>
            </div>
          </motion.div>
        </div>

        <div className="p-6 space-y-6">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={fadeInUp}>
            <InfoCard icon={Briefcase} title="Job Type" value={job.type} />
            {job.experience && (
              <InfoCard
                icon={GraduationCap}
                title="Experience"
                value={`${job.experience.min}-${job.experience.max} years`}
              />
            )}
            {job.salary && (
              <InfoCard
                icon={DollarSign}
                title="Salary"
                value={`$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`}
              />
            )}
            {job.numberOfOpenings && (
              <InfoCard icon={Users} title="Openings" value={job.numberOfOpenings.toString()} />
            )}
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h2 className="text-xl font-semibold mb-2">Job Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
          </motion.div>

          {job.requirements && job.requirements.length > 0 && (
            <motion.div variants={fadeInUp}>
              <h2 className="text-xl font-semibold mb-2">Requirements</h2>
              <ul className="list-disc pl-5 space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index} className="text-gray-600">
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <motion.div variants={fadeInUp}>
              <h2 className="text-xl font-semibold mb-2">Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-1">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="text-gray-600">
                    {resp}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {job.company.company && (
            <motion.div variants={fadeInUp}>
              <h2 className="text-xl font-semibold mb-2">About the Company</h2>
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

          <motion.div className="flex flex-wrap gap-4" variants={fadeInUp}>
            <InfoBadge 
              icon={Calendar} 
              label="Posted on" 
              value={new Date(job.createdAt).toLocaleDateString()} 
            />
            {job.applicationDeadline && (
              <InfoBadge
                icon={Clock}
                label="Application Deadline"
                value={new Date(job.applicationDeadline).toLocaleDateString()}
              />
            )}
            <InfoBadge
              icon={job.status === "open" ? CheckCircle2 : XCircle}
              label="Status"
              value={job.status}
              variant={job.status === "open" ? "success" : "error"}
            />
          </motion.div>
        </div>

        <motion.div className="p-6 bg-gray-50 flex justify-between items-center" variants={fadeInUp}>
          <Button
            onClick={() => router.push("/jobs")}
            variant="outline"
            className="hover:bg-gray-200 transition-colors"
          >
            Back to Jobs
          </Button>
          {role === "user" ? (
            <Button
              onClick={() => router.push(`/jobs/${job._id}/apply`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105"
            >
              Apply Now
            </Button>
          ) : role === "employer" && (
            <Button
              onClick={() => router.push(`/jobs/${job._id}/edit`)}
              variant="outline"
              className="hover:bg-gray-200 transition-colors"
            >
              Edit Job
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

const InfoCard = ({ icon: Icon, title, value }: InfoCardProps) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center mb-2">
      <Icon className="h-5 w-5 text-blue-500 mr-2" />
      <h3 className="font-semibold text-gray-700">{title}</h3>
    </div>
    <p className="text-gray-600">{value}</p>
  </div>
)

const InfoBadge = ({
  icon: Icon,
  label,
  value,
  variant = "default",
}: InfoBadgeProps) => (
  <Badge
    variant="outline"
    className={`flex items-center space-x-1 px-3 py-1 ${
      variant === "success"
        ? "bg-green-100 text-green-800 border-green-300"
        : variant === "error"
        ? "bg-red-100 text-red-800 border-red-300"
        : "bg-blue-100 text-blue-800 border-blue-300"
    }`}
  >
    <Icon className="h-4 w-4" />
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </Badge>
)

const JobDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-1/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
        <div className="flex flex-wrap gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-32" />
          ))}
        </div>
      </div>
      <div className="p-6 bg-gray-50 flex justify-between items-center">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  </div>
)