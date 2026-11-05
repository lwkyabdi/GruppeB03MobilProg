import type { SessionUser } from "./auth-types";

export type UnauthorizedError = {
  code: "UNAUTHORIZED";
  message: string;
  fieldErrors: Record<string, string[]>;
};

export type ActionUserResult = | { ok: true; user: SessionUser } | { ok: false; error: UnauthorizedError };

export function unauthorizedError(): UnauthorizedError {
  return {
    code: "UNAUTHORIZED",
    message: "Du må være innlogget, logg inn til /login",
    fieldErrors: {},
  };
}

export function requireActionUser(user: SessionUser | null): ActionUserResult {
  if (!user) {
    return { ok: false, error: unauthorizedError() };
  }
  return { ok: true, user };
}
