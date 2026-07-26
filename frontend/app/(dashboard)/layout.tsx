import { ReactNode } from "react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import profile from "@/app/(dashboard)/profile/page"

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}