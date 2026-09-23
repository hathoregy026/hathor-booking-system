"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapArtwork } from "@/components/home/ShipExperience";
import { useToast } from "@/components/admin/ToastProvider";
import type { SailingAvailability } from "@/lib/availability-service";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import type { ShipRoom } from "@/lib/ship-experience";
import {
  DEFAULT_SHIP_EXPERIENCE,
  SHIP_DECK_IDS,
  type ShipDeckId,
  type ShipExperienceConfig,
} from "@/lib/ship-experience-shared";
import { PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";
import "./ship-experience.css";

type RoomDraft = Pick<ShipRoom, "id" | "name" | "roomNumber" | "roomType" | "description" | "capacity" | "sizeSqm">;
type Allocation = { roomId: string; state: string; blockKey: string | null; reason: string | null; releasable: boolean };
type Target = { kind: "room" | "space"; id: string } | null;

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
  const [target, setTarget] = useState<Target>(null);
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
  const mapRef = useRef<HTMLDivElement>(null);

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
  const deckRooms = config.rooms.filter(point => point.deckId === deckId).map(point => ({ point, room: rooms.find(room => room.id === point.roomId) })).filter(entry => entry.room);
  const deckSpaces = config.spaces.filter(space => space.deckId === deckId);
  const sailing = sailings.find(item => item.scheduleId === scheduleId);

  function placeOnMap(event: React.MouseEvent<HTMLDivElement>) {
    if (!target || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, Math.round(((event.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(8, Math.min(92, Math.round(((event.clientY - rect.top) / rect.height) * 100)));
    changeConfig(draft => {
      const point = target.kind === "room" ? draft.rooms.find(room => room.roomId === target.id) : draft.spaces.find(space => space.id === target.id);
      if (point) { point.x = x; point.y = y; }
    });
  }

  return (
    <div className="sx-admin">
      <div className="sx-admin__head"><div><p className="sx-admin__eyebrow">Guest experience / homepage</p><h1>Ship Experience</h1><p>Arrange the decks and cabins guests see, then manage real sailing availability.</p></div><Link href="/#home-three-story" target="_blank" rel="noopener noreferrer" className="admin-btn-outline">View homepage ↗</Link></div>
      <div className="sx-admin__tabs" role="tablist" aria-label="Ship experience editor"><button type="button" role="tab" aria-selected={tab === "layout"} onClick={() => setTab("layout")}>Decks & rooms</button><button type="button" role="tab" aria-selected={tab === "availability"} onClick={() => setTab("availability")}>Sailing availability</button></div>

      {loading ? <div className="admin-card sx-admin__loading" role="status">Loading the ship…</div> : null}
      {!loading && editorError ? <div className="admin-card sx-admin__loading" role="alert"><p>The ship editor could not load: {editorError}</p><button type="button" className="admin-btn-outline" onClick={() => void loadEditor()}>Try again</button></div> : null}
      {!loading && !editorError && tab === "layout" ? <>
        <section className="admin-card sx-admin__intro"><div className="sx-admin__section-head"><div><p>01 / Editorial copy</p><h2>The invitation</h2></div></div><div className="sx-admin__fields sx-admin__fields--three"><label>Eyebrow<input className="admin-input" maxLength={48} value={config.eyebrow} onChange={event => changeConfig(draft => { draft.eyebrow = event.target.value; })} /></label><label>Title<input className="admin-input" maxLength={80} value={config.title} onChange={event => changeConfig(draft => { draft.title = event.target.value; })} /></label><label className="sx-admin__wide">Introduction<textarea className="admin-input" maxLength={260} rows={2} value={config.introduction} onChange={event => changeConfig(draft => { draft.introduction = event.target.value; })} /></label></div></section>
        <section className="admin-card sx-admin__workspace"><div className="sx-admin__section-head"><div><p>02 / Spatial editor</p><h2>Deck plan</h2></div><span>These positions are illustrative. Tap a marker, then tap the plan to move it.</span></div><div className="sx-admin__deck-tabs" role="group" aria-label="Edit deck">{SHIP_DECK_IDS.map(id => <button key={id} type="button" aria-pressed={deckId === id} onClick={() => { setDeckId(id); setTarget(null); }}>{config.decks.find(item => item.id === id)?.name}</button>)}</div><div className="sx-admin__deck-grid"><div className="sx-admin__plan"><div ref={mapRef} className="sx-admin__map" onClick={placeOnMap}><MapArtwork deck={deckId} />{deckRooms.map(({ point, room }) => <button key={point.roomId} type="button" className="sx-admin__pin" aria-pressed={target?.kind === "room" && target.id === point.roomId} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={event => { event.stopPropagation(); setTarget({ kind: "room", id: point.roomId }); }}>{point.label || room?.roomNumber || point.roomId}</button>)}{deckSpaces.map(space => <button key={space.id} type="button" className="sx-admin__pin sx-admin__pin--space" aria-pressed={target?.kind === "space" && target.id === space.id} style={{ left: `${space.x}%`, top: `${space.y}%` }} onClick={event => { event.stopPropagation(); setTarget({ kind: "space", id: space.id }); }}>{space.name}</button>)}</div><p className="sx-admin__map-hint">Select a marker, then click or tap the plan to reposition it. Positions are saved only when you press Save changes.</p></div><div className="sx-admin__deck-copy"><label>Deck name<input className="admin-input" maxLength={42} value={deck.name} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.name = event.target.value; })} /></label><label>Short line<input className="admin-input" maxLength={90} value={deck.subtitle} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.subtitle = event.target.value; })} /></label><label>Description<textarea className="admin-input" maxLength={220} rows={3} value={deck.description} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.description = event.target.value; })} /></label><label className="sx-admin__check"><input type="checkbox" checked={deck.visible} onChange={event => changeConfig(draft => { draft.decks.find(item => item.id === deckId)!.visible = event.target.checked; })} /> Show this deck on the website</label></div></div></section>
        <section className="admin-card sx-admin__inventory"><div className="sx-admin__section-head"><div><p>03 / Physical cabins</p><h2>Rooms on {deck.name}</h2></div><span>Details here update the live room catalog. Booking capacity follows the selected physical type.</span></div><div className="sx-admin__room-grid">{deckRooms.map(({ point, room }) => room ? <div key={room.id} className="sx-admin__room"><div className="sx-admin__room-top"><strong>{room.id}</strong><label className="sx-admin__check"><input type="checkbox" checked={point.visible} onChange={event => changeConfig(draft => { draft.rooms.find(item => item.roomId === room.id)!.visible = event.target.checked; })} /> Show on map</label></div><div className="sx-admin__fields"><label>Number<input className="admin-input" maxLength={20} value={room.roomNumber || ""} onChange={event => changeRoom(room.id, { roomNumber: event.target.value })} /></label><label>Name<input className="admin-input" maxLength={80} value={room.name} onChange={event => changeRoom(room.id, { name: event.target.value })} /></label><label>Booking type<select className="admin-input" value={room.roomType || ""} onChange={event => changeRoom(room.id, { roomType: event.target.value as PhysicalRoomType })}>{PHYSICAL_ROOM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select></label><label>Map label<input className="admin-input" maxLength={30} value={point.label} placeholder="Uses room number if blank" onChange={event => changeConfig(draft => { draft.rooms.find(item => item.roomId === room.id)!.label = event.target.value; })} /></label><label>Deck<select className="admin-input" value={point.deckId} onChange={event => changeConfig(draft => { draft.rooms.find(item => item.roomId === room.id)!.deckId = event.target.value as ShipDeckId; })}>{config.decks.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="sx-admin__wide">Description<textarea className="admin-input" maxLength={600} rows={2} value={room.description || ""} onChange={event => changeRoom(room.id, { description: event.target.value })} /></label></div><p className="sx-admin__room-meta">{room.sizeSqm} m² · up to {room.capacity} guests · position {point.x}% / {point.y}%</p></div> : null)}</div></section>
        <section className="admin-card sx-admin__inventory"><div className="sx-admin__section-head"><div><p>04 / Guest spaces</p><h2>Places on {deck.name}</h2></div><button type="button" className="admin-btn-outline" disabled={config.spaces.length >= 24} onClick={() => { const id = `space-${Date.now().toString(36)}`; changeConfig(draft => { draft.spaces.push({ id, deckId, name: "New place", description: "Describe this onboard space.", x: 50, y: 50, visible: true }); }); setTarget({ kind: "space", id }); }}>+ Add place</button></div><div className="sx-admin__space-grid">{deckSpaces.map(space => <div key={space.id} className="sx-admin__space"><label>Name<input className="admin-input" maxLength={45} value={space.name} onChange={event => changeConfig(draft => { draft.spaces.find(item => item.id === space.id)!.name = event.target.value; })} /></label><label>Description<textarea className="admin-input" maxLength={220} rows={2} value={space.description} onChange={event => changeConfig(draft => { draft.spaces.find(item => item.id === space.id)!.description = event.target.value; })} /></label><div className="sx-admin__space-actions"><label className="sx-admin__check"><input type="checkbox" checked={space.visible} onChange={event => changeConfig(draft => { draft.spaces.find(item => item.id === space.id)!.visible = event.target.checked; })} /> Show</label><select className="admin-input" aria-label={`Deck for ${space.name}`} value={space.deckId} onChange={event => changeConfig(draft => { draft.spaces.find(item => item.id === space.id)!.deckId = event.target.value as ShipDeckId; })}>{config.decks.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="button" onClick={() => { if (window.confirm(`Remove ${space.name} from the ship map?`)) changeConfig(draft => { draft.spaces = draft.spaces.filter(item => item.id !== space.id); }); }}>Remove</button></div></div>)}</div></section>
        <div className="sx-admin__save"><p>{rooms.length !== 12 ? `Only ${rooms.length} of 12 physical cabins were found. Restore inventory before saving.` : dirty ? "Unsaved changes" : "Everything is up to date"}</p><button type="button" className="admin-btn-primary" disabled={!dirty || saving || rooms.length !== 12} onClick={() => void save()}>{saving ? "Saving…" : "Save changes"}</button></div>
      </> : null}

      {!loading && !editorError && tab === "availability" ? <section className="admin-card sx-admin__availability"><div className="sx-admin__section-head"><div><p>Live booking inventory</p><h2>Close or reopen a cabin</h2></div><span>These controls use the same allocations as checkout. Existing bookings cannot be reopened here.</span></div><div className="sx-admin__filters"><label>Package<select className="admin-input" value={duration} onChange={event => { setSailings([]); setScheduleId(""); setAllocations([]); setDuration(event.target.value as StayDurationValue); }}>{VOYAGES.map(voyage => <option key={voyage.id} value={voyage.id}>{voyage.name}</option>)}</select></label><label>From month<input className="admin-input" type="month" min={new Date().toISOString().slice(0, 7)} max={`${bookingHorizonYear()}-12`} value={month} onChange={event => { if (!event.target.value) return; setSailings([]); setScheduleId(""); setAllocations([]); setMonth(event.target.value); }} /></label><label>Departure<select className="admin-input" value={scheduleId} onChange={event => setScheduleId(event.target.value)} disabled={availabilityLoading || !sailings.length}>{sailings.length ? sailings.map(item => <option key={item.scheduleId} value={item.scheduleId}>{new Date(item.departureTime).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</option>) : <option value="">No sailing in this period</option>}</select></label></div>{availabilityLoading ? <p role="status">Checking live inventory…</p> : !sailing ? <p>No sailing to manage in this period. Choose a later month above.</p> : <div className="sx-admin__availability-grid">{rooms.map(room => { const open = sailing.types.some(type => type.freeCabins.some(cabin => cabin.id === room.id)); const allocation = allocations.find(item => item.roomId === room.id); return <div key={room.id} className="sx-admin__availability-row"><div><strong>{room.roomNumber || room.id}</strong><span>{room.name}</span><small>{room.roomType}</small></div><p data-state={open ? "open" : "closed"}>{open ? "Open" : allocation?.releasable ? "Blocked here" : "Unavailable"}</p>{open ? <button type="button" disabled={workingRoom !== null} onClick={() => void changeBlock(room.id)}>Block this date</button> : allocation?.releasable ? <button type="button" disabled={workingRoom !== null} onClick={() => void changeBlock(room.id, allocation)}>Reopen</button> : <span className="sx-admin__locked">Managed by booking or another block</span>}</div>; })}</div>}<p className="sx-admin__footnote">Availability changes are date-specific and checked against overlapping voyages. An existing booking or hold always takes priority.</p></section> : null}
    </div>
  );
}
