"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Calendar,
  Loader2
} from 'lucide-react'
import { use } from "react"

interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
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
  transition: { duration: 0.5 }
}

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

export default function ApplicantProfilePage({ params }: PageProps) {
  // Unwrap the params object using React.use()
  const resolvedParams = use(params)
  const userId = resolvedParams.id
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || role !== "recruiter")) {
      router.push("/login")
    }
  }, [authLoading, user, role, router])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return

      try {
        setLoading(true)
        const response = await fetch(
          `https://job-portal-backend-82a8.vercel.app/api/application/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
        }
      } catch (error) {
        console.error("Error fetching applicant profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (token && userId) {
      fetchProfile()
    }
  }, [token, userId])

  if (authLoading || (loading && user)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
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
      </div>
    )
  }

  if (!user) return null
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applicants
        </motion.button>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Profile not found</h1>
          <p className="text-red-600">The applicant profile you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to view it.</p>
        </div>
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
        Back to Applicants
      </motion.button>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.name}
                  width={120}
                  height={120}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold shadow-lg">
                  {profile.name[0].toUpperCase()}
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
                {profile.name}
              </motion.h1>
              <motion.p
                className="text-lg opacity-90 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Job Seeker
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center md:justify-start gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span>{profile.email}</span>
                </div>
                {profile.profile?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{profile.profile.address}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6"
        >
          {/* Skills */}
          {profile.profile?.skills && profile.profile.skills.length > 0 && (
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Code className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {profile.profile.skills.map((skill, index) => (
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
          )}

          {/* Education */}
          {profile.profile?.education && profile.profile.education.length > 0 && (
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {profile.profile.education.map((edu, index) => (
                    <motion.div
                      key={edu._id}
                      className="border-b last:border-0 pb-4 last:pb-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="font-medium text-lg text-blue-700">
                        {edu.collegeName || edu.schoolName}
                      </h3>
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
          )}

          {/* Experience */}
          {profile.profile?.experience && profile.profile.experience.length > 0 && (
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {profile.profile.experience.map((exp, index) => (
                    <motion.div
                      key={exp._id}
                      className="border-b last:border-0 pb-6 last:pb-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="font-medium text-lg text-blue-700">{exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Duration: {exp.duration} {Number(exp.duration) === 1 ? 'year' : 'years'}
                      </p>
                      <p className="text-gray-600 mt-2">{exp.description}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-6"
        >
          <Button
            onClick={() => router.back()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Applicants
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

// const ApplicantProfileSkeleton = () => (
//   <div className="container mx-auto px-4 py-8 max-w-4xl">
//     <div className="h-10 w-32 mb-6" />
    
//     <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6">
//       <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//         <Skeleton className="w-32 h-32 rounded-full" />
//         <div>
//           <Skeleton className="h-8 w-64 mb-2" />
//           <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
//             <Skeleton className="h-5 w-40" />
//             <Skeleton className="h-5 w-40" />
//           </div>
//         </div>
//       </div>
//     </div>

//     <div className="grid grid-cols-1 gap-6">
//       <div>
//         <Skeleton className="h-10 w-32 mb-4" />
//         <div className="flex flex-wrap gap-2">
//           {[...Array(5)].map((_, i) => (
//             <Skeleton key={i} className="h-8 w-20" />
//           ))}
//         </div>
//       </div>
//       <div>
//         <Skeleton className="h-10 w-32 mb-4" />
//         <div className="space-y-4">
//           {[...Array(2)].map((_, i) => (
//             <div key={i} className="border-b pb-4">
//               <Skeleton className="h-6 w-48 mb-2" />
//               <Skeleton className="h-4 w-32 mb-1" />
//               <Skeleton className="h-4 w-24" />
//             </div>
//           ))}
//         </div>
//       </div>
//       <div>
//         <Skeleton className="h-10 w-32 mb-4" />
//         <div className="space-y-6">
//           {[...Array(2)].map((_, i) => (
//             <div key={i} className="border-b pb-6">
//               <Skeleton className="h-6 w-48 mb-2" />
//               <Skeleton className="h-5 w-32 mb-1" />
//               <Skeleton className="h-4 w-24 mb-2" />
//               <Skeleton className="h-4 w-full mb-1" />
//               <Skeleton className="h-4 w-full mb-1" />
//               <Skeleton className="h-4 w-3/4" />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>
// )