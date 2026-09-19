"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { buildCabinSlug } from "@/lib/selection-catalog";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { itineraryFor } from "@/lib/booking-itineraries";
import { roomCapacity, type PhysicalRoomType } from "@/lib/physical-inventory";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  cabinCountOptions,
  cabinLabel,
  guestLabel,
  occupants,
  shortName,
  slotId,
  type Arrangement,
  type Guest,
  type GuestKind,
  type Offers,
} from "./allocation";
import type { DragState } from "./useGuestDrag";
import { money, plural, type Sailing } from "./model";
import { ArrangeChooser, CountMenu, Counter, DragGhost, GuestTile, RESIDENCE_SLUG } from "./SuitesParts";
import {
  IconBath,
  IconBed,
  IconCheck,
  IconChevron,
  IconClose,
  IconGuests,
  IconLink,
  IconSize,
  IconView,
  IconWand,
  IconWifi,
} from "./icons";

type Notice = { tone: "ok" | "warn"; text: string } | null;

/** Everything the board needs from the Guests & Suites screen, which owns the placement logic. */
export type BoardContext = {
  duration: StayDurationValue;
  voyageTitle: string;
  sailing: Sailing;
  sailingDate: string;
  offers: Offers;
  guests: Guest[];
  adults: number;
  childCount: number;
  onCounts: (adults: number, children: number) => void;
  arrangement: Arrangement;
  waiting: Guest[];
  pickedGuest: Guest | null;
  placedIn: (guestId: string) => string | null;
  notice: Notice;
  setNotice: (notice: Notice) => void;
  drag: DragState | null;
  tileProps: (guest: Guest) => Parameters<typeof GuestTile>[0];
  drop: (guestId: string, target: string) => void;
  choose: (cabinId: string, kind: GuestKind, count: number) => void;
  clear: (cabinId: string) => void;
  choosing: boolean;
  setChoosing: (open: boolean) => void;
  arrange: (types: PhysicalRoomType[]) => string | null;
  preferredType: PhysicalRoomType | null;
  issues: string[];
  busy: boolean;
  onContinue: () => void;
  onBack: () => void;
  alert: string | null;
  verifyCabinType: (roomType: PhysicalRoomType) => Promise<string | null>;
};

