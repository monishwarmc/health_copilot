import api from "@/lib/api";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  MessageResponse
} from "@/types/auth";
import { User } from "@/types/user";
import { GoogleLoginRequest } from "@/types/auth";

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>("/auth/login", data);

export const register = (data: RegisterRequest) =>
  api.post<MessageResponse>("/auth/register", data);

export const getCurrentUser = () =>
  api.get<User>("/auth/me");

export const googleLogin = (
  data: GoogleLoginRequest
) => api.post<AuthResponse>("/auth/google", data);

export const verifyEmail = (
    token: string
) => {
    return api.post("/auth/verify-email", {
        token,
    });
};