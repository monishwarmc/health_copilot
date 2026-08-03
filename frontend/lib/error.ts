// lib/error.ts
import axios from "axios";

export default function getErrorMessage(error: any): string {
  // 1. Dig out Axios API response payloads
  const backendError = error?.response?.data;

  if (backendError) {
    // Handle FastAPI / Pydantic list of validation errors
    if (Array.isArray(backendError.detail)) {
      const firstError = backendError.detail[0];
      return typeof firstError === "object" && firstError?.msg 
        ? firstError.msg 
        : "Validation failed.";
    }

    // Handle single Pydantic error objects directly
    if (typeof backendError === "object" && backendError !== null) {
      if ("msg" in backendError) return backendError.msg;
      if ("detail" in backendError && typeof backendError.detail === "string") return backendError.detail;
    }
  }

  // 2. Standard JS Native Errors Fallback
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}
