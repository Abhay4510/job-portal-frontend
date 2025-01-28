"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth"; // Adjust import path based on your project
import { cn } from "@/lib/utils";          // Adjust import path based on your project
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

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

// Icons
import { Loader2, Plus, X, Save, ArrowLeft } from "lucide-react";

// Framer Motion variants
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

export default function EditProfilePage() {
  const router = useRouter();
  const { token, role } = useAuth(); // Custom hook to get current user role and token
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    // User-specific fields
    name: "",
    profileImage: "", 
    address: "",
    education: [],
    skills: "",
    experience: [],
    // Recruiter-specific fields
    companyName: "",
    companyDescription: "",
    companyAddress: "",
    website: "",
    industry: "",
  });

  // Error state for validation
  const [errors, setErrors] = useState({});

  // Fetch existing profile data on component mount
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
          if (role === "user") {
            setFormData({
              name: result.data.profile?.name || "",
              profileImage: result.data.profile?.profileImage || "",
              address: result.data.profile?.address || "",
              education: result.data.profile?.education || [],
              skills: result.data.profile?.skills?.join(", ") || "",
              experience: result.data.profile?.experience || [],
              // Clear recruiter fields if switching roles
              companyName: "",
              companyDescription: "",
              companyAddress: "",
              website: "",
              industry: "",
            });
          } else {
            setFormData({
              // Clear user fields if switching roles
              name: result.data.profile?.name || "",
              profileImage: result.data.profile?.profileImage || "",
              address: "",
              education: [],
              skills: "",
              experience: [],
              // Recruiter fields
              companyName: result.data.company?.name || "",
              companyDescription: result.data.company?.description || "",
              companyAddress: result.data.company?.address || "",
              website: result.data.company?.website || "",
              industry: result.data.company?.industry || "",
            });
          }
        } else {
          toast.error("Failed to fetch profile data");
        }
      } catch (error) {
        toast.error("Failed to fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, role]);

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase() || "U";
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    // Validate name for all users
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }

    if (role === "user") {
      if (!formData.address?.trim()) {
        newErrors.address = "Address is required";
      }

      // Safely validate education array
      if (Array.isArray(formData.education)) {
        formData.education.forEach((edu, index) => {
          // Check if edu object exists
          if (edu) {
            // Create nested error objects if they don't exist
            if (!newErrors.education) {
              newErrors.education = {};
            }
            if (!newErrors.education[index]) {
              newErrors.education[index] = {};
            }

            // Validate each field with null checks
            if (!edu.collegeName?.trim()) {
              newErrors.education[index].collegeName = "College name is required";
            }
            if (!edu.degree?.trim()) {
              newErrors.education[index].degree = "Degree is required";
            }
            if (!edu.graduationYear) {
              newErrors.education[index].graduationYear = "Graduation year is required";
            }
          }
        });
      }

      // Safely validate experience array
      if (Array.isArray(formData.experience)) {
        formData.experience.forEach((exp, index) => {
          // Check if exp object exists
          if (exp) {
            // Create nested error objects if they don't exist
            if (!newErrors.experience) {
              newErrors.experience = {};
            }
            if (!newErrors.experience[index]) {
              newErrors.experience[index] = {};
            }

            // Validate each field with null checks
            if (!exp.company?.trim()) {
              newErrors.experience[index].company = "Company name is required";
            }
            if (!exp.position?.trim()) {
              newErrors.experience[index].position = "Position is required";
            }
            if (!exp.duration?.trim()) {
              newErrors.experience[index].duration = "Duration is required";
            }
          }
        });
      }
    } else {
      // Recruiter validation
      if (!formData.companyName?.trim()) {
        newErrors.companyName = "Company name is required";
      }
      if (!formData.companyAddress?.trim()) {
        newErrors.companyAddress = "Company address is required";
      }
      if (!formData.industry?.trim()) {
        newErrors.industry = "Industry is required";
      }
    }

    setErrors(newErrors);
    
    // Check if there are any validation errors
    const hasEducationErrors = newErrors.education && Object.keys(newErrors.education).length > 0;
    const hasExperienceErrors = newErrors.experience && Object.keys(newErrors.experience).length > 0;
    const hasOtherErrors = Object.keys(newErrors).filter(key => key !== 'education' && key !== 'experience').length > 0;

    return !hasEducationErrors && !hasExperienceErrors && !hasOtherErrors;
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setUpdating(true);
    try {
      // Use FormData to handle potential file uploads (though not used here)
      const formDataToSend = new FormData();

      if (role === "user") {
        formDataToSend.append("address", formData.address);
        formDataToSend.append("education", JSON.stringify(formData.education));
        formDataToSend.append(
          "skills",
          JSON.stringify(
            formData.skills.split(",").map((skill) => skill.trim())
          )
        );
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
        router.push("/profile"); // Navigate back to profile page after update
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating the profile");
    } finally {
      setUpdating(false);
    }
  };

  // Handlers for Education
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { collegeName: "", degree: "", graduationYear: "" },
      ],
    });
  };

  const updateEducation = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData({ ...formData, education: newEducation });
  };

  const removeEducation = (index) => {
    const newEducation = [...formData.education];
    newEducation.splice(index, 1);
    setFormData({ ...formData, education: newEducation });
  };

  // Handlers for Experience
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { company: "", position: "", duration: "", description: "" },
      ],
    });
  };

  const updateExperience = (index, field, value) => {
    const newExperience = [...formData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setFormData({ ...formData, experience: newExperience });
  };

  const removeExperience = (index) => {
    const newExperience = [...formData.experience];
    newExperience.splice(index, 1);
    setFormData({ ...formData, experience: newExperience });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
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
          {/* USER FORM */}
          {role === "user" && (
            <>
              {/* Personal Information */}
              <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Image</label>
            {formData.profileImage && (
              <div className="mb-2">
                <img 
                  src={formData.profileImage} 
                  alt="Current profile" 
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files[0])}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Upload a new image to update your profile picture
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Address Field - Only for user role */}
          {role === "user" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your full address"
                className={cn(errors.address && "border-red-500")}
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <CardDescription>
                    Add your relevant skills, separated by commas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium">Skills</label>
                    <Input
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                      placeholder="e.g. JavaScript, React, Node.js"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Education Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>
                      Add your educational background
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addEducation}
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
                        className="space-y-4 p-4 border rounded-lg relative"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>

                        <div>
                          <label className="text-sm font-medium">
                            College/University Name
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={edu.collegeName}
                            onChange={(e) =>
                              updateEducation(index, "collegeName", e.target.value)
                            }
                            placeholder="Enter college name"
                            className={cn(
                              errors[`education.${index}.collegeName`] &&
                                "border-red-500"
                            )}
                          />
                          {errors[`education.${index}.collegeName`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`education.${index}.collegeName`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Degree <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(index, "degree", e.target.value)
                            }
                            placeholder="Enter degree"
                            className={cn(
                              errors[`education.${index}.degree`] && "border-red-500"
                            )}
                          />
                          {errors[`education.${index}.degree`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`education.${index}.degree`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Graduation Year
                            <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            value={edu.graduationYear}
                            onChange={(e) =>
                              updateEducation(
                                index,
                                "graduationYear",
                                e.target.value
                              )
                            }
                            placeholder="Enter graduation year"
                            className={cn(
                              errors[`education.${index}.graduationYear`] &&
                                "border-red-500"
                            )}
                          />
                          {errors[`education.${index}.graduationYear`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`education.${index}.graduationYear`]}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Experience Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Experience</CardTitle>
                    <CardDescription>Add your work experience</CardDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={addExperience}
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
                        className="space-y-4 p-4 border rounded-lg relative"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>

                        {/* Company */}
                        <div>
                          <label className="text-sm font-medium">
                            Company <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(index, "company", e.target.value)
                            }
                            placeholder="Enter company name"
                            className={cn(
                              errors[`experience.${index}.company`] &&
                                "border-red-500"
                            )}
                          />
                          {errors[`experience.${index}.company`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`experience.${index}.company`]}
                            </p>
                          )}
                        </div>

                        {/* Position */}
                        <div>
                          <label className="text-sm font-medium">
                            Position <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={exp.position}
                            onChange={(e) =>
                              updateExperience(index, "position", e.target.value)
                            }
                            placeholder="Enter position"
                            className={cn(
                              errors[`experience.${index}.position`] &&
                                "border-red-500"
                            )}
                          />
                          {errors[`experience.${index}.position`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`experience.${index}.position`]}
                            </p>
                          )}
                        </div>

                        {/* Duration */}
                        <div>
                          <label className="text-sm font-medium">
                            Duration <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={exp.duration}
                            onChange={(e) =>
                              updateExperience(index, "duration", e.target.value)
                            }
                            placeholder="e.g. 2 years, 6 months"
                            className={cn(
                              errors[`experience.${index}.duration`] &&
                                "border-red-500"
                            )}
                          />
                          {errors[`experience.${index}.duration`] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors[`experience.${index}.duration`]}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div>
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) =>
                              updateExperience(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe your responsibilities or achievements"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </>
          )}

          {/* RECRUITER FORM */}
          {role === "recruiter" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your company details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Enter company name"
                    className={cn(errors.companyName && "border-red-500")}
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Company Description</label>
                  <Textarea
                    value={formData.companyDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyDescription: e.target.value,
                      })
                    }
                    placeholder="Short description about the company"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Company Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.companyAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyAddress: e.target.value,
                      })
                    }
                    placeholder="Enter company address"
                    className={cn(errors.companyAddress && "border-red-500")}
                  />
                  {errors.companyAddress && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.companyAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    placeholder="e.g. IT, Finance, Manufacturing"
                    className={cn(errors.industry && "border-red-500")}
                  />
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.industry}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save / Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={updating} className="w-full sm:w-auto">
              {updating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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