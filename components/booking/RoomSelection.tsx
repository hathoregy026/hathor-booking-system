"use client";

import Link from "next/link";
import { BedDouble, Loader2, Maximize2, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/client-dates";
import { findStayDurationOption } from "@/lib/booking-search-config";
import type { AvailableRoom } from "@/lib/booking-types";
import type { RoomSearchConfig, StayDurationValue } from "@/lib/booking-search-config";
import { applyRatePlan, nonRefundableRateLabel, standardRateLabel, type RatePlanId } from "@/lib/rate-plans";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";

type RoomSelectionProps = {
  duration: StayDurationValue | "";
  checkInDate: string | null;
  roomConfigs: RoomSearchConfig[];
  availableRooms: AvailableRoom[];
  selectedRoomIds: string[];
  onBookRoom: (selectionKey: string, ratePlan: RatePlanId) => void;
  onGoBack: () => void;
  isLoading: boolean;
  error: string | null;
};

export function RoomSelection({ duration, checkInDate, roomConfigs, availableRooms, selectedRoomIds, onBookRoom, onGoBack, isLoading, error }: RoomSelectionProps) {
  const durationLabel = duration
    ? findStayDurationOption(duration)?.label.replace(/^⛵\s*/, "") ?? "Hathor Cruise"
    : "Hathor Dahabiya";
  const [rateByRoom, setRateByRoom] = useState<Record<string, RatePlanId>>({});
  const getRoomRate = (selectionKey: string): RatePlanId => rateByRoom[selectionKey] ?? "standard";

  if (isLoading) {
    return <div className="historia-room-selection"><div className="historia-room-selection__loading"><Loader2 className="h-6 w-6 animate-spin" aria-hidden /><span>Loading available cabins…</span></div></div>;
  }

  return (
    <section className="historia-room-selection">
      <header className="historia-room-selection__intro">
        <div>
          <p className="historia-room-selection__eyebrow">Available accommodation</p>
          <h2>Choose your<br /><em>place on the Nile</em></h2>
        </div>
        <p>Each room is a private chapter of the voyage. Select the space and rate that feel right for your journey.</p>
      </header>
      <div className="historia-room-selection__toolbar">
        <button type="button" className="public-btn-outline-gold" onClick={onGoBack}>Go Back</button>
      </div>

      {error ? <p className="historia-checkout-calendar__error" role="alert">{error}</p> : null}
      {availableRooms.length === 0 ? (
        <div className="historia-room-selection__empty">
          <p>No rooms matched your dates and guest configuration.</p>
          <button type="button" className="public-btn-outline-gold" onClick={onGoBack}>Choose different dates</button>
        </div>
      ) : (
        <div className="historia-room-selection__list">
          {availableRooms.map((room, roomIndex) => {
            const selectionKey = room.selectionKey ?? room.id;
            const selectedRate = getRoomRate(selectionKey);
            const isSelected = selectedRoomIds.includes(selectionKey);
            const standardPrice = room.minPriceCents;
            const nonRefundablePrice = applyRatePlan(standardPrice, "non-refundable");
            const adults = roomConfigs.reduce((sum, cfg) => sum + cfg.adults, 0);
            const children = roomConfigs.reduce((sum, cfg) => sum + cfg.children, 0);
            const guestTotal = adults + children;
            const visuals = getBookingRoomVisuals(room.name, room.roomType);
            const detailsParams = new URLSearchParams();
            if (checkInDate) detailsParams.set("checkInDate", checkInDate);
            if (duration) detailsParams.set("duration", duration);
            if (room.cruiseId) detailsParams.set("cruiseId", room.cruiseId);
            detailsParams.set("scheduleId", room.scheduleId);
            detailsParams.set("adults", String(adults));
            detailsParams.set("children", String(children));
            const detailsHref = `/booking/cruise/${room.id}?${detailsParams.toString()}`;

            return (
              <article key={selectionKey} className={`historia-room-card${isSelected ? " historia-room-card--selected" : ""}`}>
                <div className="historia-room-card__media">
                  <div className="historia-room-card__image" style={{ backgroundImage: `url(${visuals.cover})` }} role="img" aria-label={`${room.name} aboard Hathor Dahabiya`} />
                  <span className="historia-room-card__index">0{roomIndex + 1}</span>
                </div>
                <div className="historia-room-card__body">
                  <p className="historia-room-card__kicker"><Sparkles aria-hidden /> Hathor accommodation</p>
                  <h3 className="historia-room-card__name">{room.name}</h3>
                  <dl className="historia-room-card__facts">
                    <div><BedDouble aria-hidden /><dt>Type</dt><dd>{room.roomType ?? "Stateroom"}</dd></div>
                    <div><Users aria-hidden /><dt>Guests</dt><dd>Up to {room.capacity}{guestTotal > 0 ? ` · ${guestTotal} selected` : ""}</dd></div>
                    <div><Maximize2 aria-hidden /><dt>Space</dt><dd>{visuals.sizeSqm} m²</dd></div>
                  </dl>
                  {room.description ? <p className="historia-room-card__desc">{room.description}</p> : null}
                  <Link href={detailsHref} className="public-btn-outline-gold historia-room-card__link">View room details</Link>

                  <fieldset className="historia-room-card__rate">
                    <legend className="sr-only">Rate options for {room.name}</legend>
                    <label className="historia-room-card__rate-option"><input type="radio" name={`rate-${selectionKey}`} checked={selectedRate === "standard"} onChange={() => setRateByRoom((current) => ({ ...current, [selectionKey]: "standard" }))} /><span>{standardRateLabel(durationLabel)} — {formatPrice(standardPrice)}</span></label>
                    <label className="historia-room-card__rate-option"><input type="radio" name={`rate-${selectionKey}`} checked={selectedRate === "non-refundable"} onChange={() => setRateByRoom((current) => ({ ...current, [selectionKey]: "non-refundable" }))} /><span>{nonRefundableRateLabel(durationLabel)} — {formatPrice(nonRefundablePrice)}</span></label>
                  </fieldset>

                  <button type="button" className="public-btn-gold historia-room-card__book" onClick={() => onBookRoom(selectionKey, selectedRate)}>Book</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
