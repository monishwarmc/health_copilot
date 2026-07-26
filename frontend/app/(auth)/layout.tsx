import { ReactNode } from "react";

import PublicRoute from "@/components/auth/PublicRoute";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
}