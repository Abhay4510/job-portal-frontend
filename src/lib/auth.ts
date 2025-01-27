import { User } from '@/types/index';

export async function checkAuthStatus(token: string): Promise<User | null> {
  try {
    const response = await fetch('https://job-portal-backend-82a8.vercel.app/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (data.status === 'success') {
      return data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function isValidToken(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if token is expired
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) return false;

    return true;
  } catch {
    return false;
  }
}

// Types definition file (src/types/index.ts)
// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: 'user' | 'recruiter' | 'admin';
//   createdAt: string;
//   resume?: string;
//   skills?: string[];
//   experience?: string;
// }

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requirements: string;
  salary?: string;
  createdAt: string;
  postedBy: User;
  applications?: string[];
}