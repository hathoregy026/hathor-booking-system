"use client";

import Link from "next/link";
import { useCabinPrices } from "@/components/public/CabinPricesProvider";
import { useCurrency } from "@/components/public/CurrencyProvider";
import { livePriceFor } from "@/lib/cabin-prices-shared";
import { RoomPriceUnit } from "@/components/ui/RoomPriceUnit";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedGuide } from "@/lib/i18n/route-copy";

/**
 * 11 · the guide — a ledger and a set of questions in the vertical document,
 * after the horizontal story and before the close. It answers, in plain
 * words on the page, what someone searching "dahabiya Nile cruise" came to
 * find: what it is, which voyages, how long, what it costs, what is included.
 */
export function HomeGuide() {
  const { money: guideUsd } = useCurrency();
  const cabinPrices = useCabinPrices();
  const locale = usePublicLocale();
  const guide = localizedGuide(locale);

  /* the dashboard's lowest cabin price for a voyage, when it has one */
  const fromFare = (slug: string, fallbackCents: number) => {
    const cruise = HATHOR_CRUISES.find((item) => item.slug === slug);
    const live = cruise
      ? cruise.rooms
          .map((room) => ({ roomType: room.roomType, cents: livePriceFor(cabinPrices, slug, room.roomNumber) }))
          .filter((rate): rate is { roomType: string; cents: number } => rate.cents !== null)
          .sort((a, b) => a.cents - b.cents)
      : [];
    return {
      price: guideUsd(live[0]?.cents ?? fallbackCents),
      roomType: live[0]?.roomType ?? cruise?.rooms.find(room => room.priceCents === fallbackCents)?.roomType,
    };
  };

  return (
    <section
      className="h3-wrapper h3-pt-md h3-pb-sm h3-guide"
      aria-labelledby="h3-guide-title"
    >
      <div className="h3-guide__grid">
        <div className="h3-guide__head">
          <p className="h3-kicker">{guide.kicker}</p>
          <h2 id="h3-guide-title" className="h3-guide__title">
            <span>{guide.title[0]}</span> <span>{guide.title[1]}</span>
          </h2>
          <p className="h3-support h3-guide__lead">{guide.intro}</p>
        </div>

        <div className="h3-guide__ledger">
          <h3 className="h3-guide__label">{guide.ledgerLabel}</h3>
          <ul className="h3-guide__voyages">
            {guide.voyages.map((voyage) => {
              const fare = fromFare(voyage.slug, voyage.fromCents);
              return (
                <li key={voyage.slug} className="h3-guide__voyage">
                  <Link
                    href={localizedHref(voyage.href, locale)}
                    className="h3-guide__voyage-link"
                  >
                    <span className="h3-guide__nights">
                      {voyage.nightsLabel}{" "}
                      <em>{guide.days(voyage.days)}</em>
                    </span>{" "}
                    <span className="h3-guide__route">
                      {voyage.route}{" "}
                      <em>{guide.departureDay(voyage.departureDay)}</em>
                    </span>{" "}
                    <span className="h3-guide__from">
                      <em>{guide.from}</em>{" "}
                      {fare.price}<RoomPriceUnit roomType={fare.roomType} locale={locale} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="h3-guide__note">{guide.note}</p>
        </div>
      </div>

      <div className="h3-guide__faq">
        <h3 className="h3-guide__label">{guide.faqLabel}</h3>
        <div className="h3-guide__qs">
          {guide.faq.map((item) => (
            <details key={item.question} className="h3-guide__q">
              <summary>
                <span className="h3-guide__question">{item.question}</span>
                <i aria-hidden="true" />
              </summary>
              <div className="h3-guide__answer">
                <p>{item.kind === "price" ? guide.priceAnswer(guideUsd) : item.answer}</p>
                {item.link ? (
                  <Link
                    href={localizedHref(item.link.href, locale)}
                    className="h3-text-link"
                  >
                    {item.link.label}
                  </Link>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
