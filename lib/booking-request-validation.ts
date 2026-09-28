import { z } from "zod";
import { PHYSICAL_ROOM_TYPES, roomCapacity } from "@/lib/physical-inventory";

/*
 * Names are echoed into emails sent to an address the requester typed in.
 * Refusing link-like text stops the booking form being used to make Hathor's
 * own mail server deliver "pay at evil.example"-style phishing to a victim.
 */
const LINK_LIKE = /(https?:|www\.|:\/\/|[\p{L}\p{N}-]\.\p{L}{2,})/iu;
const personName = (max: number) =>
  z.string().trim().min(1).max(max).refine((value) => !LINK_LIKE.test(value), "Please enter a name without web addresses.");

export const requestedRoomSchema = z.object({
  roomType: z.enum(PHYSICAL_ROOM_TYPES),
  adults: z.number().int().min(1).max(4),
  children: z.number().int().min(0).max(3),
  roomId: z.string().regex(/^(K0[1-6]|T0[12]|S0[12]|R0[12])$/).optional(),
}).strict().refine(r => r.adults + r.children <= roomCapacity(r.roomType), "Guest count exceeds cabin capacity.");
export const holdRequestSchema = z.object({
  cruiseScheduleId: z.string().min(1).max(128),
  rooms: z.array(requestedRoomSchema).min(1).max(12),
}).strict();
export const bookingRequestSchema = z.object({
  bookingId: z.string().min(1).max(128),
  accessToken: z.string().min(1).max(1024),
  firstName: personName(60),
  lastName: personName(60),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^\+[1-9][0-9]{6,14}$/, "Use an international phone number, for example +201234567890."),
  country: z.string().trim().min(2).max(80),
  paymentMethod: z.enum(["VISA", "BANK_TRANSFER"]),
  specialRequests: z.string().trim().max(2000).default(""),
  marketingOptIn: z.boolean().default(false),
  termsAccepted: z.literal(true),
  passengers: z.array(z.object({
    fullName: personName(120), isChild: z.boolean(), roomIndex: z.number().int().min(0).max(11),
  }).strict()).min(1).max(32),
}).strict();
