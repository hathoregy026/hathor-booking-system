export const siteContentSelect = {
  section: true,
  title: true,
  subtitle: true,
  bodyText: true,
  imageUrl: true,
} as const;

export const adminSiteContentSelect = {
  id: true,
  section: true,
  title: true,
  subtitle: true,
  bodyText: true,
  imageUrl: true,
} as const;

export const roomAdminSelect = {
  id: true,
  name: true,
  roomNumber: true,
  roomType: true,
  priceMultiplier: true,
  capacity: true,
  description: true,
  deletedAt: true,
} as const;

export function buildCruiseListSelect(options: { bin: boolean }) {
  return {
    id: true,
    name: true,
    description: true,
    imageUrl: true,
    basePriceCents: true,
    ports: true,
    deletedAt: true,
    rooms: {
      ...(options.bin ? {} : { where: { deletedAt: null } }),
      select: roomAdminSelect,
      orderBy: { name: "asc" as const },
    },
  } as const;
}

/** @deprecated Use buildCruiseListSelect({ bin: false }) */
export const cruiseListSelect = buildCruiseListSelect({ bin: false });

export const bookingListSelect = {
  id: true,
  customerName: true,
  customerEmail: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  cruiseSchedule: {
    select: {
      departureTime: true,
      arrivalTime: true,
      cruise: { select: { name: true } },
    },
  },
  bookingRooms: {
    select: {
      room: { select: { name: true, roomType: true } },
    },
  },
  bookingTickets: {
    select: {
      quantity: true,
      ticketType: { select: { priceCents: true } },
    },
  },
} as const;

export const dashboardBookingSelect = {
  id: true,
  customerName: true,
  status: true,
  cruiseSchedule: {
    select: {
      departureTime: true,
      cruise: { select: { name: true } },
    },
  },
  bookingTickets: {
    select: {
      quantity: true,
      ticketType: { select: { priceCents: true } },
    },
  },
} as const;

export const publicCruiseSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
} as const;

export const availabilityRoomSelect = {
  id: true,
  name: true,
  capacity: true,
  description: true,
  roomType: true,
  priceMultiplier: true,
} as const;

export const availabilityTicketSelect = {
  id: true,
  name: true,
  description: true,
  priceCents: true,
} as const;
