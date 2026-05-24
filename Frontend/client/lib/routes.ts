import type { UserRole } from "@shared/api";

export type NavUserRole = "seeker" | "company";

export function toNavUserRole(role?: UserRole): NavUserRole {
  return role === "company" ? "company" : "seeker";
}

export function getHomeRouteByRole(role?: UserRole): string {
  return role === "company" ? "/dashboard/company" : "/dashboard";
}
