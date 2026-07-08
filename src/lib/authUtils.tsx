import toast from "react-hot-toast";

/**
 * Checks if the user is authenticated in a strictly restricted flow.
 * If not, shows an immediate error toast and redirects directly to login.
 * 
 * @param isAuthenticated User's authorization state (e.g. from useAuthStore)
 * @param pathname Current window pathname (from next/navigation usePathname). Used to log redirect targets.
 * @returns boolean True if authorized and safe to execute the action. False to block.
 */
export const requireStrictAuth = (isAuthenticated: boolean, pathname: string) => {
  if (isAuthenticated) return true;

  // Single non-spammy error message for strict semi-restricted access
  toast.error("Login to unlock all features", {
      id: "auth-lock"
  });

  if (pathname) {
      localStorage.setItem("redirectAfterLogin", pathname);
  }
  
  window.location.href = "/login";

  // Always return false if not authenticated, blocking API executions
  return false;
};
