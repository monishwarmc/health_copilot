export type AuthProvider = "local" | "google";

export interface User {
  id: string;
  full_name: string;
  email: string;
  profile_picture: string | null;
  created_at: string;
  auth_provider: AuthProvider;
}