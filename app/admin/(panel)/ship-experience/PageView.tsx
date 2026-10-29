"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { DeckAtlasPlan, PlanCloseUp, type AtlasPlanRoom, type AtlasState, type SpotId } from "@/components/home/deck-atlas/DeckAtlasPlan";
import { facilitiesWith, facilityMark, type Facility } from "@/components/home/deck-atlas/facilities";
import { useToast } from "@/components/admin/ToastProvider";
import type { SailingAvailability } from "@/lib/availability-service";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import type { ShipRoom } from "@/lib/ship-experience";
import {
  DEFAULT_SHIP_EXPERIENCE,
  SHIP_DECK_IDS,
  SHIP_REGIONS,
  type ShipDeckId,
  type ShipExperienceConfig,
  type ShipSlotId,
  type ShipSpaceId,
} from "@/lib/ship-experience-shared";
import { PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";
import "@/components/home/deck-atlas/deck-atlas.css";
import "./ship-experience.css";

type RoomDraft = Pick<ShipRoom, "id" | "name" | "roomNumber" | "roomType" | "description" | "capacity" | "sizeSqm">;
type Allocation = {
  roomId: string; state: string; blockKey: string | null; reason: string | null; releasable: boolean;
  startsAt: string; endsAt: string; bookingId: string | null; guest: string | null; bookingStatus: string | null;
};
/** Arriving from a booking: `?tab=bookings&voyage=4-nights-luxor-aswan&date=2026-11-21&room=K02`. */
type MapTarget = { date: string | null; room: string | null };
type Selection = { kind: "room"; id: ShipSlotId } | { kind: "space"; id: ShipSpaceId } | null;
type PlanSlot = ShipExperienceConfig["rooms"][number];

const VOYAGES: { id: StayDurationValue; name: string }[] = [
  { id: "3-nights-aswan-luxor", name: "3 nights · Aswan–Luxor" },
  { id: "4-nights-luxor-aswan", name: "4 nights · Luxor–Aswan" },
  { id: "7-nights-luxor-aswan-luxor", name: "7 nights · Round trip" },
];
const utc = { timeZone: "UTC" } as const;
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", ...utc });
const rangeLabel = (from: string, to: string) => `${new Date(from).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...utc })} – ${dayLabel(to)}`;
const BOOKING_WORD: Record<string, string> = { PENDING_HOLD: "holding it at checkout", REQUESTED: "booking request", CONFIRMED: "confirmed booking" };
/** Why a cabin is taken on a sailing: the guest who booked it, or the words the team used when they closed it. */
function takenBy(allocation: Allocation | undefined): string {
  if (!allocation) return "Booked";
  if (allocation.bookingId) return `${allocation.guest || "Website guest"} · ${BOOKING_WORD[allocation.bookingStatus ?? ""] ?? "website booking"}`;
  if (allocation.state === "MAINTENANCE") return allocation.reason || "Maintenance";
  if (allocation.state === "CHARTER_BLOCK") return allocation.reason ? `Charter · ${allocation.reason}` : "Whole-ship charter";
  return allocation.reason === "Ship Explorer" ? "Closed from this page" : allocation.reason || "Closed from the dashboard";
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload as T;
}

/** The plan, drawn exactly as on the homepage (same component, styles and fonts), inside the dashboard. */
function AdminPlan({ deck, rooms, spaces, focusId, selectedId, onRoom, onSpace, onFocus, legend }: {
  deck: ShipDeckId; rooms: AtlasPlanRoom[]; spaces: Facility[];
  focusId: SpotId | null; selectedId: ShipSlotId | null;
  onRoom: (id: ShipSlotId) => void; onSpace: (id: ShipSpaceId) => void; onFocus: (id: SpotId | null) => void;
  /** The homepage's own key for free and booked rooms, when a departure is shown. */
  legend?: boolean;
}) {
  return (
    <div className="deck-atlas sx-plan" data-revealed="">
      <div className="da-plan__viewport">
        <div className="da-plan__scroll">
          <DeckAtlasPlan key={deck} deck={deck} rooms={rooms} spaces={spaces} focusId={focusId} selectedId={selectedId}
            revealed onFocus={onFocus} onSelect={onRoom} onOpenSpace={onSpace} />
        </div>
      </div>
      {legend ? <ul className="da-legend" aria-label="Plan key">
        <li data-state="open"><i />Free</li>
        <li data-state="closed"><i />Booked on this date</li>
        <li data-state="selected"><i />Selected</li>
      </ul> : null}
    </div>
  );
}

/**
 * A room on the bookings map, opened the way the homepage opens it — the same
 * pop-up — but with what the team needs: who holds it, for which nights, and
 * the booking or closure behind it.
 */
function AdminRoomSheet({ slot, cabin, deckName, sailing, allocation, open, working, onClose, onBlock }: {
  slot: PlanSlot | undefined; cabin: RoomDraft | undefined; deckName: string;
  sailing: SailingAvailability | undefined; allocation: Allocation | undefined; open: boolean | null;
  working: boolean; onClose: () => void; onBlock: (roomId: string, allocation?: Allocation) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = !!slot && open !== null;
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (shown && !element.open) element.showModal();
    if (!shown && element.open) element.close();
  }, [shown]);
  const region = slot ? SHIP_REGIONS[slot.slotId] : null;
  const photo = cabin?.roomType ? getBookingRoomVisuals(cabin.name, cabin.roomType).gallery[0] : undefined;
  const status = !sailing ? "" : open
    ? `Free · ${rangeLabel(sailing.departureTime, sailing.arrivalTime)}`
    : `${takenBy(allocation)} · ${allocation ? rangeLabel(allocation.startsAt, allocation.endsAt) : rangeLabel(sailing.departureTime, sailing.arrivalTime)}`;
  return (
    <div className="deck-atlas sx-sheet">
      <dialog ref={dialog} className="da-modal" aria-labelledby="sx-sheet-title"
        onCancel={event => { event.preventDefault(); onClose(); }}
        onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        {slot && region ? <div className="da-modal__panel" data-kind="room">
          <button type="button" className="da-modal__close" aria-label={`Close ${slot.name}`} onClick={onClose}><X aria-hidden="true" /></button>
          <figure className="da-modal__media">
            {photo ? <Image className="da-modal__img" src={photo} alt={cabin?.name ?? slot.name} fill sizes="(max-width: 1100px) 500px, 540px" />
              : <PlanCloseUp className="da-closeup--hero" deck={region.deck} areas={[region]} label={slot.name} />}
          </figure>
          <div className="da-modal__info">
            <p className="da-kicker">{deckName} · {slot.name}</p>
            <h3 id="sx-sheet-title" className="da-modal__title">{cabin?.name ?? slot.name}</h3>
            {cabin ? <p className="da-modal__spec">{cabin.sizeSqm} m² · Up to {cabin.capacity} guests · {cabin.id}</p> : null}
            <div className="da-modal__terms">
              <p className="da-status" data-state={open ? "open" : "closed"}>{status}</p>
            </div>
            <div className="da-modal__where">
              <p className="da-kicker">Where it is</p>
              <PlanCloseUp deck={region.deck} areas={[region]} label={slot.name} ratio={3} />
            </div>
            <div className="sx-sheet__act">
              {allocation?.bookingId ? <Link className="admin-btn-primary" href={`/admin/bookings/${allocation.bookingId}`}>Open the booking</Link> : null}
              {cabin && open ? <button type="button" className="admin-btn-outline" disabled={working} onClick={() => onBlock(cabin.id)}>Close this date</button> : null}
              {cabin && !open && allocation?.releasable ? <button type="button" className="admin-btn-outline" disabled={working} onClick={() => onBlock(cabin.id, allocation)}>Reopen</button> : null}
              {!open && !allocation?.bookingId && !allocation?.releasable ? <p className="sx-admin__locked">Closed elsewhere in the dashboard — reopen it where it was closed.</p> : null}
            </div>
          </div>
        </div> : null}
      </dialog>
    </div>
  );
}

