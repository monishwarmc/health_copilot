"use client"

import AuthCard from '@/components/ui/AuthCard'
import PasswordField from '@/components/ui/PasswordField';
import { resetPasswordData, reset_password_schema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import { reset_password as reset_password_api } from '@/services/auth.service';
import getErrorMessage from '@/lib/error';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function reset_password() {

  const searchParams = useSearchParams();
  
  const token = searchParams.get("token");
  
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.replace(
        `/check-email?message=${encodeURIComponent(
          "Please click on a valid reset password link."
        )}`
      );
    }
  }, [token, router]);

  const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<resetPasswordData>({
      resolver: zodResolver(reset_password_schema),
    });

  const onSubmit = async (data: resetPasswordData) => {
    const toastId = toast.loading("Sending reset password link...");

    try {

      const response = await reset_password_api(token+"", data.password);
      toast.success(response.data.message);
      router.replace("/login");
      reset();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <AuthCard
    title="Forgot password?"
    subtitle="you need to verify your email to reset the password"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <PasswordField
          label="new password"
          registerProps={register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <PasswordField
          label="re-type new password"
          registerProps={register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          sx={{
            py: 1.5,
            mt: 1,
          }}
          endIcon={<EditIcon />}
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
                resetting password...
              </Typography>
            </Stack>
          ) : (
            "reset password"
          )}
        </Button>
        </Stack>
        </form>
    </AuthCard>
  )
}

export default reset_password