import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";

/** Roles the hub checks against in the UI. */
export const ROLE = {
  admin: "LH Admin",
  manager: "LH Manager",
  user: "LH User",
  systemManager: "System Manager",
} as const;

/** Every role the signed-in user holds. */
export function useRoles(): string[] {
  const { userData } = useContext(UserContext);
  return (userData as any)?.roles?.map((r: any) => r.role) ?? [];
}

export function hasAnyRole(roles: string[], wanted: readonly string[]) {
  return wanted.some((role) => roles.includes(role));
}

/** Reviewers: may see members' personal data and moderate feedback. */
export const ADMIN_ROLES = [ROLE.admin, ROLE.systemManager] as const;

/** Managers and above: may publish, and may add gallery albums. */
export const MANAGER_ROLES = [
  ROLE.manager,
  ROLE.admin,
  ROLE.systemManager,
] as const;

/** Any registered member: may contribute news, events and resources. */
export const CONTRIBUTOR_ROLES = [
  ROLE.user,
  ROLE.manager,
  ROLE.admin,
  ROLE.systemManager,
] as const;

/**
 * Route guard for pages that need a role, not just a session.
 *
 * Hiding a sidebar link does not protect a page: without this the route still
 * renders for anyone who types the URL, and only the API calls fail.
 */
export const RoleRoute = ({ allow }: { allow: readonly string[] }) => {
  const { isLoading } = useContext(UserContext);
  const roles = useRoles();

  // Wait for the session before deciding, or the redirect races the fetch.
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-dash-red border-t-transparent" />
      </div>
    );
  }

  if (!hasAnyRole(roles, allow)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
