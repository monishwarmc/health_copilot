"use client";

import TextField, { TextFieldProps } from "@mui/material/TextField";
import { Ref } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormTextFieldProps {
  label: string;
  type?: string;
  error?: boolean;
  helperText?: string;
  registerProps: UseFormRegisterReturn; // Strictly types the React Hook Form bindings
  slotProps?: TextFieldProps["slotProps"]; // Allows passing custom inputs like your visibility toggle buttons
  ref?: Ref<HTMLInputElement>
}

export default function FormTextField({
  label,
  type = "text",
  error = false,
  helperText = "",
  registerProps,
  slotProps,
  ref
}: FormTextFieldProps) {
  return (
    <TextField
      {...registerProps} // Injects onChange, onBlur, name, and ref
      label={label}
      type={type}
      fullWidth
      error={error}
      helperText={helperText}
      slotProps={slotProps} // Handles endAdornments cleanly if provided
      inputRef={ref}
    />
  );
}
