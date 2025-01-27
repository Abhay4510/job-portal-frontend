'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, role, loading, updateUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    address: '',
    education: '',
    skills: '',
    experience: '',
    companyName: '',
    companyDescription: '',
    companyAddress: '',
    website: '',
    industry: '',
  });
  const [updating, setUpdating] = useState(false);

  // If user is not logged in (and not in loading state), redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Prefill the form with user data once we have the user
  useEffect(() => {
    if (user && role === 'user') {
      setFormData((prev) => ({
        ...prev,
        address: user.profile?.address || '',
        education: JSON.stringify(user.profile?.education || []),
        skills: JSON.stringify(user.profile?.skills || []),
        experience: JSON.stringify(user.profile?.experience || []),
      }));
    } else if (user && role === 'recruiter') {
      setFormData((prev) => ({
        ...prev,
        companyName: user.company?.name || '',
        companyDescription: user.company?.description || '',
        companyAddress: user.company?.address || '',
        website: user.company?.website || '',
        industry: user.company?.industry || '',
      }));
    }
  }, [user, role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const formDataToSend = new FormData();

      if (role === 'user') {
        formDataToSend.append('address', formData.address);
        formDataToSend.append('education', formData.education);
        formDataToSend.append('skills', formData.skills);
        formDataToSend.append('experience', formData.experience);
      } else {
        formDataToSend.append('companyName', formData.companyName);
        formDataToSend.append('companyDescription', formData.companyDescription);
        formDataToSend.append('companyAddress', formData.companyAddress);
        formDataToSend.append('website', formData.website);
        formDataToSend.append('industry', formData.industry);
      }

      const response = await fetch(
        'https://job-portal-backend-82a8.vercel.app/api/user/profile',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
        // If your backend returns the updated user, call updateUser
        if (data.user) {
          updateUser(data.user); // This will update user in context
        }
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setUpdating(false);
    }
  };

  // Show loading spinner while checking auth or if user data hasn't arrived
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* If user is normal user */}
            {role === 'user' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Education (JSON)
                  </label>
                  <Textarea
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder='Example: [{"collegeName":"ABC College","degree":"BSc","graduationYear":2023}]'
                    className="h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Skills (JSON)
                  </label>
                  <Textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder='Example: ["JavaScript","React","Node.js"]'
                    className="h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Experience (JSON)
                  </label>
                  <Textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder='Example: [{"company":"XYZ Inc","position":"Developer","duration":"2 years"}]'
                    className="h-32"
                  />
                </div>
              </>
            )}

            {/* If user is a recruiter */}
            {role === 'recruiter' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Description
                  </label>
                  <Textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                    placeholder="Company description"
                    className="h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Address
                  </label>
                  <Input
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    placeholder="Company address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website
                  </label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Company website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry
                  </label>
                  <Input
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Industry"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}