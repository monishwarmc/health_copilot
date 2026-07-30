// lib/error.ts
import axios from "axios";

export default function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.detail ??
            error.response?.data?.message ??
            error.message ??
            "Something went wrong"
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong";
}