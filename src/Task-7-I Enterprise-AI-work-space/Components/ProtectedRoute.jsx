import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("access_token");

  // No login token -> Login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If this route doesn't require a specific role,
  // allow any logged-in user.
  if (allowedRoles.length === 0) {
    return children;
  }

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to read user from localStorage:", error);
  }

  // Support backend role object:
  // role: {
  //   id: 2,
  //   name: "manager"
  // }
  //
  // Also supports older string formats.
  const role =
    user?.role?.name?.toLowerCase() ||
    user?.role_name?.toLowerCase() ||
    (typeof user?.role === "string"
      ? user.role.toLowerCase()
      : null);

  console.log("PROTECTED ROUTE USER:", user);
  console.log("PROTECTED ROUTE ROLE:", role);
  console.log("ALLOWED ROLES:", allowedRoles);

  // Token exists but user information is missing
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role doesn't have permission
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}