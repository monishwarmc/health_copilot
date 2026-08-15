// lib/error.ts

import axios from "axios";

interface FastAPIValidationError {
  loc?: unknown[];
  msg?: string;
  type?: string;
}

interface BackendError {
  detail?: string | FastAPIValidationError[];
  msg?: string;
  message?: string;
}

export default function getErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    console.error(
      "API error status:",
      error.response?.status
    );

    console.error(
      "API error response:",
      responseData
    );

    // Backend returned a plain string
    if (typeof responseData === "string") {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData === "object"
    ) {
      const data =
        responseData as BackendError;

      // FastAPI validation errors
      if (Array.isArray(data.detail)) {
        const messages = data.detail
          .map((item) => {
            if (
              item &&
              typeof item === "object" &&
              typeof item.msg === "string"
            ) {
              const location = Array.isArray(item.loc)
                ? item.loc.join(" → ")
                : "";

              const message =
                item.msg.replace(
                  /^Value error,\s*/i,
                  ""
                );

              return location
                ? `${location}: ${message}`
                : message;
            }

            return null;
          })
          .filter(
            (
              message
            ): message is string =>
              Boolean(message)
          );

        if (messages.length > 0) {
          return messages.join(". ");
        }

        return "Validation failed.";
      }

      // HTTPException detail
      if (
        typeof data.detail === "string"
      ) {
        return data.detail;
      }

      // Custom msg
      if (
        typeof data.msg === "string"
      ) {
        return data.msg;
      }

      // Custom message
      if (
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }

    return (
      error.message ||
      "Request failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}