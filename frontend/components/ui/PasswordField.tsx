"use client";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { UseFormRegisterReturn } from "react-hook-form";

// Material UI Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";

interface FormTextFieldProps {
  label: string;
  error?: boolean;
  helperText?: string;
  registerProps: UseFormRegisterReturn; // Strictly types the React Hook Form bindings
}

export default function PasswordField({
  label,
  error = false,
  helperText = "",
  registerProps,
}: FormTextFieldProps) {

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <TextField
        {...registerProps} // Injects onChange, onBlur, name, and ref
        label={label}
        type={showPassword ? "text" : "password"}
        fullWidth
        error={error}
        helperText={helperText}
        slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={togglePasswordVisibility}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }
        } 
        />
    );
}
