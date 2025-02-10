"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  GraduationCap,
  Code,
  Briefcase,
  MapPin,
  Globe,
  Factory,
  Loader2,
  Mail,
  Calendar,
  ArrowUpRight,
  AlertCircle
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Types remain the same as your original code
interface Education {
  collegeName?: string
  schoolName?: string
  degree: string
  graduationYear: string
}

interface Experience {
  position: string
  company: string
  duration: number
  description: string
}

interface Company {
  name: string
  address: string
  website: string
  industry: string
  description: string
}

interface Profile {
  address: string
  education: Education[]
  skills: string[]
  experience: Experience[]
}

interface ProfileData {
  role: string
  name: string
  email: string
  company?: Company
  profile?: Profile
  profileImage?: string
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const childVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ProfileView() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [completionDetails, setCompletionDetails] = useState<string[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("https://job-portal-backend-82a8.vercel.app/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = await response.json()
        if (result.success) {
          setProfileData(result.data)
          calculateProfileCompletion(result.data)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchProfile()
    }
  }, [token])

  const calculateProfileCompletion = (data: ProfileData) => {
    const missingFields: string[] = []
    let completedFields = 0
    let totalFields = 0

    // Common fields for both roles
    const commonFields = [
      { field: data.name, name: "Name" },
      { field: data.email, name: "Email" },
      { field: data.profileImage, name: "Profile Image" },
    ]

    totalFields += commonFields.length
    commonFields.forEach(({ field, name }) => {
      if (field) completedFields++
      else missingFields.push(name)
    })

    if (data.role === "recruiter") {
      // Recruiter-specific fields
      const companyFields = [
        { field: data.company?.name, name: "Company Name" },
        { field: data.company?.description, name: "Company Description" },
        { field: data.company?.address, name: "Company Address" },
        { field: data.company?.website, name: "Company Website" },
        { field: data.company?.industry, name: "Company Industry" },
      ]

      totalFields += companyFields.length
      companyFields.forEach(({ field, name }) => {
        if (field) completedFields++
        else missingFields.push(name)
      })
    } else {
      // User-specific fields
      const userFields = [
        { field: data.profile?.address, name: "Address" },
        { field: data.profile?.education?.length, name: "Education Details" },
        { field: data.profile?.skills?.length, name: "Skills" },
        { field: data.profile?.experience?.length, name: "Experience Details" },
      ]

      totalFields += userFields.length
      userFields.forEach(({ field, name }) => {
        if (field) completedFields++
        else missingFields.push(name)
      })
    }

    setCompletionDetails(missingFields)
    setProfileCompletion((completedFields / totalFields) * 100)
  }

  if (loading) {
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
          <Loader2 className="h-12 w-12 text-blue-600" />
        </motion.div>
      </div>
    )
  }

  const isRecruiter = profileData?.role === "recruiter"

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div {...fadeIn} className="space-y-8">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-black opacity-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {profileData?.profileImage ? (
                <Image
                  src={profileData.profileImage}
                  alt={`${profileData.name}'s Profile`}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold shadow-lg">
                  {profileData?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </motion.div>
            <div className="text-center md:text-left">
              <motion.h1
                className="text-3xl md:text-4xl font-bold mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {profileData?.name}
              </motion.h1>
              <motion.p
                className="text-lg opacity-90 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isRecruiter ? "Recruiter" : "Job Seeker"}
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span>{profileData?.email}</span>
                </div>
                {!isRecruiter && profileData?.profile?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{profileData.profile.address}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={profileCompletion} className="h-2" />
              <p className="text-sm text-gray-600">
                Your profile is {profileCompletion.toFixed(0)}% complete
              </p>
              {completionDetails.length > 0 && (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Complete these fields to improve your profile:
                    <ul className="mt-2 list-disc list-inside">
                      {completionDetails.map((field, index) => (
                        <li key={index} className="text-sm text-gray-600">{field}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <AnimatePresence>
          <motion.div className="grid gap-6" variants={staggerChildren} initial="hidden" animate="show">
            {isRecruiter ? (
              // Recruiter Profile Details
              <motion.div variants={childVariant}>
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Building2 className="h-6 w-6" />
                      Company Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{profileData?.company?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span>{profileData?.company?.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <a
                          href={profileData?.company?.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          {profileData?.company?.website}
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Factory className="h-5 w-5 text-blue-600" />
                        <span>{profileData?.company?.industry}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-700">{profileData?.company?.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              // Job Seeker Profile Details
              <>
                {/* Education */}
                <motion.div variants={childVariant}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <GraduationCap className="h-6 w-6" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {profileData?.profile?.education?.map((edu, index) => (
                        <motion.div
                          key={index}
                          className="border-b last:border-0 pb-4 last:pb-0"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h3 className="font-medium text-lg text-blue-700">{edu.collegeName || edu.schoolName}</h3>
                          <p className="text-gray-700">{edu.degree}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Graduated: {edu.graduationYear}
                          </p>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Skills */}
                <motion.div variants={childVariant}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Code className="h-6 w-6" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-2">
                        {profileData?.profile?.skills?.map((skill, index) => (
                          <motion.span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Experience */}
                <motion.div variants={childVariant}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Briefcase className="h-6 w-6" />
                        Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {profileData?.profile?.experience?.map((exp, index) => (
                        <motion.div
                          key={index}
                          className="border-b last:border-0 pb-6 last:pb-0"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h3 className="font-medium text-lg text-blue-700">{exp.position}</h3>
                          <p className="text-gray-700">{exp.company}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Duration: {exp.duration} {exp.duration === 1 ? "year" : "years"}
                          </p>
                          <p className="text-gray-600 mt-2">{exp.description}</p>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Edit Profile Button */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => router.push("/profile/edit")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Edit Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