/** What each type offers, from the room pages' own facts. The size comes from the live availability. */
const STORY: Record<PhysicalRoomType, { tagline: string; features: (size: number) => { icon: ReactNode; text: string }[] }> = {
  "Luxury King Cabin": {
    tagline: "A calm retreat for two.",
    features: size => [
      { icon: <IconBed />, text: "King bed" },
      { icon: <IconSize />, text: `${size} m²` },
      { icon: <IconView />, text: "Panoramic Nile view" },
      { icon: <IconGuests />, text: "Up to 2 guests" },
      { icon: <IconLink />, text: "Connected cabins available" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
  "Luxury Twin Cabin": {
    tagline: "Twin beds and wide Nile glass.",
    features: size => [
      { icon: <IconBed />, text: "Twin beds" },
      { icon: <IconSize />, text: `${size} m²` },
      { icon: <IconView />, text: "Panoramic Nile view" },
      { icon: <IconGuests />, text: "Up to 2 guests" },
      { icon: <IconLink />, text: "Connected cabins available" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
  "Luxury Suite": {
    tagline: "Generous space and a private Jacuzzi.",
    features: size => [
      { icon: <IconBath />, text: "Private Jacuzzi" },
      { icon: <IconSize />, text: `${size} m² with a separate lounge` },
      { icon: <IconView />, text: "Panoramic Nile view" },
      { icon: <IconGuests />, text: "Up to 4 guests" },
      { icon: <IconLink />, text: "Wide walkways for easy movement" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
  "Royal Suite": {
    tagline: "Hathor’s most spacious residence.",
    features: size => [
      { icon: <IconView />, text: "Private balcony on the Main Deck" },
      { icon: <IconBath />, text: "Two bathrooms" },
      { icon: <IconSize />, text: `${size} m² with a private lounge` },
      { icon: <IconGuests />, text: "Up to 4 guests" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
};

/** The type to open first: the one the guest came for, else one already holding guests, else the first free one. */
function firstType(ctx: BoardContext): PhysicalRoomType {
  const types = ctx.sailing.types;
  if (ctx.preferredType && types.some(type => type.roomType === ctx.preferredType)) return ctx.preferredType;
  const used = ctx.arrangement.cabins[0]?.roomType;
  if (used) return used;
  return (types.find(type => type.availableCabins > 0) ?? types[0]).roomType;
}

export function SuitesBoard({ ctx }: { ctx: BoardContext }) {
  const { sailing, arrangement, guests, drag, pickedGuest } = ctx;
  const [activeType, setActiveType] = useState<PhysicalRoomType>(() => firstType(ctx));
  const [photo, setPhoto] = useState<{ type: PhysicalRoomType; index: number }>({ type: activeType, index: 0 });
  // Dragging a guest over a cabin type opens it, so its cabins are there to drop on.
  const [lastOver, setLastOver] = useState<string | null>(null);
  const over = drag?.over ?? null;
  if (over !== lastOver) {
    setLastOver(over);
    if (over?.startsWith("type:")) setActiveType(over.slice(5) as PhysicalRoomType);
  }

  const voyage = itineraryFor(ctx.duration);
  const type = sailing.types.find(entry => entry.roomType === activeType) ?? sailing.types[0];
  const visuals = getBookingRoomVisuals(type.roomType, type.roomType);
  const photoIndex = photo.type === type.roomType ? photo.index : 0;
  const photoCount = visuals.gallery.length;
  const showPhoto = (index: number) => setPhoto({ type: type.roomType, index: (index + photoCount) % photoCount });
  const story = STORY[type.roomType];
  const capacity = roomCapacity(type.roomType);
  const slug = buildCabinSlug(ctx.duration, RESIDENCE_SLUG[type.roomType]);
  const guestsIn = (roomType: PhysicalRoomType) =>
    arrangement.cabins.filter(cabin => cabin.roomType === roomType).reduce((sum, cabin) => sum + occupants(arrangement, guests, cabin.id).length, 0);
  const ready = ctx.issues.length === 0;
  const moving = Boolean(drag || pickedGuest);
  const usedCabins = [...arrangement.cabins].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="hj-board">
      {ctx.alert ? <p className="hj-alert hj-board__alert" role="alert">{ctx.alert}</p> : null}

      {/* 1 — the cabin types */}
      <aside className="hj-board__types" aria-labelledby="hj-suites-title">
        <h1 className="hj-board__heading" id="hj-suites-title">Select Your Cabin or Suite</h1>
        <div className="hj-typelist" role="radiogroup" aria-label="Cabin types">
          {sailing.types.map(entry => {
            const on = entry.roomType === type.roomType;
            const placed = guestsIn(entry.roomType);
            const out = entry.availableCabins === 0;
            return (
              <button
                key={entry.roomType}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${entry.roomType}, ${money(entry.priceCents)} per cabin, ${entry.availableCabins} of ${entry.totalCabins} free${placed ? `, ${plural(placed, "guest")} placed` : ""}`}
                className={`hj-typecard${on ? " hj-typecard--on" : ""}${out ? " hj-typecard--out" : ""}${drag?.over === `type:${entry.roomType}` ? " hj-drop--over" : ""}`}
                data-hj-drop={`type:${entry.roomType}`}
                onClick={() => setActiveType(entry.roomType)}
              >
                <span className="hj-typecard__mark" aria-hidden>{on ? <IconCheck /> : null}</span>
                <Image
                  className="hj-typecard__img"
                  src={getBookingRoomVisuals(entry.roomType, entry.roomType).cover}
                  alt=""
                  width={240}
                  height={200}
                  sizes="120px"
                />
                <span className="hj-typecard__body">
                  <span className="hj-typecard__name">{entry.roomType}</span>
                  <span className="hj-typecard__tag">{STORY[entry.roomType].tagline}</span>
                  <span className="hj-typecard__price">
                    <span className="hj-typecard__amount">{money(entry.priceCents)}</span>
                    <span className="hj-typecard__per">per cabin · voyage</span>
                  </span>
                  <span className="hj-typecard__meta">
                    {out ? "Fully booked on this date" : `${entry.availableCabins} of ${entry.totalCabins} free · up to ${roomCapacity(entry.roomType)} guests`}
                    {placed ? <b>{plural(placed, "guest")} placed</b> : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 2 — photos of the chosen type */}
      <section className="hj-gallery" aria-label={`${type.roomType} photos`}>
        <div
          className="hj-gallery__frame"
          tabIndex={0}
          aria-label={`Photo ${photoIndex + 1} of ${photoCount}. Use the arrow keys for more.`}
          onKeyDown={event => {
            if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
            if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
          }}
        >
          <Image
            key={visuals.gallery[photoIndex]}
            className="hj-gallery__img"
            src={visuals.gallery[photoIndex]}
            alt={`${type.roomType}, photo ${photoIndex + 1} of ${photoCount}`}
            fill
            priority
            sizes="(min-width: 1081px) 38vw, 100vw"
          />
          {guestsIn(type.roomType) > 0 ? (
            <span className="hj-gallery__badge"><IconCheck /> In your voyage</span>
          ) : null}
          <div className="hj-gallery__save">
            <FavoriteButton type="cabin" slug={slug} name={`${type.roomType} on the ${ctx.voyageTitle} voyage`} variant="card" />
            {type.availableCabins > 0 ? (
              <AddToVoyageButton
                kind="cabin"
                slug={slug}
                name={`${type.roomType} on the ${ctx.voyageTitle} voyage`}
                variant="card"
                context={{ sailingDate: ctx.sailingDate, adults: ctx.adults, children: ctx.childCount }}
                verify={async () => {
                  const problem = await ctx.verifyCabinType(type.roomType);
                  ctx.setNotice(problem ? { tone: "warn", text: problem } : { tone: "ok", text: `${type.roomType} for this sailing is in your cart.` });
                  return problem;
                }}
              />
            ) : null}
          </div>
          <button type="button" className="hj-gallery__nav hj-gallery__nav--prev" aria-label="Previous photo" onClick={() => showPhoto(photoIndex - 1)}>
            <IconChevron direction="left" />
          </button>
          <button type="button" className="hj-gallery__nav hj-gallery__nav--next" aria-label="Next photo" onClick={() => showPhoto(photoIndex + 1)}>
            <IconChevron direction="right" />
          </button>
          <span className="hj-gallery__count" aria-hidden>{photoIndex + 1} / {photoCount}</span>
        </div>
        <div className="hj-gallery__dots" role="group" aria-label="Photos">
          {visuals.gallery.map((src, index) => (
            <button
              key={src}
              type="button"
              className="hj-gallery__dot"
              aria-label={`Photo ${index + 1}`}
              aria-pressed={index === photoIndex}
              onClick={() => showPhoto(index)}
            />
          ))}
        </div>
      </section>

      {/* 3 — the type in detail, and each of its cabins */}
      <section className="hj-detail" aria-labelledby="hj-detail-title">
        <span className="hj-detail__kicker">{shortName(type.roomType)} · {plural(type.totalCabins, "aboard Hathor", "aboard Hathor")}</span>
        <h2 className="hj-detail__name" id="hj-detail-title">{type.roomType}</h2>
        <span className="hj-detail__tag">{story.tagline}</span>

        <ul className="hj-detail__features">
          {story.features(type.sizeSqm).map(feature => (
            <li key={feature.text}>
              <span className="hj-detail__icon" aria-hidden>{feature.icon}</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        <div className="hj-detail__price">
          <span className="hj-detail__amount">{money(type.priceCents)}</span>
          <span className="hj-detail__per">per cabin · entire {voyage.nights}-night voyage</span>
          <span className="hj-detail__fine">All meals and soft drinks included. <a href={`/rooms/${RESIDENCE_SLUG[type.roomType]}`} target="_blank" rel="noopener noreferrer">Full cabin details ›</a></span>
        </div>

        <div className="hj-detail__cabins">
          <span className="hj-detail__label">
            {shortName(type.roomType)}s on this sailing · {type.availableCabins} of {type.totalCabins} free
          </span>
          <span className="hj-detail__hint">Drag your guests in, or choose how many adults and children. Every cabin needs one adult.</span>
          <div className={`hj-cabrows${moving ? " hj-cabrows--moving" : ""}`}>
            {Array.from({ length: type.totalCabins }, (_, index) => {
              const unavailable = index >= type.availableCabins;
              const cabinId = slotId(type.roomType, index);
              const label = cabinLabel(cabinId);
              const inside = unavailable ? [] : occupants(arrangement, guests, cabinId);
              const used = inside.length > 0;
              const full = inside.length >= capacity;
              const noAdult = used && !inside.some(guest => guest.kind === "adult");
              const cabinKey = `cabin:${cabinId}`;
              const pickedHere = pickedGuest ? arrangement.placement[pickedGuest.id] === cabinId : false;
              const canTake = !unavailable && Boolean(pickedGuest) && !pickedHere && !full;
              return (
                <article
                  key={cabinId}
                  className={`hj-cabrow${used ? " hj-cabrow--used" : ""}${full ? " hj-cabrow--full" : ""}${noAdult ? " hj-cabrow--warn" : ""}${unavailable ? " hj-cabrow--out" : ""}${canTake ? " hj-cabrow--target" : ""}${drag?.over === cabinKey ? " hj-drop--over" : ""}`}
                  data-hj-drop={unavailable ? undefined : cabinKey}
                  aria-label={unavailable ? `${type.roomType}, cabin ${index + 1}, unavailable for this date` : `${type.roomType}, cabin ${index + 1}, ${inside.length} of ${capacity} guests`}
                >
                  <span className="hj-cabrow__name">
                    Cabin {index + 1}
                    <span className="hj-cabrow__count">{unavailable ? "Booked" : `${inside.length}/${capacity}`}</span>
                  </span>
                  {unavailable ? (
                    <span className="hj-cabrow__out">Unavailable for this date</span>
                  ) : (
                    <>
                      <span className="hj-cabrow__seats">
                        {inside.map(guest => <GuestTile key={guest.id} {...ctx.tileProps(guest)} />)}
                        {Array.from({ length: capacity - inside.length }, (_, seat) => <span key={seat} className="hj-seat" aria-hidden />)}
                      </span>
                      <span className="hj-cabrow__menus">
                        <CountMenu label="Adults" cabinLabelText={label} options={cabinCountOptions(arrangement, guests, cabinId, "adult")} onChoose={count => ctx.choose(cabinId, "adult", count)} />
                        <CountMenu label="Children" cabinLabelText={label} options={cabinCountOptions(arrangement, guests, cabinId, "child")} onChoose={count => ctx.choose(cabinId, "child", count)} />
                      </span>
                      {used ? (
                        <button type="button" className="hj-cabrow__clear" aria-label={`Empty ${label}`} title={`Empty ${label}`} onClick={() => ctx.clear(cabinId)}>
                          <IconClose />
                        </button>
                      ) : null}
                    </>
                  )}
                  {noAdult ? <span className="hj-cabrow__warn">Every cabin needs at least one adult.</span> : null}
                  {canTake && pickedGuest ? (
                    <button type="button" className="hj-cab__place" aria-label={`Place ${guestLabel(pickedGuest)} in ${label}`} onClick={() => ctx.drop(pickedGuest.id, cabinKey)}>
                      <span aria-hidden>Place here</span>
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 — who is travelling, where they are, and on to details */}
      <aside className="hj-partycol" aria-labelledby="hj-party-title">
        <h2 className="hj-partycol__title" id="hj-party-title">Who Is Travelling?</h2>
        <div className="hj-counters">
          <Counter label="Adults" hint="Aged 12 and above" value={ctx.adults} min={1} max={MAX_ADULTS} onChange={next => ctx.onCounts(next, ctx.childCount)} />
          <Counter label="Children" hint="Aged 2 – 11" value={ctx.childCount} min={0} max={MAX_CHILDREN} onChange={next => ctx.onCounts(ctx.adults, next)} />
        </div>

        <div className={`hj-placement${drag?.over === "pool" ? " hj-drop--over" : ""}`} data-hj-drop="pool">
          <span className="hj-placement__label"><IconBed /> Cabin placement</span>
          {ctx.waiting.length > 0 ? (
            <div className="hj-pool hj-pool--board">
              <span className="hj-placement__status">{ctx.waiting.length === 1 ? "1 guest to place" : `${ctx.waiting.length} guests to place`}</span>
              <div className="hj-pool__tiles">
                {ctx.waiting.map(guest => <GuestTile key={guest.id} {...ctx.tileProps(guest)} />)}
              </div>
            </div>
          ) : (
            <span className="hj-placement__status hj-placement__status--done"><IconCheck /> Everyone has a cabin</span>
          )}
          {usedCabins.length > 0 ? (
            <ul className="hj-placement__list">
              {usedCabins.map(cabin => (
                <li key={cabin.id}>
                  <button type="button" className="hj-placement__cabin" onClick={() => setActiveType(cabin.roomType)}>
                    {cabinLabel(cabin.id)}
                  </button>
                  <span className="hj-placement__guests">
                    {occupants(arrangement, guests, cabin.id).map(guest => <GuestTile key={guest.id} {...ctx.tileProps(guest)} />)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="hj-placement__hint">Drag a guest onto a cabin, or tap a guest and then “Place here”.</span>
          )}
          {pickedGuest && ctx.placedIn(pickedGuest.id) ? (
            <button type="button" className="hj-linkbtn" onClick={() => ctx.drop(pickedGuest.id, "pool")}>
              Take {guestLabel(pickedGuest)} out of {ctx.placedIn(pickedGuest.id)}
            </button>
          ) : null}
        </div>

        <p className={`hj-party__notice${ctx.notice?.tone === "warn" ? " hj-party__notice--warn" : ""}`} role="status" aria-live="polite">
          {ctx.notice?.text ?? (pickedGuest ? `Choose a cabin for ${guestLabel(pickedGuest)}. Press Esc to cancel.` : "")}
        </p>

        {ctx.choosing ? (
          <ArrangeChooser
            sailing={sailing}
            guestCount={guests.length}
            initial={ctx.preferredType && (ctx.offers[ctx.preferredType]?.available ?? 0) > 0 ? [ctx.preferredType] : []}
            onArrange={ctx.arrange}
            onClose={() => ctx.setChoosing(false)}
          />
        ) : (
          <div className="hj-arrangebox">
            <button type="button" className="hj-arrangebtn" onClick={() => ctx.setChoosing(true)}>
              <IconWand /> Arrange for me
            </button>
            <span className="hj-arrangebox__hint">Pick the cabin types you like; we place everyone within each cabin’s limit.</span>
          </div>
        )}

        <div className="hj-partycol__foot">
          <button type="button" className="hj-cta" disabled={ctx.busy || !ready} onClick={ctx.onContinue}>
            {ctx.busy ? "Checking availability…" : "Continue to details"} <IconChevron direction="right" />
          </button>
          {!ready ? <p className="hj-party__blocker">{ctx.issues[0]}</p> : null}
          <button type="button" className="hj-btn hj-btn--ghost" onClick={ctx.onBack}>← Back to journey</button>
        </div>
      </aside>

      <DragGhost drag={drag} guests={guests} />
    </div>
  );
}
