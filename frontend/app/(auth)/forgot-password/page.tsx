"use client"

import AuthCard from '@/components/ui/AuthCard'
import FormTextField from '@/components/ui/FormTextField'
import { forgotFormData, forgotPasswordSchema } from '@/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import { forgot_password as forgot_password_api } from '@/services/auth.service';
import getErrorMessage from '@/lib/error';
import SendIcon from '@mui/icons-material/Send';
import { useRouter } from 'next/navigation';


function forgot_password() {
  
  const router = useRouter()

  const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<forgotFormData>({
      resolver: zodResolver(forgotPasswordSchema),
    });

  const onSubmit = async (data: forgotFormData) => {
    const toastId = toast.loading("Sending reset password link...");

    try {
      const response = await forgot_password_api(data.email);
      console.log(response.data.message)
      toast.success(response.data.message);
      router.push(`/check-email?message=${encodeURIComponent(response.data.message)}`);
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
        <FormTextField
          label="Email"
          type="email"
          registerProps={register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
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
          endIcon={<SendIcon />}
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
                sending verfication email...
              </Typography>
            </Stack>
          ) : (
            "Send verification email"
          )}
        </Button>
        </Stack>
        </form>
    </AuthCard>
  )
}

export default forgot_password