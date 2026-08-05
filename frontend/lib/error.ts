// lib/error.ts
import axios from "axios";

export default function getErrorMessage(error: unknown): string {
  const backendError = axios.isAxiosError(error)
    ? error.response?.data
    : undefined;

  if (backendError) {
    // FastAPI validation errors
    if (Array.isArray(backendError.detail)) {
      const firstError = backendError.detail[0];

      if (typeof firstError === "object" && firstError?.msg) {
        return firstError.msg.replace(/^Value error,\s*/, "");
      }

      return "Validation failed.";
    }

    // Custom backend exceptions
    if (typeof backendError === "object" && backendError !== null) {
      if ("msg" in backendError) {
        return String(backendError.msg);
      }

      if (
        "detail" in backendError &&
        typeof backendError.detail === "string"
      ) {
        return backendError.detail;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}