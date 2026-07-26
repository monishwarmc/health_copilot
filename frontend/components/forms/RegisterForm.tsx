"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

// Material UI Components
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';

// Custom Project Imports
import { registerSchema, RegisterFormData } from "@/schemas/auth.schema";
import GoogleButton from "../ui/GoogleButton";
import FormTextField from "../ui/FormTextField";
import PasswordField from "../ui/PasswordField";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterForm() {

    const router = useRouter()

    const {register: registerUser, googleLogin} = useAuth()

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        const toastId = toast.loading("Creating your account...");
        try {
            const message = await registerUser(
                data.full_name,
                data.email,
                data.password
            );

            toast.success(message);
            router.push("/check-email");
            reset();
        } catch {
            toast.error("Something went wrong");
        } finally {
            toast.dismiss(toastId); 
        }
    };

    const handleGoogleSignIn = async () => {
        const toastId = toast.loading("Signing in with Google...");

        try {
            await googleLogin();

            toast.success("Account created successfully");
        } catch {
            toast.error("Google sign in failed");
        } finally {
            toast.dismiss(toastId);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <GoogleButton onClick={handleGoogleSignIn} />
            
            <Divider sx={{ py: 3 }}>
                OR
            </Divider>

            <Stack spacing={2}>
                <FormTextField
                    label="Full Name"
                    registerProps={register("full_name")}
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                />

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
                />

                <PasswordField
                    label="Confirm Password"
                    registerProps={register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    fullWidth
                    startIcon={<PersonAddIcon/>}
                    sx={{
                        py: 1.5,
                        mt: 1,
                    }}
                >
                    {isSubmitting ? (
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <CircularProgress
                                size={20}
                                color="inherit"
                            />
                            <Typography sx={{ fontWeight: 500 }}>
                                Creating Account...
                            </Typography>
                        </Stack>
                    ) : (
                        "Register"
                    )}
                </Button>
                <Typography
                    variant="body2"
                    align="center"
                    sx={{ mt: 2 }}
                >
                    Already have an account?{"  "}
                <Button
                    variant="outlined"
                    href="/login"
                    size="small"
                    endIcon={<LoginIcon/>}
                >Login</Button>
                </Typography>
            </Stack>
        </form>
    );
}
