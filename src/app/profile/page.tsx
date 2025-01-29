'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
// import Image from 'next/image';
import {
  User,
  Building2,
  GraduationCap,
  Code,
  Briefcase,
  MapPin,
  Globe,
  Factory,
  Loader2,
} from 'lucide-react';

// Define interfaces for your data structure
interface Education {
  collegeName?: string;
  schoolName?: string;
  degree: string;
  graduationYear: string;
}

interface Experience {
  position: string;
  company: string;
  duration: number;
  description: string;
}

interface Company {
  name: string;
  address: string;
  website: string;
  industry: string;
  description: string;
}

interface Profile {
  address: string;
  education: Education[];
  skills: string[];
  experience: Experience[];
}

interface ProfileData {
  role: string;
  name: string;
  email: string;
  company?: Company;
  profile?: Profile;
  profileImage?: string; // New field for profile image
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ProfileView() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setProfileData(result.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) {
    // Display a loading spinner while fetching data
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isRecruiter = profileData?.role === 'recruiter';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div {...fadeIn}>
        {/* Profile Image and User Info */}
        <div className="text-center mb-8">
          {/* Conditional rendering: If profileImage exists, show the image; otherwise, show the fallback */}
          {profileData?.profileImage ? (
            <img
              src={profileData.profileImage}
              alt={`${profileData.name}'s Profile`}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-500"
            />
          ) : (
            <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl font-bold text-blue-600">
                {profileData?.name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{profileData?.name}</h1>
          <p className="text-gray-600">{profileData?.email}</p>
        </div>

        {/* Profile Details */}
        <motion.div
          className="grid gap-6 mb-6"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {isRecruiter ? (
            // Recruiter Profile Details
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{profileData?.company?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profileData?.company?.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{profileData?.company?.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-gray-500" />
                  <span>{profileData?.company?.industry}</span>
                </div>
                <p className="mt-4 text-gray-600">{profileData?.company?.description}</p>
              </CardContent>
            </Card>
          ) : (
            // User Profile Details
            <>
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{profileData?.profile?.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData?.profile?.education?.map((edu, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <h3 className="font-medium">{edu.collegeName || edu.schoolName}</h3>
                      <p className="text-gray-600">{edu.degree}</p>
                      <p className="text-sm text-gray-500">Year: {edu.graduationYear}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-blue-600" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData?.profile?.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData?.profile?.experience?.map((exp, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <h3 className="font-medium">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">Duration: {exp.duration} years</p>
                      <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        {/* Edit Profile Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => router.push('/profile/edit')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Edit Profile
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
