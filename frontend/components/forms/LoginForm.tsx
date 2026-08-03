"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

// Material UI Components
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";

// Custom Project Imports
import { LoginFormData, loginSchema } from "@/schemas/auth.schema";
import GoogleButton from "../ui/GoogleButton";
import FormTextField from "../ui/FormTextField";
import PasswordField from "../ui/PasswordField";

import { useAuth } from "@/context/AuthContext";
import getErrorMessage from "@/lib/error";

export default function LoginForm() {
  const { login, googleAuth } = useAuth();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const toastShown = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const email = searchParams.get("email");
    const registered = searchParams.get("registered");

    if (email) {
      setValue("email", email);
      passwordRef.current?.focus();
    }

    if (registered && !toastShown.current) {
        toastShown.current = true;
      toast(
        "Your email already exists. Please log in."
      );
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    const toastId = toast.loading("Logging in...");

    try {
      await login(data.email, data.password);

      toast.success("Logged in successfully");
      reset();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleGoogleSignIn = async () => {
    const toastId = toast.loading("Signing in with Google...");

    try {
      await googleAuth()
      toast.success("successfully logged in with google");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GoogleButton onClick={handleGoogleSignIn} />

      <Divider sx={{ py: 3 }}>OR</Divider>

      <Stack spacing={2}>
        <FormTextField
          label="Email"
          type="email"
          registerProps={register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <PasswordField
          label="Password"
          registerProps={register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          ref={passwordRef}
        />

        <Stack
          direction="row"
          sx={{
            justifyContent: "flex-end"
          }}
        >
          <Button
            href="/forgot-password"
            size="small"
            sx={{
              textTransform: "none",
              p: 0,
              minWidth: 0,
            }}
          >
            Forgot Password?
          </Button>
        </Stack>


        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          sx={{
            py: 1.5,
            mt: 1,
          }}
          startIcon={<LoginIcon />}
        >
          {isSubmitting ? (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress
                size={20}
                color="inherit"
              />
              <Typography sx={{ fontWeight: 500 }}>
                Logging in...
              </Typography>
            </Stack>
          ) : (
            "Login"
          )}
        </Button>
      </Stack>

      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 2 }}
      >
        Don't have an account?{" "}
        <Button
          variant="outlined"
          href="/register"
          size="small"
          fullWidth
          endIcon={<PersonAddAltIcon />}
        >
          Register
        </Button>
      </Typography>
    </form>
  );
}