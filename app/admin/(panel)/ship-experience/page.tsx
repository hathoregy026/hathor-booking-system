"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ShipDeckPlan } from "@/components/ship/ShipDeckPlan";
import { useToast } from "@/components/admin/ToastProvider";
import type { SailingAvailability } from "@/lib/availability-service";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import type { ShipRoom } from "@/lib/ship-experience";
import {
  DEFAULT_SHIP_EXPERIENCE,
  SHIP_DECK_IDS,
  SHIP_REGIONS,
  type ShipSlotId,
  type ShipDeckId,
  type ShipExperienceConfig,
} from "@/lib/ship-experience-shared";
import { PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";
import "./ship-experience.css";

type RoomDraft = Pick<ShipRoom, "id" | "name" | "roomNumber" | "roomType" | "description" | "capacity" | "sizeSqm">;
type Allocation = { roomId: string; state: string; blockKey: string | null; reason: string | null; releasable: boolean };

const VOYAGES: { id: StayDurationValue; name: string }[] = [
  { id: "3-nights-aswan-luxor", name: "3 nights · Aswan–Luxor" },
  { id: "4-nights-luxor-aswan", name: "4 nights · Luxor–Aswan" },
  { id: "7-nights-luxor-aswan-luxor", name: "7 nights · Round trip" },
];

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload as T;
}

