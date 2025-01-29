'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import { 
  Loader2, Plus, X, Save, ArrowLeft, Building2, MapPin, 
  Globe, Factory, User, GraduationCap, Code, Briefcase, Camera 
} from "lucide-react";

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const formItemVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

export default function ProfileEditForm() {
  const router = useRouter();
  const { token, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    address: "",
    education: [],
    skills: "",
    experience: [],
    companyName: "",
    companyDescription: "",
    companyAddress: "",
    website: "",
    industry: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          "https://job-portal-backend-82a8.vercel.app/api/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setFormData({
            name: data.name || "",
            email: data.email || "",
            profileImage: data.profileImage || "",
            address: data.profile?.address || "",
            education: data.profile?.education || [],
            skills: Array.isArray(data.profile?.skills) 
              ? data.profile.skills.join(", ") 
              : "",
            experience: data.profile?.experience || [],
            companyName: data.company?.name || "",
            companyDescription: data.company?.description || "",
            companyAddress: data.company?.address || "",
            website: data.company?.website || "",
            industry: data.company?.industry || "",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    
    if (role === "user") {
      if (!formData.address?.trim()) newErrors.address = "Address is required";
      
      formData.education?.forEach((edu, index) => {
        if (!edu.collegeName?.trim() || !edu.degree?.trim() || !edu.graduationYear) {
          if (!newErrors.education) newErrors.education = {};
          newErrors.education[index] = "All education fields are required";
        }
      });

      formData.experience?.forEach((exp, index) => {
        if (!exp.company?.trim() || !exp.position?.trim() || !exp.duration) {
          if (!newErrors.experience) newErrors.experience = {};
          newErrors.experience[index] = "All experience fields are required";
        }
      });
    } else {
      if (!formData.companyName?.trim()) newErrors.companyName = "Company name is required";
      if (!formData.companyAddress?.trim()) newErrors.companyAddress = "Company address is required";
      if (!formData.industry?.trim()) newErrors.industry = "Industry is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUpdating(true);
    try {
      const formDataToSend = new FormData();
      
      // Common fields
      formDataToSend.append("name", formData.name);
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      if (role === "user") {
        formDataToSend.append("address", formData.address);
        formDataToSend.append("education", JSON.stringify(formData.education));
        formDataToSend.append("skills", JSON.stringify(formData.skills.split(",").map(s => s.trim())));
        formDataToSend.append("experience", JSON.stringify(formData.experience));
      } else {
        formDataToSend.append("companyName", formData.companyName);
        formDataToSend.append("companyDescription", formData.companyDescription);
        formDataToSend.append("companyAddress", formData.companyAddress);
        formDataToSend.append("website", formData.website);
        formDataToSend.append("industry", formData.industry);
      }

      const response = await fetch(
        "https://job-portal-backend-82a8.vercel.app/api/user/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success("Profile updated successfully");
        router.push("/profile");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating the profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={contentVariants}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profileImage || formData.profileImage} />
                    <AvatarFallback className="text-2xl">
                      {formData.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(errors.name && "border-red-500")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={formData.email} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {role === "user" ? (
            // User specific fields...
            <>
              {/* Address Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={cn(errors.address && "border-red-500")}
                    placeholder="Enter your full address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Enter skills separated by commas (e.g. JavaScript, React, Node.js)"
                  />
                </CardContent>
              </Card>

              {/* Education Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <CardTitle>Education</CardTitle>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      education: [...formData.education, { collegeName: "", degree: "", graduationYear: "" }]
                    })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Education
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {formData.education.map((edu, index) => (
                      <motion.div
                        key={index}
                        variants={formItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative p-4 border rounded-lg space-y-4"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newEducation = [...formData.education];
                            newEducation.splice(index, 1);
                            setFormData({ ...formData, education: newEducation });
                          }}
                          className="absolute right-2 top-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Institution Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={edu.collegeName}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  collegeName: e.target.value
                                };
                                setFormData({ ...formData, education: newEducation });
                              }}
                              className={cn(errors.education?.[index] && "border-red-500")}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Degree <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  degree: e.target.value
                                };
                                setFormData({ ...formData, education: newEducation });
                              }}
                              className={cn(errors.education?.[index] && "border-red-500")}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Graduation Year <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="number"
                              value={edu.graduationYear}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index] = {
                                  ...newEducation[index],
                                  graduationYear: e.target.value
                                };
                                setFormData({ ...formData, education:newEducation });
                              }}
                              className={cn(errors.education?.[index] && "border-red-500")}
                            />
                          </div>
                        </div>
                        {errors.education?.[index] && (
                          <p className="text-red-500 text-sm mt-1">{errors.education[index]}</p>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
              {/* Experience Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <CardTitle>Experience</CardTitle>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      experience: [...formData.experience, { company: "", position: "", duration: "", description: "" }]
                    })}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AnimatePresence>
                    {formData.experience.map((exp, index) => (
                      <motion.div
                        key={index}
                        variants={formItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative p-4 border rounded-lg space-y-4"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newExperience = [...formData.experience];
                            newExperience.splice(index, 1);
                            setFormData({ ...formData, experience: newExperience });
                          }}
                          className="absolute right-2 top-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Company <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const newExperience = [...formData.experience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  company: e.target.value
                                };
                                setFormData({ ...formData, experience: newExperience });
                              }}
                              className={cn(errors.experience?.[index] && "border-red-500")}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Position <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={exp.position}
                              onChange={(e) => {
                                const newExperience = [...formData.experience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  position: e.target.value
                                };
                                setFormData({ ...formData, experience: newExperience });
                              }}
                              className={cn(errors.experience?.[index] && "border-red-500")}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">
                              Duration <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={exp.duration}
                              onChange={(e) => {
                                const newExperience = [...formData.experience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  duration: e.target.value
                                };
                                setFormData({ ...formData, experience: newExperience });
                              }}
                              placeholder="e.g., 2 years"
                              className={cn(errors.experience?.[index] && "border-red-500")}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) => {
                                const newExperience = [...formData.experience];
                                newExperience[index] = {
                                  ...newExperience[index],
                                  description: e.target.value
                                };
                                setFormData({ ...formData, experience: newExperience });
                              }}
                              placeholder="Describe your responsibilities and achievements"
                              rows={3}
                            />
                          </div>
                        </div>
                        {errors.experience?.[index] && (
                          <p className="text-red-500 text-sm mt-1">{errors.experience[index]}</p>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </>
          ) : (
            // Recruiter specific fields
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={cn(errors.companyName && "border-red-500")}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className={cn(errors.industry && "border-red-500")}
                  />
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.companyAddress}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    className={cn(errors.companyAddress && "border-red-500")}
                    rows={3}
                  />
                  {errors.companyAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyAddress}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Company Description</label>
                  <Textarea
                    value={formData.companyDescription}
                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                    placeholder="Tell us about your company"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
                                  