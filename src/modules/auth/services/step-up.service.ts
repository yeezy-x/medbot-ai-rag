import { STEP_UP_WINDOW_MS } from "../constants/auth.constants";
import { ForbiddenError } from "@/lib/errors/forbidden-error";
import { auditService } from "./audit.service";

/** Require recent authentication (password/MFA) within the step-up window. */
export function assertStepUp(authTime?: number, userId?: string) {
  if (!authTime) {
    throw new ForbiddenError("Re-authentication required");
  }
  const ageMs = Date.now() - authTime * 1000;
  if (ageMs > STEP_UP_WINDOW_MS) {
    throw new ForbiddenError("Re-authentication required");
  }
  if (userId) {
    void auditService.log("STEP_UP_SUCCESS", { userId });
  }
}

export function isStepUpFresh(authTime?: number): boolean {
  if (!authTime) return false;
  return Date.now() - authTime * 1000 <= STEP_UP_WINDOW_MS;
}
