/**
 * Shared helpers for classifying Supabase/PostgREST failures so the Demo
 * Manager UI can tell "there is genuinely nothing here" apart from
 * "row-level security / grants are blocking this read".
 */

export type DataAccessKind = "permission" | "auth" | "network" | "unknown";

export interface DataAccessDiagnosis {
  kind: DataAccessKind;
  title: string;
  message: string;
  /** Actionable next steps shown as a checklist in the UI. */
  steps: string[];
  raw?: string;
}

const PERMISSION_CODES = new Set([
  "42501", // insufficient_privilege (missing GRANT)
  "PGRST301", // JWT / role cannot access resource
  "PGRST116", // no rows returned where policy hides them
  "PGRST204",
]);

const PERMISSION_PATTERNS = [
  "permission denied",
  "row-level security",
  "row level security",
  "violates row-level security",
  "not authorized",
  "insufficient_privilege",
  "no suitable key",
];

const AUTH_PATTERNS = [
  "jwt expired",
  "invalid jwt",
  "jwt must be provided",
  "missing authorization",
  "invalid claim",
  "session missing",
  "no api key",
];

const errorText = (error: unknown): string => {
  if (!error) return "";
  if (typeof error === "string") return error;
  const e = error as { message?: string; details?: string; hint?: string; code?: string };
  return [e.code, e.message, e.details, e.hint].filter(Boolean).join(" | ");
};

const matches = (haystack: string, needles: string[]) =>
  needles.some((n) => haystack.includes(n));

export const isPermissionError = (error: unknown): boolean => {
  if (!error) return false;
  const code = (error as { code?: string }).code;
  if (code && PERMISSION_CODES.has(code)) return true;
  return matches(errorText(error).toLowerCase(), PERMISSION_PATTERNS);
};

export const isAuthError = (error: unknown): boolean => {
  if (!error) return false;
  const status = (error as { status?: number }).status;
  if (status === 401) return true;
  return matches(errorText(error).toLowerCase(), AUTH_PATTERNS);
};

/**
 * Turns any read failure into a human message with concrete next steps.
 * Pass `hasSession` so the copy can distinguish "sign in" from
 * "you are signed in but your role is missing demo access".
 */
export const diagnoseDataAccess = (
  error: unknown,
  options: { hasSession?: boolean; resource?: string } = {},
): DataAccessDiagnosis => {
  const resource = options.resource ?? "this data";
  const raw = errorText(error) || undefined;

  if (isAuthError(error) || (isPermissionError(error) && options.hasSession === false)) {
    return {
      kind: "auth",
      title: "Sign-in required",
      message: `${resource} is protected by Demo Manager access rules, and this browser has no active Software Vala session.`,
      steps: [
        "Sign in to Software Vala with your Demo Manager account in this browser.",
        "Ask an admin to grant your account the demo_manager role if you do not have it yet.",
        "Reload this page once the session is active — data loads automatically.",
      ],
      raw,
    };
  }

  if (isPermissionError(error)) {
    return {
      kind: "permission",
      title: "Demo Manager access required",
      message: `The backend accepted the request but its access policies hid ${resource} from your current role.`,
      steps: [
        "Confirm your account has the demo_manager role assigned in user_roles.",
        "Ask an admin to add your user to the Demo Manager team, then reload.",
        "If you are an admin: verify the read policy and table grants for this resource.",
      ],
      raw,
    };
  }

  const lower = errorText(error).toLowerCase();
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("timeout")) {
    return {
      kind: "network",
      title: "Cannot reach the backend",
      message: `${resource} could not be loaded because the backend did not respond.`,
      steps: [
        "Check your network connection and retry.",
        "If the problem persists, the Software Vala backend may be temporarily unavailable.",
      ],
      raw,
    };
  }

  return {
    kind: "unknown",
    title: "Could not load data",
    message: `Something went wrong while loading ${resource}.`,
    steps: ["Retry the request.", "If it keeps failing, share the technical detail below with an admin."],
    raw,
  };
};
