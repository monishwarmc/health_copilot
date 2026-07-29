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
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LoginIcon from '@mui/icons-material/Login';

// Custom Project Imports
import { LoginFormData, loginSchema } from "@/schemas/auth.schema";
import GoogleButton from "../ui/GoogleButton";
import FormTextField from "../ui/FormTextField";
import PasswordField from "../ui/PasswordField";

import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {

    const { login, googleLogin } = useAuth();

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        const toastId = toast.loading("logging in...");
        try {
            await login(
                data.email,
                data.password
            );
            toast.success("logged in");
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

            toast.success("Logged in successfully");
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

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    fullWidth
                    sx={{
                        py: 1.5,
                        mt: 1,
                    }}
                    startIcon={<LoginIcon/>}
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
                                logging in...
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
                Don't have an account?{"  "}
            <Button
                variant="outlined"
                href="/register"
                size="small"
                fullWidth
                endIcon={<PersonAddAltIcon/>}
            >Register</Button>
            </Typography>
        </form>
    );
}
