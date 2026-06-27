"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/client-dates";
import { findStayDurationOption } from "@/lib/booking-search-config";
import type { AvailableRoom } from "@/lib/booking-types";
import type { RoomSearchConfig, StayDurationValue } from "@/lib/booking-search-config";
import {
  applyRatePlan,
  nonRefundableRateLabel,
  standardRateLabel,
  type RatePlanId,
} from "@/lib/rate-plans";

const ROOM_PLACEHOLDER =
  "linear-gradient(135deg, #2f4f4f 0%, #3d5c5c 45%, #c9a96e 100%)";

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

export function RoomSelection({
  duration,
  checkInDate,
  roomConfigs,
  availableRooms,
  selectedRoomIds,
  onBookRoom,
  onGoBack,
  isLoading,
  error,
}: RoomSelectionProps) {
  const durationLabel = duration
    ? findStayDurationOption(duration)?.label.replace(/^⛵\s*/, "") ?? "Hathor Cruise"
    : "Hathor Dahabiya";

  const [rateByRoom, setRateByRoom] = useState<Record<string, RatePlanId>>({});

  const getRoomRate = (selectionKey: string): RatePlanId =>
    rateByRoom[selectionKey] ?? "standard";

  if (isLoading) {
    return (
      <div className="historia-room-selection">
        <div className="historia-room-selection__loading">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span>Loading available cabins…</span>
        </div>
      </div>
    );
  }

  return (
    <section className="historia-room-selection">
      <div className="historia-room-selection__toolbar">
        <button type="button" className="historia-btn historia-btn--ghost" onClick={onGoBack}>
          Go Back
        </button>
      </div>

      {error ? (
        <p className="historia-checkout-calendar__error" role="alert">
          {error}
        </p>
      ) : null}

      {availableRooms.length === 0 ? (
        <div className="historia-room-selection__empty">
          <p>No rooms matched your dates and guest configuration.</p>
          <button type="button" className="historia-btn historia-btn--ghost" onClick={onGoBack}>
            Choose different dates
          </button>
        </div>
      ) : (
        <div className="historia-room-selection__list">
          {availableRooms.map((room) => {
            const selectionKey = room.selectionKey ?? room.id;
            const selectedRate = getRoomRate(selectionKey);
            const isSelected = selectedRoomIds.includes(selectionKey);
            const standardPrice = room.minPriceCents;
            const nonRefundablePrice = applyRatePlan(standardPrice, "non-refundable");
            const adults = roomConfigs.reduce((sum, cfg) => sum + cfg.adults, 0);
            const children = roomConfigs.reduce((sum, cfg) => sum + cfg.children, 0);
            const guestTotal = adults + children;

            const detailsParams = new URLSearchParams();
            if (checkInDate) detailsParams.set("checkInDate", checkInDate);
            if (duration) detailsParams.set("duration", duration);
            if (room.cruiseId) detailsParams.set("cruiseId", room.cruiseId);
            detailsParams.set("scheduleId", room.scheduleId);
            detailsParams.set("adults", String(adults));
            detailsParams.set("children", String(children));
            const detailsHref = `/booking/cruise/${room.id}?${detailsParams.toString()}`;

            return (
              <article
                key={selectionKey}
                className={`historia-room-card${isSelected ? " historia-room-card--selected" : ""}`}
              >
                <div
                  className="historia-room-card__image"
                  style={{ background: ROOM_PLACEHOLDER }}
                />
                <div className="historia-room-card__body">
                  <h3 className="historia-room-card__name">{room.name}</h3>
                  <p className="historia-room-card__meta">
                    {room.roomType ?? "Stateroom"} · up to {room.capacity} guests
                    {guestTotal > 0 ? ` · ${guestTotal} in your party` : ""}
                  </p>
                  {room.description ? (
                    <p className="historia-room-card__desc">{room.description}</p>
                  ) : null}
                  <Link href={detailsHref} className="historia-room-card__link">
                    View Room Details And Enhancements
                  </Link>

                  <fieldset className="historia-room-card__rate">
                    <legend className="sr-only">Rate options for {room.name}</legend>
                    <label className="historia-room-card__rate-option">
                      <input
                        type="radio"
                        name={`rate-${selectionKey}`}
                        checked={selectedRate === "standard"}
                        onChange={() =>
                          setRateByRoom((current) => ({
                            ...current,
                            [selectionKey]: "standard",
                          }))
                        }
                      />
                      <span>
                        {standardRateLabel(durationLabel)} —{" "}
                        {formatPrice(standardPrice)}
                      </span>
                    </label>
                    <label className="historia-room-card__rate-option">
                      <input
                        type="radio"
                        name={`rate-${selectionKey}`}
                        checked={selectedRate === "non-refundable"}
                        onChange={() =>
                          setRateByRoom((current) => ({
                            ...current,
                            [selectionKey]: "non-refundable",
                          }))
                        }
                      />
                      <span>
                        {nonRefundableRateLabel(durationLabel)} —{" "}
                        {formatPrice(nonRefundablePrice)}
                      </span>
                    </label>
                  </fieldset>

                  <button
                    type="button"
                    className="historia-btn historia-btn--primary historia-room-card__book"
                    onClick={() => onBookRoom(selectionKey, selectedRate)}
                  >
                    Book
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
