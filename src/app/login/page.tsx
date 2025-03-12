'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [resetFormData, setResetFormData] = useState({
    email: '',
    role: 'user',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        login(data.token, formData.role);
        toast.success('Logged in successfully!');
        router.push('/jobs'); 
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetFormData.email,
          role: resetFormData.role
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('OTP sent to your email');
        setForgotPasswordStep(2);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('An error occurred while requesting OTP');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setResetLoading(true);

    try {
      const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetFormData.email,
          otp: resetFormData.otp,
          newPassword: resetFormData.newPassword
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Password reset successfully');
        setShowForgotPasswordDialog(false);
        setForgotPasswordStep(1);
        setResetFormData({
          email: '',
          role: 'user',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch {
      toast.error('An error occurred while resetting password');
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPasswordDialog = () => {
    setShowForgotPasswordDialog(false);
    setForgotPasswordStep(1);
    setResetFormData({
      email: '',
      role: 'user',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Job Seeker</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowForgotPasswordDialog(true)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </button>
          </CardFooter>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              {forgotPasswordStep === 1 ? 
                "Enter your email address and we'll send you an OTP to reset your password." :
                "Enter the OTP sent to your email and create a new password."
              }
            </DialogDescription>
          </DialogHeader>
          
          {forgotPasswordStep === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetFormData.email}
                  onChange={(e) => setResetFormData({ ...resetFormData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="reset-role" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <Select
                  value={resetFormData.role}
                  onValueChange={(value) => setResetFormData({ ...resetFormData, role: value })}
                >
                  <SelectTrigger id="reset-role">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Job Seeker</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" type="button" onClick={closeForgotPasswordDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={resetFormData.otp}
                  onChange={(e) => setResetFormData({ ...resetFormData, otp: e.target.value })}
                  required
                  placeholder="Enter 6-digit OTP"
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="new-password"
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetFormData.newPassword}
                    onChange={(e) => setResetFormData({ ...resetFormData, newPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500"
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={resetFormData.confirmPassword}
                  onChange={(e) => setResetFormData({ ...resetFormData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              <DialogFooter className="sm:justify-between">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setForgotPasswordStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}