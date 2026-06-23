const base = "http://localhost:3000";
const cruiseId = "cm0seed0001cruise000001";

const avail = await (
  await fetch(
    `${base}/api/availability?cruiseId=${cruiseId}&startDate=2026-06-22&endDate=2026-07-31`,
  )
).json();

const schedule = avail.schedules?.[0];
const room = schedule?.availableRooms?.[0];

if (!schedule || !room) {
  console.log("No available rooms", avail);
  process.exit(1);
}

console.log("Using room", room.name, room.id);

const hold = await fetch(`${base}/api/bookings/hold`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cruiseId,
    cruiseScheduleId: schedule.scheduleId,
    roomIds: [room.id],
    startDate: "2026-06-22",
    endDate: "2026-07-31",
  }),
});
const holdData = await hold.json();
console.log("hold", hold.status, holdData.bookingId ?? holdData);

if (!hold.ok) process.exit(1);

const confirm = await fetch(`${base}/api/bookings/confirm`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    bookingId: holdData.bookingId,
    customerName: "KHLID",
    customerEmail: "khlid@example.com",
    roomIds: [room.id],
    tickets: [],
  }),
});
const confirmData = await confirm.json();
console.log("confirm", confirm.status, confirmData);
