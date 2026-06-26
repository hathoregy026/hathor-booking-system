const base = "http://localhost:3000";
const cruiseId = "cm0seed0001cruise000001";
const scheduleId = "cm0seed0001schedule00001";
const roomId = "cm0seed0001room0000001";

const hold = await fetch(`${base}/api/bookings/hold`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    cruiseId,
    cruiseScheduleId: scheduleId,
    roomIds: [roomId],
    startDate: "2026-06-22",
    endDate: "2026-07-31",
  }),
});
const holdData = await hold.json();
console.log("hold", hold.status, holdData);

if (!hold.ok) process.exit(1);

const confirm = await fetch(`${base}/api/bookings/confirm`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    bookingId: holdData.bookingId,
    holdSecret: holdData.holdSecret,
    customerName: "KHLID",
    customerEmail: "khlid@example.com",
    roomIds: [roomId],
    tickets: [],
  }),
});
const confirmData = await confirm.json();
console.log("confirm", confirm.status, confirmData);
