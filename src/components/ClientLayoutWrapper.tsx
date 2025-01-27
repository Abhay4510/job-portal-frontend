'use client';

import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import Navbar from '@/components/Navbar';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />
      {children}
      <Toaster />
    </AuthProvider>
  );
}