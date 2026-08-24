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
  /* =========================================================
     AXIOS ERROR
  ========================================================= */

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    /* ---------------------------------------------------------
       Plain string response
       Example:
       "Invalid email or password"
    --------------------------------------------------------- */

    if (typeof responseData === "string") {
      return responseData;
    }

    /* ---------------------------------------------------------
       Backend JSON response
    --------------------------------------------------------- */

    if (
      responseData &&
      typeof responseData === "object"
    ) {
      const data =
        responseData as BackendError;

      /* =======================================================
         FASTAPI VALIDATION ERROR

         Example:

         {
           "detail": [
             {
               "loc": ["body", "email"],
               "msg": "value is not a valid email",
               "type": "value_error"
             }
           ]
         }
      ======================================================= */

      if (Array.isArray(data.detail)) {
        const messages = data.detail
          .map((item) => {
            if (
              item &&
              typeof item === "object" &&
              typeof item.msg === "string"
            ) {
              return item.msg.replace(
                /^Value error,\s*/i,
                ""
              );
            }

            return null;
          })
          .filter(
            (message): message is string =>
              Boolean(message)
          );

        if (messages.length > 0) {
          return messages.join(". ");
        }

        return "Validation failed.";
      }

      /* =======================================================
         FASTAPI HTTPException

         Example:

         {
           "detail": "Invalid email or password"
         }
      ======================================================= */

      if (typeof data.detail === "string") {
        return data.detail;
      }

      /* =======================================================
         CUSTOM msg

         {
           "msg": "Invalid email or password"
         }
      ======================================================= */

      if (typeof data.msg === "string") {
        return data.msg;
      }

      /* =======================================================
         CUSTOM message

         {
           "message": "Invalid email or password"
         }
      ======================================================= */

      if (typeof data.message === "string") {
        return data.message;
      }
    }

    /* =========================================================
       FALLBACK
    ========================================================= */

    return (
      error.message ||
      "Request failed. Please try again."
    );
  }

  /* =========================================================
     NORMAL JAVASCRIPT ERROR
  ========================================================= */

  if (error instanceof Error) {
    return error.message;
  }

  /* =========================================================
     STRING ERROR
  ========================================================= */

  if (typeof error === "string") {
    return error;
  }

  /* =========================================================
     UNKNOWN ERROR
  ========================================================= */

  return "Something went wrong. Please try again.";
}