export default function ShipExperienceAdminPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<ShipExperienceConfig>(DEFAULT_SHIP_EXPERIENCE);
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [tab, setTab] = useState<"layout" | "availability">("layout");
  const [deckId, setDeckId] = useState<ShipDeckId>("lower");
  const [selection, setSelection] = useState<Selection>(null);
  const [hovered, setHovered] = useState<SpotId | null>(null);
  const [loading, setLoading] = useState(true);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [duration, setDuration] = useState<StayDurationValue>("7-nights-luxor-aswan-luxor");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [sailings, setSailings] = useState<SailingAvailability[]>([]);
  const [scheduleId, setScheduleId] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [workingRoom, setWorkingRoom] = useState<string | null>(null);
  const [mapTarget, setMapTarget] = useState<MapTarget | null>(null);
  /* The room opened on the bookings map. */
  const [sheetSlot, setSheetSlot] = useState<ShipSlotId | null>(null);

  /* Opened from a booking: straight to its departure on the bookings map, with its cabin picked out. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") !== "bookings") return;
    setTab("availability"); // eslint-disable-line react-hooks/set-state-in-effect -- read once from the address
    const voyage = params.get("voyage");
    if (voyage && VOYAGES.some(item => item.id === voyage)) setDuration(voyage as StayDurationValue);
    const date = params.get("date");
    const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
    if (validDate && validDate.slice(0, 7) >= new Date().toISOString().slice(0, 7)) setMonth(validDate.slice(0, 7));
    setMapTarget({ date: validDate, room: params.get("room") });
  }, []);

  const loadEditor = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await readResponse<{ config: ShipExperienceConfig; rooms: ShipRoom[] }>(await fetch("/api/admin/ship-experience", { cache: "no-store" }));
      setConfig(payload.config);
      setRooms(payload.rooms);
      setEditorError(null);
      setDirty(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load the ship editor.";
      setEditorError(message);
      showToast("error", message);
    } finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { void loadEditor(); }, [loadEditor]); // eslint-disable-line react-hooks/set-state-in-effect -- initial dashboard read

  const loadAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    try {
      const payload = await readResponse<{ sailings: SailingAvailability[]; availabilityError?: boolean }>(await fetch(`/api/ship-experience?duration=${encodeURIComponent(duration)}&month=${encodeURIComponent(month)}`, { cache: "no-store" }));
      if (payload.availabilityError) throw new Error("Live availability could not be read just now. Try again in a moment.");
      setSailings(payload.sailings);
      setScheduleId(current => payload.sailings.some(sailing => sailing.scheduleId === current) ? current : payload.sailings[0]?.scheduleId ?? "");
    } catch (error) {
      setSailings([]);
      setScheduleId("");
      setAllocations([]);
      showToast("error", error instanceof Error ? error.message : "Could not load availability.");
    } finally { setAvailabilityLoading(false); }
  }, [duration, month, showToast]);

  const loadAllocations = useCallback(async (id: string, signal?: AbortSignal) => {
    const payload = await readResponse<{ allocations: Allocation[] }>(await fetch(`/api/admin/inventory?cruiseScheduleId=${encodeURIComponent(id)}`, { cache: "no-store", signal }));
    setAllocations(payload.allocations);
  }, []);

  useEffect(() => { if (tab === "availability" && !editorError) void loadAvailability(); }, [tab, editorError, loadAvailability]); // eslint-disable-line react-hooks/set-state-in-effect -- live inventory read
  useEffect(() => {
    if (!mapTarget || loading || availabilityLoading || !sailings.length) return;
    const departure = mapTarget.date ? sailings.find(item => item.departureTime.slice(0, 10) === mapTarget.date) : null;
    if (departure) setScheduleId(departure.scheduleId); // eslint-disable-line react-hooks/set-state-in-effect -- a one-time hand-off from the address
    const slot = mapTarget.room ? config.rooms.find(item => item.roomId === mapTarget.room || item.slotId === mapTarget.room) : undefined;
    if (slot) { setDeckId(SHIP_REGIONS[slot.slotId].deck); setSelection({ kind: "room", id: slot.slotId }); }
    setMapTarget(null);
  }, [mapTarget, loading, availabilityLoading, sailings, config.rooms]);
  useEffect(() => {
    if (tab !== "availability" || !scheduleId) return;
    const controller = new AbortController();
    loadAllocations(scheduleId, controller.signal) // eslint-disable-line react-hooks/set-state-in-effect -- live inventory read
      .catch(error => { if (!controller.signal.aborted) showToast("error", error instanceof Error ? error.message : "Could not load cabin blocks."); });
    return () => controller.abort();
  }, [scheduleId, tab, showToast, loadAllocations]);

  const changeConfig = (edit: (draft: ShipExperienceConfig) => void) => {
    setConfig(current => { const next = structuredClone(current); edit(next); return next; });
    setDirty(true);
  };
  const changeRoom = (id: string, patch: Partial<RoomDraft>) => {
    setRooms(current => current.map(room => room.id === id ? { ...room, ...patch } : room));
    setDirty(true);
  };
  const changeSlot = (slotId: ShipSlotId, patch: Partial<PlanSlot>) =>
    changeConfig(draft => { Object.assign(draft.rooms.find(item => item.slotId === slotId)!, patch); });
  const spaces = useMemo(() => facilitiesWith(config), [config]);
  const changeSpace = (id: ShipSpaceId, patch: Partial<{ name: string; line: string; visible: boolean }>) =>
    changeConfig(draft => {
      const current = spaces.find(space => space.id === id)!;
      const saved = draft.spaces.find(space => space.id === id);
      const next = { id, name: current.name, line: current.line, visible: current.visible !== false, ...(saved ?? {}), ...patch };
      if (saved) Object.assign(saved, next); else draft.spaces.push(next);
    });

  async function save() {
    setSaving(true);
    try {
      await readResponse(await fetch("/api/admin/ship-experience", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, rooms: rooms.map(room => ({ id: room.id, name: room.name, roomNumber: room.roomNumber || room.id, roomType: room.roomType, description: room.description || "" })) }),
      }));
      setDirty(false);
      showToast("success", "Ship saved. The homepage deck plan shows these changes on its next load.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not save the ship.");
    } finally { setSaving(false); }
  }

  async function changeBlock(roomId: string, allocation?: Allocation) {
    if (!scheduleId) return;
    setWorkingRoom(roomId);
    try {
      if (allocation?.releasable && allocation.blockKey) {
        await readResponse(await fetch("/api/admin/inventory", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ blockKey: allocation.blockKey }) }));
        showToast("success", `${roomId} reopened where no booking occupies it.`);
      } else {
        await readResponse(await fetch("/api/admin/inventory", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ cruiseScheduleId: scheduleId, state: "MANUAL_BLOCK", roomIds: [roomId], reason: "Ship Explorer" }) }));
        showToast("success", `${roomId} closed for this sailing.`);
      }
      await loadAvailability();
      await loadAllocations(scheduleId);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Availability could not be changed.");
    } finally { setWorkingRoom(null); }
  }

  const deck = config.decks.find(item => item.id === deckId)!;
  const deckSlots = config.rooms.filter(slot => SHIP_REGIONS[slot.slotId].deck === deckId);
  const deckSpaces = spaces.filter(space => space.deck === deckId);
  const sailing = sailings.find(item => item.scheduleId === scheduleId);
  const sailingIndex = sailings.findIndex(item => item.scheduleId === scheduleId);
  const cabinOf = (slot: PlanSlot) => rooms.find(item => item.id === slot.roomId);
  const stateOf = (slot: PlanSlot): AtlasState => {
    if (!slot.roomId) return "request";
    if (tab !== "availability" || !sailing) return "unknown";
    return sailing.types.some(type => type.freeCabins.some(cabin => cabin.id === slot.roomId)) ? "open" : "closed";
  };
  const planRooms: AtlasPlanRoom[] = deckSlots.filter(slot => slot.visible).map(slot => ({
    slotId: slot.slotId, label: slot.number, name: cabinOf(slot)?.name || slot.name, state: stateOf(slot),
  }));
  const selectedSlot = selection?.kind === "room" ? config.rooms.find(item => item.slotId === selection.id) : undefined;
  const selectedCabin = selectedSlot ? cabinOf(selectedSlot) : undefined;
  const selectedSpace = selection?.kind === "space" ? spaces.find(item => item.id === selection.id) : undefined;
  const focusId: SpotId | null = hovered ?? (selection?.kind === "space" ? selection.id : selection?.id ?? null);

  function chooseDeck(id: ShipDeckId) { setDeckId(id); setSelection(null); setHovered(null); }
  function pickRoom(id: ShipSlotId) {
    setSelection({ kind: "room", id });
    /* On the bookings map a room opens as on the homepage, saying whether it is booked and by whom. */
    if (tab === "availability") setSheetSlot(id);
  }

  const deckTabs = <div className="sx-admin__deck-tabs" role="group" aria-label="Deck">{SHIP_DECK_IDS.map(id => <button key={id} type="button" aria-pressed={deckId === id} onClick={() => chooseDeck(id)}>{config.decks.find(item => item.id === id)?.name}</button>)}</div>;

  return (
    <div className="sx-admin">
      <div className="sx-admin__head">
        <div>
          <p className="sx-admin__eyebrow">Guest experience / homepage</p>
          <h1>Ship Experience</h1>
          <p>The deck plan on the homepage: every room, space and line of text a guest reads there.</p>
        </div>
        <Link href="/#explore-hathor" target="_blank" rel="noopener noreferrer" className="admin-btn-outline">View on the homepage ↗</Link>
      </div>
      <div className="sx-admin__tabs" role="tablist" aria-label="Ship experience editor">
        <button type="button" role="tab" aria-selected={tab === "layout"} onClick={() => setTab("layout")}>Rooms, spaces & text</button>
        <button type="button" role="tab" aria-selected={tab === "availability"} onClick={() => setTab("availability")}>Bookings on the plan</button>
      </div>

      {loading ? <div className="admin-card sx-admin__loading" role="status">Loading the ship…</div> : null}
      {!loading && editorError ? <div className="admin-card sx-admin__loading" role="alert"><p>The ship editor could not load: {editorError}</p><button type="button" className="admin-btn-outline" onClick={() => void loadEditor()}>Try again</button></div> : null}

      {!loading && !editorError && tab === "layout" ? <fieldset className="sx-admin__editor" disabled={saving}>
        <section className="admin-card sx-admin__workspace">
          <div className="sx-admin__section-head"><div><p>01 / Choose what to edit</p><h2>The deck plan</h2></div><span>Select a numbered room or a lettered space on the plan, or pick it from the lists below.</span></div>
          {deckTabs}
          <AdminPlan deck={deckId} rooms={planRooms} spaces={deckSpaces.filter(space => space.visible !== false)} focusId={focusId}
            selectedId={selection?.kind === "room" ? selection.id : null}
            onRoom={pickRoom} onSpace={id => setSelection({ kind: "space", id })} onFocus={setHovered} />
          {deckSlots.length ? <>
            <p className="sx-admin__list-label">Rooms</p>
            <div className="sx-admin__room-picker" role="group" aria-label="Rooms on this deck">{deckSlots.map(slot => (
              <button type="button" key={slot.slotId} aria-pressed={selection?.kind === "room" && selection.id === slot.slotId} data-hidden={!slot.visible || undefined}
                onClick={() => setSelection({ kind: "room", id: slot.slotId })} onPointerEnter={() => setHovered(slot.slotId)} onPointerLeave={() => setHovered(null)}>
                <strong>{slot.number}</strong><span>{slot.name}</span><small>{slot.roomId ? cabinOf(slot)?.roomType ?? slot.roomId : "Not sold"}{slot.visible ? "" : " · hidden"}</small>
              </button>
            ))}</div>
          </> : null}
          <p className="sx-admin__list-label">Spaces</p>
          <div className="sx-admin__room-picker" role="group" aria-label="Spaces on this deck">{deckSpaces.map(space => (
            <button type="button" key={space.id} aria-pressed={selection?.kind === "space" && selection.id === space.id} data-hidden={space.visible === false || undefined}
              onClick={() => setSelection({ kind: "space", id: space.id })} onPointerEnter={() => setHovered(space.id)} onPointerLeave={() => setHovered(null)}>
              <strong>{facilityMark(space.id)}</strong><span>{space.name}</span><small>{space.kind === "crew" ? "Crew & service" : "Shared space"}{space.visible === false ? " · hidden" : ""}</small>
            </button>
          ))}</div>
        </section>

        {selectedSlot ? <section className="admin-card sx-admin__selected-room" aria-label="Selected room">
          <div className="sx-admin__section-head">
            <div><p>02 / {deck.name} · room {selectedSlot.number}</p><h2>{selectedSlot.name}</h2></div>
            <label className="sx-admin__check"><input type="checkbox" checked={selectedSlot.visible} onChange={event => changeSlot(selectedSlot.slotId, { visible: event.target.checked })} /> Show on the ship map</label>
          </div>
          <p className="sx-admin__group-title">On the ship map</p>
          <div className="sx-admin__fields">
            <label>Number on the plan<input className="admin-input" maxLength={20} value={selectedSlot.number} onChange={event => changeSlot(selectedSlot.slotId, { number: event.target.value })} /></label>
            <label>Room name<input className="admin-input" maxLength={80} value={selectedSlot.name} onChange={event => changeSlot(selectedSlot.slotId, { name: event.target.value })} /></label>
            <label className="sx-admin__wide">Description in the room pop-up<textarea className="admin-input" rows={3} maxLength={600} value={selectedSlot.description} placeholder="Optional. A line guests read when they open this room." onChange={event => changeSlot(selectedSlot.slotId, { description: event.target.value })} /></label>
          </div>
          <p className="sx-admin__group-title">Booking</p>
          <div className="sx-admin__fields">
            <label className="sx-admin__wide">Linked booking cabin<select className="admin-input" value={selectedSlot.roomId || ""} onChange={event => changeSlot(selectedSlot.slotId, { roomId: (event.target.value || null) as PlanSlot["roomId"] })}>
              <option value="">Not sold — shown without booking</option>
              {rooms.map(item => {
                const assigned = config.rooms.find(point => point.roomId === item.id && point.slotId !== selectedSlot.slotId);
                return <option key={item.id} value={item.id} disabled={!!assigned}>{item.id} · {item.roomType}{assigned ? ` — linked to ${assigned.name}` : ""}</option>;
              })}
            </select></label>
            {selectedCabin ? <>
              <label>Cabin name (title in the pop-up)<input className="admin-input" maxLength={80} value={selectedCabin.name} onChange={event => changeRoom(selectedCabin.id, { name: event.target.value })} /></label>
              <label>Booking type<select className="admin-input" value={selectedCabin.roomType || ""} onChange={event => {
                const roomType = event.target.value as PhysicalRoomType;
                /* A cabin named after its type follows the new type; otherwise its pop-up title and photographs would still show the old one. */
                const namedByType = (PHYSICAL_ROOM_TYPES as readonly string[]).includes(selectedCabin.name);
                changeRoom(selectedCabin.id, namedByType ? { roomType, name: roomType } : { roomType });
              }}>{PHYSICAL_ROOM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></label>
              <label>Catalogue number<input className="admin-input" maxLength={20} value={selectedCabin.roomNumber ?? ""} onChange={event => changeRoom(selectedCabin.id, { roomNumber: event.target.value })} /></label>
              <label className="sx-admin__wide">Booking description<textarea className="admin-input" rows={2} maxLength={600} value={selectedCabin.description || ""} onChange={event => changeRoom(selectedCabin.id, { description: event.target.value })} /></label>
            </> : null}
          </div>
          <p className="sx-admin__room-meta">{selectedCabin
            ? `${selectedCabin.sizeSqm} m² · up to ${selectedCabin.capacity} guests. The booking fields change the cabin in the booking system itself; a type can only change while the cabin has no booking history.`
            : "This room is not sold online. Guests see its name on the plan and are asked to contact reservations."}</p>
          <div className="sx-admin__row-actions">
            <Link className="admin-btn-outline" href={`/?ship-room=${encodeURIComponent(selectedSlot.roomId ?? selectedSlot.slotId)}#explore-hathor`} target="_blank" rel="noopener noreferrer">See it on the homepage ↗</Link>
          </div>
        </section> : null}

        {selectedSpace ? <section className="admin-card sx-admin__selected-room" aria-label="Selected space">
          <div className="sx-admin__section-head">
            <div><p>02 / {deck.name} · space {facilityMark(selectedSpace.id)} · {selectedSpace.kind === "crew" ? "crew & service" : "shared space"}</p><h2>{selectedSpace.name}</h2></div>
            <label className="sx-admin__check"><input type="checkbox" checked={selectedSpace.visible !== false} onChange={event => changeSpace(selectedSpace.id, { visible: event.target.checked })} /> Show on the ship map</label>
          </div>
          <div className="sx-admin__fields">
            <label>Name<input className="admin-input" maxLength={60} value={selectedSpace.name} onChange={event => changeSpace(selectedSpace.id, { name: event.target.value })} /></label>
            <label className="sx-admin__wide">Description<textarea className="admin-input" rows={2} maxLength={240} value={selectedSpace.line} onChange={event => changeSpace(selectedSpace.id, { line: event.target.value })} /></label>
          </div>
          <p className="sx-admin__room-meta">{selectedSpace.photoSlot
            ? <>Its photograph is set under <Link href="/admin/content#ship-deck-plan">Website Images → Ship deck plan</Link>, and belongs to this space only.</>
            : "This space opens a close-up of the plan instead of a photograph."}</p>
        </section> : null}

        {!selectedSlot && !selectedSpace ? <section className="admin-card sx-admin__pick-prompt"><h2>Choose a room or a space</h2><p>Its name, description and settings will appear here.</p></section> : null}

        <details className="admin-card sx-admin__deck-settings"><summary>Section text and deck text</summary>
          <p className="sx-admin__group-title">Section</p>
          <div className="sx-admin__fields">
            <label className="sx-admin__wide">Small line above the title<input className="admin-input" maxLength={80} value={config.kicker} onChange={event => changeConfig(draft => { draft.kicker = event.target.value; })} /></label>
            <label className="sx-admin__wide">Title<input className="admin-input" maxLength={80} value={config.title} onChange={event => changeConfig(draft => { draft.title = event.target.value; })} /></label>
            <label className="sx-admin__wide">Lead-in words<input className="admin-input" maxLength={48} value={config.eyebrow} onChange={event => changeConfig(draft => { draft.eyebrow = event.target.value; })} /></label>
            <label className="sx-admin__wide">Introduction<textarea className="admin-input" maxLength={260} rows={2} value={config.introduction} onChange={event => changeConfig(draft => { draft.introduction = event.target.value; })} /></label>
          </div>
          <p className="sx-admin__group-title">{deck.name}</p>
          {deckTabs}
          <div className="sx-admin__fields">
            <label>Deck name<input className="admin-input" maxLength={42} value={deck.name} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.name = event.target.value; })} /></label>
            <label>Deck short line<input className="admin-input" maxLength={90} value={deck.subtitle} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.subtitle = event.target.value; })} /></label>
            <label className="sx-admin__wide">Deck description<textarea className="admin-input" maxLength={220} rows={2} value={deck.description} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.description = event.target.value; })} /></label>
            <label className="sx-admin__check"><input type="checkbox" checked={deck.visible} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.visible = event.target.checked; })} /> Show this deck</label>
          </div>
        </details>
        <div className="sx-admin__save"><p>{rooms.length !== 12 ? `Only ${rooms.length} of 12 booking cabins were found. Restore inventory before saving.` : dirty ? "Unsaved changes" : "Everything is up to date"}</p><button type="button" className="admin-btn-primary" disabled={!dirty || saving || rooms.length !== 12} onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button></div>
      </fieldset> : null}

      {!loading && !editorError && tab === "availability" ? <section className="admin-card sx-admin__availability">
        <div className="sx-admin__section-head"><div><p>Live booking inventory</p><h2>Who is in which room</h2></div><span>The same allocations checkout uses: a booked or closed cabin can never be sold twice. Choose a departure to see it on the plan.</span></div>
        <div className="sx-admin__filters">
          <label>Package<select className="admin-input" value={duration} onChange={event => { setSailings([]); setScheduleId(""); setAllocations([]); setDuration(event.target.value as StayDurationValue); }}>{VOYAGES.map(voyage => <option key={voyage.id} value={voyage.id}>{voyage.name}</option>)}</select></label>
          <label>From month<input className="admin-input" type="month" min={new Date().toISOString().slice(0, 7)} max={`${bookingHorizonYear()}-12`} value={month} onChange={event => { if (!event.target.value) return; setSailings([]); setScheduleId(""); setAllocations([]); setMonth(event.target.value); }} /></label>
          <label>Departure<select className="admin-input" value={scheduleId} onChange={event => setScheduleId(event.target.value)} disabled={availabilityLoading || !sailings.length}>{sailings.length ? sailings.map(item => <option key={item.scheduleId} value={item.scheduleId}>{dayLabel(item.departureTime)}{item.soldOut ? " · full" : ""}</option>) : <option value="">No sailing in this period</option>}</select></label>
        </div>
        {sailings.length > 1 ? <div className="sx-admin__stepper" role="group" aria-label="Switch departure">
          <button type="button" disabled={sailingIndex <= 0} onClick={() => setScheduleId(sailings[sailingIndex - 1].scheduleId)}>← Previous departure</button>
          <button type="button" disabled={sailingIndex < 0 || sailingIndex >= sailings.length - 1} onClick={() => setScheduleId(sailings[sailingIndex + 1].scheduleId)}>Next departure →</button>
        </div> : null}
        {availabilityLoading ? <p role="status">Checking live inventory…</p> : !sailing ? <p>No sailing to manage in this period. Choose a later month above.</p> : <>
          <p className="sx-admin__sailing">{rangeLabel(sailing.departureTime, sailing.arrivalTime)} · {sailing.availableCabins} of {sailing.types.reduce((sum, type) => sum + type.totalCabins, 0)} cabins free</p>
          {deckTabs}
          <AdminPlan deck={deckId} rooms={planRooms} spaces={deckSpaces.filter(space => space.visible !== false)} focusId={hovered ?? (selection?.kind === "room" ? selection.id : null)}
            selectedId={selection?.kind === "room" ? selection.id : null} onRoom={pickRoom} legend
            onSpace={id => { setTab("layout"); setSelection({ kind: "space", id }); }} onFocus={setHovered} />
          <div className="sx-admin__availability-grid">{config.rooms.filter(slot => slot.roomId && SHIP_REGIONS[slot.slotId].deck === deckId).map(slot => {
            const cabin = cabinOf(slot);
            const roomId = slot.roomId!;
            const open = sailing.types.some(type => type.freeCabins.some(item => item.id === roomId));
            const allocation = allocations.find(item => item.roomId === roomId);
            return <div key={slot.slotId} id={`sx-row-${slot.slotId}`} className="sx-admin__availability-row" data-selected={selection?.kind === "room" && selection.id === slot.slotId || undefined}
              onPointerEnter={() => setHovered(slot.slotId)} onPointerLeave={() => setHovered(null)}>
              <div><strong>{slot.number} · {roomId}</strong><span>{slot.name}</span><small>{cabin?.roomType}</small></div>
              <p data-state={open ? "open" : "closed"}>{open ? "Free" : "Booked"}</p>
              {!open ? <p className="sx-admin__taken">{takenBy(allocation)}{allocation ? ` · ${rangeLabel(allocation.startsAt, allocation.endsAt)}` : ""}</p> : null}
              <div className="sx-admin__row-actions">
                {open ? <button type="button" disabled={workingRoom !== null} onClick={() => void changeBlock(roomId)}>Close this date</button>
                  : allocation?.releasable ? <button type="button" disabled={workingRoom !== null} onClick={() => void changeBlock(roomId, allocation)}>Reopen</button>
                  : <span className="sx-admin__locked">Held by a booking or another closure</span>}
                {allocation?.bookingId ? <Link href={`/admin/bookings/${allocation.bookingId}`}>Open the booking</Link> : null}
              </div>
            </div>;
          })}</div>
          {(() => {
            const slot = sheetSlot ? config.rooms.find(item => item.slotId === sheetSlot) : undefined;
            const roomId = slot?.roomId ?? null;
            const openHere = roomId ? sailing.types.some(type => type.freeCabins.some(item => item.id === roomId)) : null;
            return <AdminRoomSheet slot={slot} cabin={slot ? cabinOf(slot) : undefined}
              deckName={slot ? config.decks.find(item => item.id === SHIP_REGIONS[slot.slotId].deck)?.name ?? "" : ""}
              sailing={sailing} allocation={roomId ? allocations.find(item => item.roomId === roomId) : undefined}
              open={slot && roomId ? openHere : null} working={workingRoom !== null}
              onClose={() => setSheetSlot(null)} onBlock={(id, allocation) => void changeBlock(id, allocation)} />;
          })()}
          <p className="sx-admin__footnote">Closures are date-specific and checked against overlapping voyages. An existing booking or hold always takes priority, and a closure made elsewhere in the dashboard can only be reopened where it was made.</p>
        </>}
      </section> : null}
    </div>
  );
}
