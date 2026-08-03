"use client";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { UseFormRegisterReturn } from "react-hook-form";

// Material UI Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState, Ref } from "react";

interface FormTextFieldProps {
  label: string;
  error?: boolean;
  helperText?: string;
  registerProps: UseFormRegisterReturn;
  ref?: Ref<HTMLInputElement>
}

export default function PasswordField({
  label,
  error = false,
  helperText = "",
  registerProps,
  ref
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
        inputRef={ref}
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
