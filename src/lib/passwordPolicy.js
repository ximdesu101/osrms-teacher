/**
 * Shared password complexity policy for Staff and Teacher accounts.
 * Must stay in sync with backend PasswordValidationRules / Password::defaults.
 */

export const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pw) => typeof pw === "string" && pw.length >= 8,
  },
  {
    id: "upper",
    label: "At least one uppercase letter (A–Z)",
    test: (pw) => /[A-Z]/.test(pw || ""),
  },
  {
    id: "lower",
    label: "At least one lowercase letter (a–z)",
    test: (pw) => /[a-z]/.test(pw || ""),
  },
  {
    id: "number",
    label: "At least one number (0–9)",
    test: (pw) => /[0-9]/.test(pw || ""),
  },
  {
    id: "special",
    label: "At least one special character (! @ # $ % & * etc.)",
    test: (pw) => /[^A-Za-z0-9]/.test(pw || ""),
  },
];

/** @returns {{ id: string, label: string, met: boolean }[]} */
export function getPasswordRequirementStatus(password) {
  return PASSWORD_REQUIREMENTS.map((req) => ({
    id: req.id,
    label: req.label,
    met: req.test(password),
  }));
}

export function isPasswordValid(password) {
  return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
}

export function getPasswordPolicyError(password) {
  if (!password) return "Password is required.";
  const unmet = PASSWORD_REQUIREMENTS.filter((req) => !req.test(password));
  if (unmet.length === 0) return null;
  return "Password does not meet all requirements.";
}