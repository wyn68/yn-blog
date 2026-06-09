import { redirect } from "next/navigation";
import { authRepository } from "@/repositories/auth-repository";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { hasRole, type Role } from "./role";

export { type User } from "@supabase/supabase-js";

export async function getCurrentUser(): Promise<User | null> {
  const { session } = await authRepository.getSessionWithProfile();
  return session?.user ?? null;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { profile } = await authRepository.getSessionWithProfile();
  return profile;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireAuthorOrHigher(): Promise<User> {
  const { session, profile } = await authRepository.getSessionWithProfile();

  if (!session || !profile) {
    redirect("/login");
  }

  if (!hasRole(profile.role as Role, "author")) {
    redirect("/login?error=permission_denied");
  }

  return session.user;
}

export async function requireEditorOrHigher(): Promise<User> {
  const { session, profile } = await authRepository.getSessionWithProfile();

  if (!session || !profile) {
    redirect("/login");
  }

  if (!hasRole(profile.role as Role, "editor")) {
    redirect("/login?error=permission_denied");
  }

  return session.user;
}

export async function requireAdmin(): Promise<User> {
  const { session, profile } = await authRepository.getSessionWithProfile();

  if (!session || !profile) {
    redirect("/login");
  }

  if (!hasRole(profile.role as Role, "admin")) {
    redirect("/login?error=permission_denied");
  }

  return session.user;
}