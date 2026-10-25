import api from "@/lib/api";
import type { ProfileUpdateData, User } from "@/types/user";

export type ProfileResponse = Omit<User, "auth_provider"> & {
  updated_at: string | null;
};

export const getProfile = () =>
  api.get<ProfileResponse>("/profile");

export const updateProfile = (data: ProfileUpdateData) =>
  api.patch<ProfileResponse>("/profile", data);
