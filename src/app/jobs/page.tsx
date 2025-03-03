"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  Filter,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  Globe,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// --------------------------------------------------
// Interfaces
// --------------------------------------------------
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
  country: string
  state: string
  city: string
  requirements: string[]
  type: string
  experience: {
    min: number
    max: number
  }
  status: string
}

interface FilterState {
  country: string
  state: string
  city: string
  type: string
  experienceMin: string
  experienceMax: string
}

interface Country {
  name: {
    common: string
  }
  cca2: string
}

// --------------------------------------------------
// Animation Variants
// --------------------------------------------------
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

const JOB_TYPES = ["full-time", "part-time", "contract", "internship"]

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    state: "",
    city: "",
    type: "",
    experienceMin: "",
    experienceMax: "",
  })

  // Countries API states
  const [countries, setCountries] = useState<Country[]>([])
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [countrySearch, setCountrySearch] = useState("")

  // We derive states/cities from the job data itself
  // but add a small text input for searching them.
  const [stateSearch, setStateSearch] = useState("")
  const [citySearch, setCitySearch] = useState("")

  // Deletion & selection states
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  // Auth
  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  // --------------------------------------------------
  // Effects & Data Fetching
  // --------------------------------------------------

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Fetch all jobs from our backend
  const fetchJobs = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const response = await fetch(
        "https://job-portal-backend-82a8.vercel.app/api/job/jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      setAllJobs(data.data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch countries from REST Countries API
  const fetchCountries = useCallback(async () => {
    try {
      setCountriesLoading(true)
      const response = await fetch("https://restcountries.com/v3.1/all")
      const data = await response.json()
      // Sort countries by name
      const sortedCountries = [...data].sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      )
      setCountries(sortedCountries)
    } catch (error) {
      console.error("Error fetching countries:", error)
    } finally {
      setCountriesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchJobs()
    }
    fetchCountries()
  }, [token, fetchJobs, fetchCountries])

  // --------------------------------------------------
  // Delete Job Handler
  // --------------------------------------------------
  const handleDelete = async (jobId: string) => {
    if (!token || role !== "recruiter") return

    try {
      setSelectedCard(jobId)
      const response = await fetch(
        `https://job-portal-backend-82a8.vercel.app/api/job/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setAllJobs((prev) => prev.filter((job) => job._id !== jobId))
      }
    } catch (error) {
      console.error("Error deleting job:", error)
    } finally {
      setSelectedCard(null)
    }
  }

  // --------------------------------------------------
  // Derive Unique States & Cities from the jobs
  // but only if the user has chosen a country/state
  // --------------------------------------------------
  const uniqueStates = useMemo(() => {
    if (!filters.country) return []
    const states = allJobs
      .filter((job) => job.country === filters.country && job.state)
      .map((job) => job.state)
    return Array.from(new Set(states)).sort()
  }, [allJobs, filters.country])

  const uniqueCities = useMemo(() => {
    if (!filters.state) return []
    const cities = allJobs
      .filter(
        (job) =>
          job.country === filters.country &&
          job.state === filters.state &&
          job.city
      )
      .map((job) => job.city)
    return Array.from(new Set(cities)).sort()
  }, [allJobs, filters.country, filters.state])

  // Filtered arrays for states & cities with "search box" logic
  const filteredStates = useMemo(() => {
    return uniqueStates.filter((st) =>
      st.toLowerCase().includes(stateSearch.toLowerCase())
    )
  }, [uniqueStates, stateSearch])

  const filteredCities = useMemo(() => {
    return uniqueCities.filter((ct) =>
      ct.toLowerCase().includes(citySearch.toLowerCase())
    )
  }, [uniqueCities, citySearch])

  // --------------------------------------------------
  // Filtered Countries
  // --------------------------------------------------
  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.name.common.toLowerCase().includes(countrySearch.toLowerCase())
    )
  }, [countries, countrySearch])

  // --------------------------------------------------
  // Final Filtered Jobs
  // --------------------------------------------------
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.city.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCountry =
        !filters.country || job.country === filters.country
      const matchesState = !filters.state || job.state === filters.state
      const matchesCity = !filters.city || job.city === filters.city

      const matchesType = !filters.type || job.type === filters.type

      const minExp = filters.experienceMin ? parseInt(filters.experienceMin) : -1
      const maxExp = filters.experienceMax
        ? parseInt(filters.experienceMax)
        : Number.MAX_SAFE_INTEGER
      const matchesExperience =
        (minExp === -1 || job.experience.min >= minExp) &&
        (maxExp === Number.MAX_SAFE_INTEGER || job.experience.max <= maxExp)

      return (
        matchesSearch &&
        matchesCountry &&
        matchesState &&
        matchesCity &&
        matchesType &&
        matchesExperience
      )
    })
  }, [allJobs, searchTerm, filters])

  const resetFilters = () => {
    setFilters({
      country: "",
      state: "",
      city: "",
      type: "",
      experienceMin: "",
      experienceMax: "",
    })
    setSearchTerm("")
    setStateSearch("")
    setCitySearch("")
    setCountrySearch("")
  }

  // --------------------------------------------------
  // Card for a single Job
  // --------------------------------------------------
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-xl font-bold text-gray-900">
                  {job.title}
                </CardTitle>
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
              <Badge
                variant={
                  job.type === "full-time" ? "default" : "secondary"
                }
                className="animate-pulse"
              >
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
              className="flex flex-wrap gap-2 text-gray-600"
            >
              <Globe className="h-4 w-4" />
              <span>
                {job.city && job.city}, {job.state && job.state},{" "}
                {job.country && job.country}
              </span>
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
                        This action cannot be undone. This will permanently
                        delete the job posting for &quot;{job.title}&quot; at{" "}
                        {job.company.name}
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

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
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
      {/* ---------------- Page Title + Post New Job Button ---------------- */}
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

      {/* ---------------- Search + Filters Toggle ---------------- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Input
              type="text"
              placeholder="Search jobs, companies, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          {/* Filter Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full md:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>
          </motion.div>
        </div>

        {/* ---------------- Filters Card (AnimatePresence) ---------------- */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              variants={filterVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4"
            >
              <Card className="bg-white bg-opacity-90 p-4 shadow">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-semibold">
                    Refine Your Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Country */}
                    <Select
                      value={filters.country}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          country:
                            value === "all_countries" ? "" : value,
                          state: "",
                          city: "",
                        }))
                      }
                      disabled={countriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            countriesLoading
                              ? "Loading countries..."
                              : "Select Country"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Search box for countries */}
                        {countriesLoading ? (
                          <div className="p-2 flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading countries...
                          </div>
                        ) : (
                          <>
                            <div className="p-2">
                              <Input
                                value={countrySearch}
                                onChange={(e) =>
                                  setCountrySearch(e.target.value)
                                }
                                placeholder="Type to filter..."
                                className="h-8"
                              />
                            </div>
                            <SelectItem value="all_countries">
                              All Countries
                            </SelectItem>
                            {filteredCountries.map((country) => (
                              <SelectItem
                                key={country.cca2}
                                value={country.name.common}
                              >
                                {country.name.common}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    {/* State */}
                    <Select
                      value={filters.state}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          state: value === "all_states" ? "" : value,
                          city: "",
                        }))
                      }
                      disabled={!filters.country} // only enabled if country is chosen
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !filters.country
                              ? "Select Country first"
                              : "Select State"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Search box for states */}
                        {filters.country && (
                          <div className="p-2">
                            <Input
                              value={stateSearch}
                              onChange={(e) =>
                                setStateSearch(e.target.value)
                              }
                              placeholder="Type to filter..."
                              className="h-8"
                            />
                          </div>
                        )}
                        <SelectItem value="all_states">All States</SelectItem>
                        {filteredStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* City */}
                    <Select
                      value={filters.city}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          city: value === "all_cities" ? "" : value,
                        }))
                      }
                      disabled={!filters.state} // only enabled if state is chosen
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !filters.state
                              ? "Select State first"
                              : "Select City"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Search box for cities */}
                        {filters.state && (
                          <div className="p-2">
                            <Input
                              value={citySearch}
                              onChange={(e) =>
                                setCitySearch(e.target.value)
                              }
                              placeholder="Type to filter..."
                              className="h-8"
                            />
                          </div>
                        )}
                        <SelectItem value="all_cities">All Cities</SelectItem>
                        {filteredCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Job Type */}
                    <Select
                      value={filters.type}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          type: value === "all_types" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_types">All Types</SelectItem>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Min Experience */}
                    <Select
                      value={filters.experienceMin}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          experienceMin: value === "any_min" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any_min">Any</SelectItem>
                        <SelectItem value="0">0 years</SelectItem>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="8">8 years</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Max Experience */}
                    <Select
                      value={filters.experienceMax}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          experienceMax: value === "any_max" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Max Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any_max">Any</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="8">8 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="15">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full md:w-auto"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ---------------- Jobs List ---------------- */}
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

      {/* ---------------- No Jobs Found ---------------- */}
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
          <h3 className="text-2xl font-medium text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Try adjusting your search terms or filters, or check back later
            for new opportunities.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}