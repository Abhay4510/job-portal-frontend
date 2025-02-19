"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import { toast } from 'sonner'

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

export default function ApplyJobPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(false)
  const [resume, setResume] = useState<File | null>(null)
  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || role !== "user")) {
      router.push("/login")
    }
  }, [authLoading, user, role, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        setResume(file)
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resume) {
      toast.error("Please upload your resume")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("resume", resume)

    try {
      const response = await fetch(`https://job-portal-backend-82a8.vercel.app/api/application/apply/${resolvedParams.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success("Application submitted successfully!")
        router.push("/jobs")
      } else {
        if (data.message?.includes("Missing information")) {
          toast.error("Please complete your profile before applying")
          router.push("/profile")
        } else {
          toast.error(data.message || "Failed to submit application")
        }
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("An error occurred while submitting your application")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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

      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Apply for Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="resume">Resume (PDF only)</label>
                <div className="mt-1 flex items-center">
                  <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} className="sr-only" />
                  <label
                    htmlFor="resume"
                    className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Upload className="h-5 w-5 inline-block mr-2" />
                    {resume ? "Change File" : "Upload Resume"}
                  </label>
                  {resume && <span className="ml-3 text-sm text-gray-500">{resume.name}</span>}
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}