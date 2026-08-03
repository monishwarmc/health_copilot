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

export const profile = (
  full_name: string | null,
  profile_picture: string | null
) => {
  return api.patch("/auth/profile", {
    full_name,
    profile_picture
  })
}

export const password = (
  old_password: string,
  new_password: string
) => {
  return api.patch("/auth/password", {
    old_password,
    new_password
  })
}

export const account = (
  password: string | null,
  google_token: string | null
) => {
  return api.delete("/auth/account", {
    data: {
      password,
      google_token
    }
  })
}

export const forgot_password = (
  email : string
) => {
  return api.post(
    "/auth/forgot-password",
    {email:email}
  )
}

export const reset_password = (
  token: string,
  new_password: string
) => {
  return api.post(
    "/auth/reset-password",
    {
      token: token,
      new_password: new_password
    }
  )
}