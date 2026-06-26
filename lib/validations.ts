import { isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";
import {
  MAX_GUESTS_PER_ROOM,
  validateRoomGuestCapacity,
} from "@/lib/room-capacity";

const utcIsoDateString = z
  .string()
  .min(1, "Date is required")
  .transform((value, ctx) => {
    const parsed = parseISO(value);
    if (!isValid(parsed)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date string",
      });
      return z.NEVER;
    }
    return parsed.toISOString();
  });

export const stayDurationSchema = z.enum([
  "3-nights-aswan-luxor",
  "4-nights-luxor-aswan",
  "7-nights-luxor-aswan-luxor",
]);

export const luxuryRoomTypeSchema = z.enum([
  "luxury-rooms",
  "luxury-suites",
  "luxury-royal-suites",
]);

export const roomSearchConfigSchema = z
  .object({
    roomType: luxuryRoomTypeSchema,
    adults: z.coerce.number().int().min(1).max(MAX_GUESTS_PER_ROOM),
    children: z.coerce.number().int().min(0).max(MAX_GUESTS_PER_ROOM),
  })
  .superRefine((data, ctx) => {
    const message = validateRoomGuestCapacity(data);
    if (message) {
      ctx.addIssue({
        code: "custom",
        message,
        path: ["adults"],
      });
    }
  });

const roomsJsonParam = z
  .string()
  .min(1, "rooms is required")
  .transform((value, ctx) => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(value);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "rooms must be valid JSON",
      });
      return z.NEVER;
    }

    const result = z
      .array(roomSearchConfigSchema)
      .min(1, "At least one room configuration is required")
      .max(5, "At most 5 room configurations are allowed")
      .safeParse(parsed);

    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: result.error.issues[0]?.message ?? "Invalid room configurations",
      });
      return z.NEVER;
    }

    return result.data;
  });

export const availabilityWidgetSearchSchema = z
  .object({
    duration: stayDurationSchema,
    checkInDate: utcIsoDateString,
    rooms: roomsJsonParam,
  })
  .refine(
    (data) => {
      const today = startOfDay(new Date());
      return parseISO(data.checkInDate) >= today;
    },
    {
      message: "checkInDate must be today or in the future",
      path: ["checkInDate"],
    },
  );

export const availabilitySearchSchema = z
  .object({
    cruiseId: z.string().min(1, "cruiseId is required"),
    startDate: utcIsoDateString,
    endDate: utcIsoDateString,
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "endDate must be after startDate",
      path: ["endDate"],
    },
  );

export const createHoldSchema = z.object({
  cruiseId: z.string().min(1, "cruiseId is required"),
  cruiseScheduleId: z.string().min(1, "cruiseScheduleId is required"),
  roomIds: z
    .array(z.string().min(1))
    .min(1, "At least one room is required"),
  startDate: utcIsoDateString,
  endDate: utcIsoDateString,
});

export const confirmBookingSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  holdSecret: z.string().min(1, "holdSecret is required"),
  customerName: z.string().min(1, "customerName is required"),
  customerEmail: z.string().email("Valid email is required"),
  roomIds: z
    .array(z.string().min(1))
    .min(1, "At least one room is required"),
  tickets: z
    .array(
      z.object({
        ticketTypeId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .default([]),
});

export const cruiseSearchSchema = z
  .object({
    duration: z
      .string()
      .min(1, "duration is required")
      .transform((value, ctx) => {
        const normalized =
          value === "3-nights-aswan-luxor" ||
          value === "4-nights-luxor-aswan" ||
          value === "7-nights-luxor-aswan-luxor"
            ? value
            : value === "3"
              ? "3-nights-aswan-luxor"
              : value === "4"
                ? "4-nights-luxor-aswan"
                : value === "7"
                  ? "7-nights-luxor-aswan-luxor"
                  : null;

        if (!normalized) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid duration. Use 3, 4, 7 or a stay duration slug.",
          });
          return z.NEVER;
        }

        return normalized;
      }),
    checkInDate: utcIsoDateString,
    rooms: roomsJsonParam.optional(),
    roomType: luxuryRoomTypeSchema.optional(),
    adults: z.coerce.number().int().min(1).max(MAX_GUESTS_PER_ROOM).optional(),
    children: z.coerce.number().int().min(0).max(MAX_GUESTS_PER_ROOM).optional(),
  })
  .refine(
    (data) => {
      const today = startOfDay(new Date());
      return parseISO(data.checkInDate) >= today;
    },
    {
      message: "checkInDate must be today or in the future",
      path: ["checkInDate"],
    },
  )
  .refine(
    (data) => {
      if (data.rooms && data.rooms.length > 0) return true;
      return Boolean(data.roomType && data.adults !== undefined);
    },
    {
      message:
        "Provide rooms JSON or roomType with adults (and optional children).",
      path: ["rooms"],
    },
  );

