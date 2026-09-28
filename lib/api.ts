import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BookingConflictError, InvalidBookingError } from "@/lib/booking";
import {
  PublicRequestError,
  RateLimitExceededError,
} from "@/lib/public-api-security";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof RateLimitExceededError) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 429,
        headers: { "Retry-After": String(error.retryAfterSeconds) },
      },
    );
  }

  if (error instanceof PublicRequestError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: friendlyValidationMessage(error), details: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof BookingConflictError) {
    return jsonError(error.message, 409);
  }

  if (error instanceof InvalidBookingError) {
    return jsonError(error.message, 400);
  }

  if (error instanceof Error && error.name === "UnauthorizedBookingError") {
    return jsonError(error.message, 401);
  }

  if (error instanceof Error && error.name === "BookingConflictError") {
    return jsonError(error.message, 409);
  }

  if (error instanceof Error && error.name === "InvalidBookingError") {
    return jsonError(error.message, 400);
  }

  const prismaCode = (error as { code?: string }).code;
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    prismaCode === "P2028" ||
    prismaCode === "P1017" ||
    message.includes("transaction already closed") ||
    message.includes("connection terminated") ||
    message.includes("econnreset") ||
    message.includes("can't reach database")
  ) {
    return jsonError(
      "Database is busy. Please wait a moment and try again.",
      503,
    );
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}

/*
 * Forms show only `error`, so name the field and reason when the check has
 * hand-written wording (refinements, custom-format messages). Zod's generic
 * messages stay behind "Validation failed".
 */
function friendlyValidationMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue || (issue.code !== "custom" && issue.code !== "invalid_format")) {
    return "Validation failed";
  }
  const field = [...issue.path].reverse().find((part) => typeof part === "string");
  if (!field) return issue.message;
  const label = field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  return `${label}: ${issue.message}`;
}
