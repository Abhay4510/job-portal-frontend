"use client"

import type React from "react"
import { useState, useEffect, use, useCallback } from "react" // Added useCallback import
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, Loader2, Trash2, FileText, Eye } from "lucide-react"
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface Resume {
  _id: string
  url: string
  name: string
  createdAt: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function ApplyJobPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(false)
  const [fetchingResumes, setFetchingResumes] = useState(true)
  const [resume, setResume] = useState<File | null>(null)
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null)
  const [savedResumes, setSavedResumes] = useState<Resume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const { user, token, loading: authLoading, role } = useAuth()
  const router = useRouter()

  // Define fetchSavedResumes with useCallback before using it in useEffect
  const fetchSavedResumes = useCallback(async () => {
    if (!token) return
    
    setFetchingResumes(true)
    try {
      const response = await fetch("https://job-portal-backend-82a8.vercel.app/api/application/resume", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      
      if (data.success && data.data && data.data.resumes) {
        setSavedResumes(data.data.resumes)
        
        // If there's a resume, select the most recent one by default
        if (data.data.resumes.length > 0) {
          setSelectedResumeId(data.data.resumes[0]._id)
        }
      }
    } catch (error) {
      console.error("Error fetching saved resumes:", error)
      toast.error("Failed to load your saved resumes")
    } finally {
      setFetchingResumes(false)
    }
  }, [token]) // Only depends on token

  useEffect(() => {
    if (!authLoading && (!user || role !== "user")) {
      router.push("/login")
    }
  }, [authLoading, user, role, router])

  useEffect(() => {
    if (user && token) {
      fetchSavedResumes()
    }
  }, [user, token, fetchSavedResumes]) // Now this is safe since fetchSavedResumes is defined above

  // Create object URL for newly uploaded file
  useEffect(() => {
    if (resume) {
      const objectUrl = URL.createObjectURL(resume)
      setResumePreviewUrl(objectUrl)
      
      // Clean up the object URL when component unmounts or when resume changes
      return () => {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [resume])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        setResume(file)
        // When new file is selected, clear the selected saved resume
        setSelectedResumeId(null)
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!token) return
    
    setDeleteLoading(resumeId)
    try {
      const response = await fetch(`https://job-portal-backend-82a8.vercel.app/api/application/delete/${resumeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Resume deleted successfully")
        
        // Update the saved resumes list
        setSavedResumes(prev => prev.filter(resume => resume._id !== resumeId))
        
        // If the deleted resume was selected, clear selection
        if (selectedResumeId === resumeId) {
          setSelectedResumeId(null)
        }
      } else {
        toast.error(data.message || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast.error("An error occurred while deleting the resume")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId === selectedResumeId ? null : resumeId)
    // Clear any uploaded file if a saved resume is selected
    if (resumeId !== selectedResumeId) {
      setResume(null)
    }
  }

  const handlePreviewResume = () => {
    setPreviewDialogOpen(true)
  }

  const getActiveResumeUrl = (): string | null => {
    if (resume && resumePreviewUrl) {
      return resumePreviewUrl
    } else if (selectedResumeId) {
      const selectedResume = savedResumes.find(r => r._id === selectedResumeId)
      return selectedResume?.url || null
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if either a file is uploaded or a saved resume is selected
    if (!resume && !selectedResumeId) {
      toast.error("Please upload or select a resume")
      return
    }

    setLoading(true)
    try {
      let response
      
      if (resume) {
        // If new resume file is uploaded
        const formData = new FormData()
        formData.append("resume", resume)
        
        response = await fetch(`https://job-portal-backend-82a8.vercel.app/api/application/apply/${resolvedParams.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
      } else if (selectedResumeId) {
        // If using a previously uploaded resume
        const selectedResume = savedResumes.find(r => r._id === selectedResumeId)
        
        response = await fetch(`https://job-portal-backend-82a8.vercel.app/api/application/apply/${resolvedParams.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeUrl: selectedResume?.url
          }),
        })
      }

      if (response) {
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
              {/* Previously uploaded resumes section */}
              {fetchingResumes ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : savedResumes.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-medium">Your Saved Resumes</h3>
                  <div className="space-y-2">
                    {savedResumes.map((savedResume) => (
                      <div 
                        key={savedResume._id} 
                        className={`flex items-center justify-between p-3 border rounded-md ${
                          selectedResumeId === savedResume._id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="flex items-center flex-1 cursor-pointer"
                          onClick={() => handleResumeSelect(savedResume._id)}
                        >
                          <FileText className="h-5 w-5 text-blue-500 mr-2" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{savedResume.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded on {new Date(savedResume.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedResumeId === savedResume._id && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handlePreviewResume}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResume(savedResume._id)}
                            disabled={deleteLoading === savedResume._id}
                            className="text-gray-500 hover:text-red-500"
                          >
                            {deleteLoading === savedResume._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="mx-2 text-sm text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                </div>
              ) : null}
              
              {/* Upload new resume section */}
              <div>
                <label htmlFor="resume" className="font-medium">Upload New Resume (PDF only)</label>
                <div className="mt-2 flex items-center">
                  <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} className="sr-only" />
                  <label
                    htmlFor="resume"
                    className={`cursor-pointer py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                      resume ? 'bg-blue-50 text-blue-700 border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <Upload className="h-5 w-5 inline-block mr-2" />
                    {resume ? "Change File" : "Upload Resume"}
                  </label>
                  {resume && (
                    <div className="ml-3 flex items-center">
                      <span className="text-sm text-gray-500 mr-2 truncate max-w-xs">{resume.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviewResume}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading || (!resume && !selectedResumeId)}
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

      {/* PDF Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {getActiveResumeUrl() ? (
              <iframe
                src={getActiveResumeUrl() + "#toolbar=0"}
                className="w-full h-full border-0"
                title="Resume Preview"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No resume selected</p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}