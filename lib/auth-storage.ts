"use client";

import type { AuthUser, UstasiRole } from "./auth-api";

export const AUTH_STORAGE_KEY = "ustasi-auth";

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
};

export const USER_DASHBOARD_ROLES: UstasiRole[] = ["USER", "USER_FIZ", "USER_YUR"];

export function isUserDashboardRole(role: UstasiRole | string | undefined | null): role is UstasiRole {
  return USER_DASHBOARD_ROLES.includes(role as UstasiRole);
}

export function getRoleDashboardPath(role: UstasiRole | string | undefined | null) {
  return isUserDashboardRole(role) ? "/dashboard/home" : "/dashboard";
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.user ||
      typeof parsed.accessToken !== "string" ||
      !parsed.accessToken
    ) {
      return null;
    }

    return {
      user: parsed.user as AuthUser,
      accessToken: parsed.accessToken,
      refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : undefined,
    };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
