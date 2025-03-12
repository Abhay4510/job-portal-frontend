"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { ArrowLeft, FileText, Calendar, Eye } from 'lucide-react'
import { use } from 'react'

interface Applicant {
  _id: string
  job: string
  applicant: {
    _id: string
    name: string
    email: string
    profileImage?: string
    profile?: {
      address?: string
      education?: Array<{
        collegeName?: string
        schoolName?: string
        degree: string
        graduationYear: string | number
        _id: string
      }>
      skills?: string[]
      experience?: Array<{
        company: string
        position: string
        duration: string | number
        description: string
        _id: string
      }>
    }
  }
  resume: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  updatedAt: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// const fadeInUp = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0 },
//   transition: { duration: 0.5 }
// }

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function ApplicantsPage({ params }: PageProps) {
  const unwrappedParams = use(params) // Unwrap the params Promise
  const jobId = unwrappedParams.id // Now access the id property

  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || role !== "recruiter")) {
      router.push("/login")
    }
  }, [authLoading, user, role, router])

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!token) return

      try {
        const response = await fetch(
          `https://job-portal-backend-82a8.vercel.app/api/application/applications/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await response.json()
        if (data.success) {
          setApplicants(data.data || [])
        }
      } catch (error) {
        console.error("Error fetching applicants:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchApplicants()
    }
  }, [token, jobId])

  if (authLoading || (loading && user)) {
    return <ApplicantsPageSkeleton />
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Job Details
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Job Applicants
        </h1>

        {applicants.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-8 text-center"
          >
            <Image
              src="/placeholder.svg?height=120&width=120"
              alt="No applicants"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Applicants Yet</h2>
            <p className="text-gray-600">
              There are no applications for this job posting yet. Check back later.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {applicants.map((applicant) => (
              <motion.div key={applicant._id} variants={itemVariant}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3">
                          {applicant.applicant.profileImage ? (
                            <Image
                              src={applicant.applicant.profileImage || "/placeholder.svg"}
                              alt={applicant.applicant.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                              {applicant.applicant.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-center">{applicant.applicant.name}</h3>
                        <p className="text-gray-600 text-sm text-center mb-4">{applicant.applicant.email}</p>
                        {/* Status badge removed as requested */}
                      </div>

                      <div className="p-6 md:w-3/4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                Applied on: Applied on: {new Date(applicant.createdAt).toLocaleDateString('en-GB', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric'
                                                        })}
                              </span>
                            </div>
                            {applicant.applicant.profile?.skills && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {applicant.applicant.profile.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="bg-blue-50">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => window.open(applicant.resume, "_blank")}
                            >
                              <FileText className="h-4 w-4" />
                              View Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => router.push(`/applicants/${applicant.applicant._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                              View Profile
                            </Button>
                          </div>
                        </div>

                        {applicant.applicant.profile?.experience && applicant.applicant.profile.experience.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-800 mb-2">Experience</h4>
                            <div className="space-y-2">
                              {applicant.applicant.profile.experience.slice(0, 1).map((exp) => (
                                <div key={exp._id} className="text-sm text-gray-600">
                                  <div className="font-medium">{exp.position} at {exp.company}</div>
                                  <div>{exp.duration} {Number(exp.duration) === 1 ? 'year' : 'years'}</div>
                                </div>
                              ))}
                              {applicant.applicant.profile.experience.length > 1 && (
                                <div className="text-sm text-blue-600">
                                  +{applicant.applicant.profile.experience.length - 1} more experiences
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Accept and Reject buttons removed as requested */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

const ApplicantsPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-5xl">
    <div className="h-10 w-32 mb-6" />
    <div className="h-10 w-64 mb-6" />
    
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
              <Skeleton className="w-20 h-20 rounded-full mb-3" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40 mb-4" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="p-6 md:w-3/4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
              <Skeleton className="h-4 w-40 mt-4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="mt-6 flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)