export default function ShipExperienceAdminPage() {
  const { showToast } = useToast();
  const [config, setConfig] = useState<ShipExperienceConfig>(DEFAULT_SHIP_EXPERIENCE);
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [tab, setTab] = useState<"layout" | "availability">("layout");
  const [deckId, setDeckId] = useState<ShipDeckId>("lower");
  const [target, setTarget] = useState<ShipSlotId | null>(null);
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
      const payload = await readResponse<{ sailings: SailingAvailability[] }>(await fetch(`/api/ship-experience?duration=${encodeURIComponent(duration)}&month=${encodeURIComponent(month)}`, { cache: "no-store" }));
      setSailings(payload.sailings);
      setScheduleId(current => payload.sailings.some(sailing => sailing.scheduleId === current) ? current : payload.sailings[0]?.scheduleId ?? "");
    } catch (error) {
      setSailings([]);
      setScheduleId("");
      setAllocations([]);
      showToast("error", error instanceof Error ? error.message : "Could not load availability.");
    } finally { setAvailabilityLoading(false); }
  }, [duration, month, showToast]);

  useEffect(() => { if (tab === "availability" && !editorError) void loadAvailability(); }, [tab, editorError, loadAvailability]); // eslint-disable-line react-hooks/set-state-in-effect -- live inventory read
  useEffect(() => {
    if (tab !== "availability" || !scheduleId) return;
    const controller = new AbortController();
    fetch(`/api/admin/inventory?cruiseScheduleId=${encodeURIComponent(scheduleId)}`, { cache: "no-store", signal: controller.signal })
      .then(readResponse<{ allocations: Allocation[] }>)
      .then(payload => setAllocations(payload.allocations))
      .catch(error => { if (!controller.signal.aborted) showToast("error", error instanceof Error ? error.message : "Could not load cabin blocks."); });
    return () => controller.abort();
  }, [scheduleId, tab, showToast]);

  const changeConfig = (edit: (draft: ShipExperienceConfig) => void) => {
    setConfig(current => { const next = structuredClone(current); edit(next); return next; });
    setDirty(true);
  };
  const changeRoom = (id: string, patch: Partial<RoomDraft>) => {
    setRooms(current => current.map(room => room.id === id ? { ...room, ...patch } : room));
    setDirty(true);
  };

  async function save() {
    setSaving(true);
    try {
      await readResponse(await fetch("/api/admin/ship-experience", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, rooms: rooms.map(room => ({ id: room.id, name: room.name, roomNumber: room.roomNumber || room.id, roomType: room.roomType, description: room.description || "" })) }),
      }));
      setDirty(false);
      showToast("success", "Ship experience saved. The public map reads these changes on its next load.");
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Could not save ship experience.");
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
        showToast("success", `${roomId} blocked for this sailing.`);
      }
      await loadAvailability();
      const payload = await readResponse<{ allocations: Allocation[] }>(await fetch(`/api/admin/inventory?cruiseScheduleId=${encodeURIComponent(scheduleId)}`, { cache: "no-store" }));
      setAllocations(payload.allocations);
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Availability could not be changed.");
    } finally { setWorkingRoom(null); }
  }

  const deck = config.decks.find(item => item.id === deckId)!;
  const deckSlots = config.rooms.filter(slot => SHIP_REGIONS[slot.slotId].deck === deckId);
  const slot = deckSlots.find(item => item.slotId === target);
  const room = slot ? rooms.find(item => item.id === slot.roomId) : undefined;
  const sailing = sailings.find(item => item.scheduleId === scheduleId);
  const planRooms = deckSlots.map(item => {
    const cabin = rooms.find(entry => entry.id === item.roomId);
    return { slotId: item.slotId, name: cabin?.name || item.name, number: cabin?.roomNumber || item.number, state: "unknown" as const };
  });
  function changeSlot(patch: Partial<ShipExperienceConfig["rooms"][number]>) {
    if (target) changeConfig(draft => { Object.assign(draft.rooms.find(item => item.slotId === target)!, patch); });
  }

  return (
    <div className="sx-admin">
      <div className="sx-admin__head"><div><p className="sx-admin__eyebrow">Guest experience / homepage</p><h1>Ship Experience</h1><p>Select a room on the furnished plan to edit its name, number and booking connection.</p></div><Link href="/#explore-hathor" target="_blank" rel="noopener noreferrer" className="admin-btn-outline">View homepage ↗</Link></div>
      <div className="sx-admin__tabs" role="tablist" aria-label="Ship experience editor"><button type="button" role="tab" aria-selected={tab === "layout"} onClick={() => setTab("layout")}>Decks & rooms</button><button type="button" role="tab" aria-selected={tab === "availability"} onClick={() => setTab("availability")}>Sailing availability</button></div>

      {loading ? <div className="admin-card sx-admin__loading" role="status">Loading the ship…</div> : null}
      {!loading && editorError ? <div className="admin-card sx-admin__loading" role="alert"><p>The ship editor could not load: {editorError}</p><button type="button" className="admin-btn-outline" onClick={() => void loadEditor()}>Try again</button></div> : null}
      {!loading && !editorError && tab === "layout" ? <fieldset className="sx-admin__editor" disabled={saving}>
        <section className="admin-card sx-admin__workspace">
          <div className="sx-admin__section-head"><div><p>01 / Select a room</p><h2>The furnished deck plan</h2></div><span>Only rooms are editable. Furniture, pools, dining and service areas are fixed visual context.</span></div>
          <div className="sx-admin__deck-tabs" role="group" aria-label="Edit deck">{SHIP_DECK_IDS.map(id => <button key={id} type="button" aria-pressed={deckId === id} onClick={() => { setDeckId(id); setTarget(null); }}>{config.decks.find(item => item.id === id)?.name}</button>)}</div>
          <div className="sx-admin__map"><ShipDeckPlan key={deckId} deck={deckId} rooms={planRooms} selected={target} onSelect={setTarget} /></div>
          <div className="sx-admin__room-picker" role="group" aria-label="Select room to edit">{planRooms.map(item => <button type="button" key={item.slotId} aria-pressed={target === item.slotId} onClick={() => setTarget(item.slotId)}><strong>{item.number}</strong><span>{item.name}</span></button>)}</div>
          <p className="sx-admin__map-hint">{deckId === "sun" ? "There are no guest rooms on the sun deck. This is a visual-only deck." : "Click a room above, or choose it from the list. The editor below updates that exact room."}</p>
        </section>

        {slot ? <section className="admin-card sx-admin__selected-room" aria-label="Selected room editor">
          <div className="sx-admin__section-head"><div><p>02 / Edit selected room · {SHIP_REGIONS[slot.slotId].name} on the reference plan</p><h2>{room?.name || slot.name}</h2></div><label className="sx-admin__check"><input type="checkbox" checked={slot.visible} onChange={event => changeSlot({ visible: event.target.checked })} /> Show room on homepage</label></div>
          <div className="sx-admin__fields">
            <label>Room number<input className="admin-input" maxLength={20} value={room ? room.roomNumber ?? "" : slot.number} onChange={event => room ? changeRoom(room.id, { roomNumber: event.target.value }) : changeSlot({ number: event.target.value })} /></label>
            <label>Room name<input className="admin-input" maxLength={80} value={room?.name ?? slot.name} onChange={event => room ? changeRoom(room.id, { name: event.target.value }) : changeSlot({ name: event.target.value })} /></label>
            <label className="sx-admin__wide">Description<textarea className="admin-input" rows={3} maxLength={600} value={room ? room.description || "" : slot.description} onChange={event => room ? changeRoom(room.id, { description: event.target.value }) : changeSlot({ description: event.target.value })} /></label>
            <label>Linked booking cabin<select className="admin-input" value={slot.roomId || ""} onChange={event => {
              const roomId = event.target.value as ShipExperienceConfig["rooms"][number]["roomId"] || null;
              changeSlot({ roomId, ...(room ? { name: room.name, number: room.roomNumber || room.id, description: room.description || "" } : {}) });
            }}><option value="">Not linked — contact reservations only</option>{rooms.map(item => {
              const assigned = config.rooms.find(point => point.roomId === item.id && point.slotId !== slot.slotId);
              return <option key={item.id} value={item.id} disabled={!!assigned}>{item.id} · {item.name}{assigned ? ` — used by ${SHIP_REGIONS[assigned.slotId].name}` : ""}</option>;
            })}</select></label>
            {room ? <label>Booking type<select className="admin-input" value={room.roomType || ""} onChange={event => changeRoom(room.id, { roomType: event.target.value as PhysicalRoomType })}>{PHYSICAL_ROOM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></label> : null}
          </div>
          <p className="sx-admin__room-meta">{room ? `${room.sizeSqm} m² · up to ${room.capacity} guests. These details update the existing cabin catalog and exact-cabin booking journey.` : "This illustrated room is not linked to booking inventory. Guests can view its name and contact reservations, but cannot reserve it online."}</p>
          <p className="sx-admin__footnote">A physical cabin can appear in only one place. To move a cabin, unlink its current plan room first, then link it here. This never creates an extra cabin.</p>
        </section> : deckSlots.length ? <section className="admin-card sx-admin__pick-prompt"><h2>Choose a room to edit</h2><p>Its name, number, description and booking connection will appear here.</p></section> : null}

        <details className="admin-card sx-admin__deck-settings"><summary>Deck title and homepage introduction</summary>
          <div className="sx-admin__fields">
            <label>Deck name<input className="admin-input" maxLength={42} value={deck.name} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.name = event.target.value; })} /></label>
            <label>Deck short line<input className="admin-input" maxLength={90} value={deck.subtitle} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.subtitle = event.target.value; })} /></label>
            <label className="sx-admin__wide">Deck description<textarea className="admin-input" maxLength={220} rows={2} value={deck.description} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.description = event.target.value; })} /></label>
            <label className="sx-admin__check"><input type="checkbox" checked={deck.visible} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.visible = event.target.checked; })} /> Show this deck</label>
            <label className="sx-admin__wide">Homepage eyebrow<input className="admin-input" maxLength={48} value={config.eyebrow} onChange={event => changeConfig(draft => { draft.eyebrow = event.target.value; })} /></label>
            <label className="sx-admin__wide">Homepage title<input className="admin-input" maxLength={80} value={config.title} onChange={event => changeConfig(draft => { draft.title = event.target.value; })} /></label>
            <label className="sx-admin__wide">Introduction<textarea className="admin-input" maxLength={260} rows={2} value={config.introduction} onChange={event => changeConfig(draft => { draft.introduction = event.target.value; })} /></label>
          </div>
        </details>
        <p className="sx-admin__footnote">The supplied plans show 13 guest rooms; the catalog currently has 12 physical cabins. Room 9 starts unlinked. Confirm cabin assignments before publishing.</p>
        <div className="sx-admin__save"><p>{rooms.length !== 12 ? `Only ${rooms.length} of 12 physical cabins were found. Restore inventory before saving.` : dirty ? "Unsaved changes" : "Everything is up to date"}</p><button type="button" className="admin-btn-primary" disabled={!dirty || saving || rooms.length !== 12} onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button></div>
      </fieldset> : null}

      {!loading && !editorError && tab === "availability" ? <section className="admin-card sx-admin__availability"><div className="sx-admin__section-head"><div><p>Live booking inventory</p><h2>Close or reopen a cabin</h2></div><span>These controls use the same allocations as checkout. Existing bookings cannot be reopened here.</span></div><div className="sx-admin__filters"><label>Package<select className="admin-input" value={duration} onChange={event => { setSailings([]); setScheduleId(""); setAllocations([]); setDuration(event.target.value as StayDurationValue); }}>{VOYAGES.map(voyage => <option key={voyage.id} value={voyage.id}>{voyage.name}</option>)}</select></label><label>From month<input className="admin-input" type="month" min={new Date().toISOString().slice(0, 7)} max={`${bookingHorizonYear()}-12`} value={month} onChange={event => { if (!event.target.value) return; setSailings([]); setScheduleId(""); setAllocations([]); setMonth(event.target.value); }} /></label><label>Departure<select className="admin-input" value={scheduleId} onChange={event => setScheduleId(event.target.value)} disabled={availabilityLoading || !sailings.length}>{sailings.length ? sailings.map(item => <option key={item.scheduleId} value={item.scheduleId}>{new Date(item.departureTime).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</option>) : <option value="">No sailing in this period</option>}</select></label></div>{availabilityLoading ? <p role="status">Checking live inventory…</p> : !sailing ? <p>No sailing to manage in this period. Choose a later month above.</p> : <div className="sx-admin__availability-grid">{rooms.map(room => { const open = sailing.types.some(type => type.freeCabins.some(cabin => cabin.id === room.id)); const allocation = allocations.find(item => item.roomId === room.id); return <div key={room.id} className="sx-admin__availability-row"><div><strong>{room.roomNumber || room.id}</strong><span>{room.name}</span><small>{room.roomType}</small></div><p data-state={open ? "open" : "closed"}>{open ? "Open" : allocation?.releasable ? "Blocked here" : "Unavailable"}</p>{open ? <button type="button" disabled={workingRoom !== null} onClick={() => void changeBlock(room.id)}>Block this date</button> : allocation?.releasable ? <button type="button" disabled={workingRoom !== null} onClick={() => void changeBlock(room.id, allocation)}>Reopen</button> : <span className="sx-admin__locked">Managed by booking or another block</span>}</div>; })}</div>}<p className="sx-admin__footnote">Availability changes are date-specific and checked against overlapping voyages. An existing booking or hold always takes priority.</p></section> : null}
    </div>
  );
}
