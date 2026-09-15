import { z } from "zod";
import { PHYSICAL_ROOM_TYPES, roomCapacity } from "@/lib/physical-inventory";

export const requestedRoomSchema = z.object({
  roomType: z.enum(PHYSICAL_ROOM_TYPES),
  adults: z.number().int().min(1).max(4),
  children: z.number().int().min(0).max(3),
}).strict().refine(r => r.adults + r.children <= roomCapacity(r.roomType), "Guest count exceeds cabin capacity.");
export const holdRequestSchema = z.object({
  cruiseScheduleId: z.string().min(1).max(128),
  rooms: z.array(requestedRoomSchema).min(1).max(12),
}).strict();
export const bookingRequestSchema = z.object({
  bookingId: z.string().min(1).max(128),
  accessToken: z.string().min(1).max(1024),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^\+[1-9][0-9]{6,14}$/, "Use an international phone number, for example +201234567890."),
  country: z.string().trim().min(2).max(80),
  paymentMethod: z.enum(["VISA", "BANK_TRANSFER"]),
  specialRequests: z.string().trim().max(2000).default(""),
  marketingOptIn: z.boolean().default(false),
  termsAccepted: z.literal(true),
  passengers: z.array(z.object({
    fullName: z.string().trim().min(1).max(120), isChild: z.boolean(), roomIndex: z.number().int().min(0).max(11),
  }).strict()).min(1).max(32),
}).strict();