export const checkoutBookingSchema = z
  .object({
    cruiseId: z.string().min(1, "cruiseId is required"),
    cruiseScheduleId: z.string().min(1, "cruiseScheduleId is required"),
    roomId: z.string().min(1, "roomId is required"),
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("Valid email is required"),
    phone: z.string().trim().min(6, "Phone number is required"),
    adults: z.coerce.number().int().min(1).max(MAX_GUESTS_PER_ROOM),
    children: z.coerce.number().int().min(0).max(MAX_GUESTS_PER_ROOM),
    specialRequests: z.string().trim().max(2000).optional().default(""),
    priceCents: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.adults + data.children > MAX_GUESTS_PER_ROOM) {
      ctx.addIssue({
        code: "custom",
        message: `Maximum ${MAX_GUESTS_PER_ROOM} guests per room`,
        path: ["adults"],
      });
    }
  });

export const periodSearchSchema = z
  .object({
    periodStart: utcIsoDateString,
    periodEnd: utcIsoDateString,
    rooms: roomsJsonParam.optional(),
    roomType: luxuryRoomTypeSchema.optional(),
    adults: z.coerce.number().int().min(1).max(MAX_GUESTS_PER_ROOM).optional(),
    children: z.coerce.number().int().min(0).max(MAX_GUESTS_PER_ROOM).optional(),
  })
  .refine(
    (data) => new Date(data.periodEnd) > new Date(data.periodStart),
    {
      message: "periodEnd must be after periodStart",
      path: ["periodEnd"],
    },
  )
  .refine(
    (data) => {
      const today = startOfDay(new Date());
      return parseISO(data.periodStart) >= today;
    },
    {
      message: "periodStart must be today or in the future",
      path: ["periodStart"],
    },
  )
  .refine(
    (data) => {
      if (data.rooms && data.rooms.length > 0) return true;
      return Boolean(data.roomType && data.adults !== undefined);
    },
    {
      message:
        "Provide rooms JSON or roomType with adults (and optional children).",
      path: ["rooms"],
    },
  );

export type CruiseSearchInput = z.infer<typeof cruiseSearchSchema>;
export type PeriodSearchInput = z.infer<typeof periodSearchSchema>;

export type AvailabilityWidgetSearch = z.infer<
  typeof availabilityWidgetSearchSchema
>;
export type RoomSearchConfigInput = z.infer<typeof roomSearchConfigSchema>;
export type CreateHold = z.infer<typeof createHoldSchema>;
export type ConfirmBooking = z.infer<typeof confirmBookingSchema>;
export type CheckoutBooking = z.infer<typeof checkoutBookingSchema>;

const calendarDateParam = z
  .string()
  .min(1)
  .refine((value) => isValid(parseISO(value)), {
    message: "Invalid date",
  });

export const cruiseCalendarQuerySchema = z.object({
  duration: stayDurationSchema,
  rooms: roomsJsonParam,
  from: calendarDateParam,
  to: calendarDateParam,
});

export type CruiseCalendarQuery = z.infer<typeof cruiseCalendarQuerySchema>;
