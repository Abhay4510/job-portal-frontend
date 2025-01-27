export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'recruiter';
    profile: {
      skills: string[];
      education: Education[];
      experience: Experience[];
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Education {
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }
  
  export interface Experience {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }
  
  export interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    type: 'full-time' | 'part-time' | 'contract';
    recruiter: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ApiResponse<T> {
    status: string;
    message: string;
    data?: T;
    token?: string;
  }