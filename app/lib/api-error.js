"use client";

export function getApiErrorMessage(error, fallback = "The request could not be completed.") {
  const serverMessage = error?.response?.data?.message;
  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  if (error?.isAxiosError && !error.response) {
    return "Cannot reach the Shopanow backend. Confirm it is running, check NEXT_PUBLIC_API_URL, and verify FRONTEND_URL allows this site.";
  }

  if (error?.isAxiosError && error.response?.status >= 500) {
    return "The server could not complete this request. Please try again; contact support if the problem continues.";
  }

  if (
    !error?.isAxiosError &&
    error?.name !== "TypeError" &&
    typeof error?.message === "string" &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}
