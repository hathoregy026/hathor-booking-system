import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BookingConflictError, InvalidBookingError } from "@/lib/booking";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: error.flatten() },
      { status: 400 },
    );
  }

  if (error instanceof BookingConflictError) {
    return jsonError(error.message, 409);
  }

  if (error instanceof InvalidBookingError) {
    return jsonError(error.message, 400);
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
