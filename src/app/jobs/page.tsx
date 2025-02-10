"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/useAuth"
import { Search, MapPin, Building2, Briefcase, Filter, Plus, Loader2, Trash2, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Types remain the same
interface Job {
  _id: string
  title: string
  description: string
  company: {
    _id: string
    name: string
    company?: {
      name: string
      industry: string
    }
  }
  location: string
  requirements: string[]
  type: string
  experience: {
    min: number
    max: number
  }
  status: string
}

interface FilterState {
  location: string
  type: string
  experience: string
  requirements: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

const filterVariants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    type: "",
    experience: "",
    requirements: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  // const [jobToDelete, setJobToDelete] = useState<string | null>(null)

  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const fetchJobs = useCallback(async () => {
    if (!token) return

    try {
      const queryParams = new URLSearchParams()
      if (filters.location) queryParams.append("location", filters.location)
      if (filters.type) queryParams.append("type", filters.type)
      if (filters.experience) queryParams.append("experience", filters.experience)
      if (filters.requirements) queryParams.append("requirements", filters.requirements)

      const response = await fetch(
        `https://job-portal-backend-82a8.vercel.app/api/job/jobs?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      setJobs(data.data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }, [token, filters])

  useEffect(() => {
    if (token) {
      fetchJobs()
    }
  }, [token, filters, fetchJobs])

  const handleDelete = async (jobId: string) => {
    if (!token || role !== "recruiter") return

    try {
      setSelectedCard(jobId)
      const response = await fetch(`https://job-portal-backend-82a8.vercel.app/api/job/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setJobs(jobs.filter((job) => job._id !== jobId))
      }
    } catch (error) {
      console.error("Error deleting job:", error)
    } finally {
      setSelectedCard(null)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const JobCard = ({ job }: { job: Job }) => (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      className="relative"
    >
      <Card className="hover:shadow-xl transition-all duration-300 bg-white backdrop-blur-sm bg-opacity-90 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <CardTitle className="text-xl font-bold text-gray-900">{job.title}</CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mt-2 text-gray-600"
              >
                <Building2 className="h-4 w-4" />
                <span>{job.company.name}</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge variant={job.type === "full-time" ? "default" : "secondary"} className="animate-pulse">
                {job.type}
              </Badge>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 text-gray-600"
            >
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 text-gray-600"
            >
              <Briefcase className="h-4 w-4" />
              <span>
                {job.experience.min}-{job.experience.max} years
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {job.requirements.slice(0, 3).map((req, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Badge variant="outline" className="hover:bg-blue-50 transition-colors">
                    {req}
                  </Badge>
                </motion.div>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="outline" className="hover:bg-blue-50 transition-colors">
                  +{job.requirements.length - 3} more
                </Badge>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-between items-center mt-4"
            >
              <Button
                onClick={() => router.push(`/jobs/${job._id}`)}
                variant="outline"
                className="hover:scale-105 transition-transform"
              >
                View Details
              </Button>
              {role === "recruiter" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="hover:scale-105 transition-transform"
                      disabled={selectedCard === job._id}
                    >
                      {selectedCard === job._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the job posting for &quot;{job.title}&quot; at {job.company.name}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(job._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  onClick={() => router.push(`/jobs/${job._id}/apply`)}
                  className="hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700"
                >
                  Apply Now
                </Button>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (authLoading || (loading && user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Loader2 className="h-8 w-8 text-blue-600" />
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
      >
        <h1 className="text-4xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Discover Your Next Opportunity
        </h1>
        {role === "recruiter" && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push("/post-job")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"
            >
              <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.experience}
                onValueChange={(value) => setFilters({ ...filters, experience: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0,2">0-2 years</SelectItem>
                  <SelectItem value="2,5">2-5 years</SelectItem>
                  <SelectItem value="5,8">5-8 years</SelectItem>
                  <SelectItem value="8,">8+ years</SelectItem>
                </SelectContent>
              </Select>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() =>
                    setFilters({
                      location: "",
                      type: "",
                      experience: "",
                      requirements: "",
                    })
                  }
                  variant="outline"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredJobs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <Image
            src="/placeholder.svg?height=200&width=200"
            alt="No jobs found"
            width={200}
            height={200}
            className="mx-auto mb-6"
          />
          <h3 className="text-2xl font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Try adjusting your search terms or filters, or check back later for new opportunities.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

