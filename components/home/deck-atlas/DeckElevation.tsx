"use client";

import type { ShipDeckId } from "@/lib/ship-experience-shared";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { DECK_ATLAS_COPY } from "@/lib/i18n/deck-atlas-copy";

type DeckOption = { id: ShipDeckId; name: string; subtitle: string; visible: boolean };

/* Top to bottom, as the decks stack on the ship. */
const ORDER: ShipDeckId[] = ["sun", "main", "lower"];
const NUMBER: Record<ShipDeckId, string> = { lower: "01", main: "02", sun: "03" };

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step + 1e-6) + 1 }, (_, index) => from + index * step);

/*
 * Hathor in profile, stern left and bow right, drawn from the 60 m general
 * arrangement and the river photographs: a long two-level superstructure
 * (panoramic main-deck glazing over paired cabin windows), the sun deck with
 * its pergola, round bar canopy and parasols, stairs down to the forward
 * terrace, the wheelhouse on the foredeck and a dark boot-top.
 * Units: 1 ≈ 0.1 m. Levels: sun 0–24, main 24–52, lower 52–100, waterline 100.
 */
const MAIN_WINDOWS = range(26, 356, 22);
const CABIN_PAIRS = range(30, 446, 26);
const SUN_POSTS = range(20, 380, 12);
const TERRACE_POSTS = range(382, 470, 11);
const FORE_POSTS = range(492, 588, 12);
const PARASOLS = [176, 212, 248, 300, 336];

export function DeckElevation({ decks, active, onChange }: {
  decks: DeckOption[];
  active: ShipDeckId;
  onChange: (id: ShipDeckId) => void;
}) {
  const tx = DECK_ATLAS_COPY[usePublicLocale()];
  const shown = new Set(decks.filter(deck => deck.visible).map(deck => deck.id));
  const pick = (id: ShipDeckId) => { if (shown.has(id)) onChange(id); };

  return (
    <div className="da-elev" data-active={active}>
      <div className="da-elev__decks" role="group" aria-label={tx.chooseDeck}>
        {ORDER.map(id => {
          const deck = decks.find(item => item.id === id);
          if (!deck) return null;
          return (
            <button key={id} type="button" className="da-deckpill" data-deck={id} aria-pressed={active === id}
              title={`${deck.name} · ${deck.subtitle}`} aria-label={deck.name} disabled={!deck.visible} onClick={() => pick(id)}>
              <small>{NUMBER[id]}</small><span>{tx.deckTab(deck.name)}</span>
            </button>
          );
        })}
      </div>
      <svg className="da-elev__ship" viewBox="4 -4 604 110" aria-hidden="true" focusable="false">
        <g className="da-elev__band" data-deck="sun" data-hidden={!shown.has("sun") || undefined} onClick={() => pick("sun")}>
          <path className="da-elev__fill" d="M20 0H380V24H20Z" />
          <path d="M20 12H380" />
          {SUN_POSTS.map(x => <path key={x} className="da-elev__fine" d={`M${x} 12V24`} />)}
          <path d="M22 1H92" />
          {range(26, 88, 8).map(x => <path key={x} className="da-elev__fine" d={`M${x} 1V4`} />)}
          {[24, 57, 90].map(x => <path key={x} d={`M${x} 1V24`} />)}
          <path d="M112 3.5H152" />
          <path className="da-elev__fine" d="M116 3.5Q132 -1 148 3.5" />
          <path d="M132 3.5V24" />
          {PARASOLS.map(x => <g key={x} className="da-elev__fine"><path d={`M${x} 4V24`} /><path d={`M${x} 5L${x + 2.2} 11L${x} 15L${x - 2.2} 11Z`} /></g>)}
          {[104, 268, 352].map(x => <circle key={x} className="da-elev__buoy" cx={x} cy="18" r="2.4" />)}
        </g>

        <g className="da-elev__band" data-deck="main" data-hidden={!shown.has("main") || undefined} onClick={() => pick("main")}>
          <path className="da-elev__fill" d="M20 24H380V42H470V52H20Z" />
          <path d="M20 52V24H380V52" />
          {MAIN_WINDOWS.map(x => <rect key={x} className="da-elev__pane" x={x} y="28.5" width="18" height="19" />)}
          <path d="M380 42H470" />
          {TERRACE_POSTS.map(x => <path key={x} className="da-elev__fine" d={`M${x} 42V52`} />)}
          <path d="M380 24L438 52" />
          <path className="da-elev__fine" d="M380 16L438 44" />
          {range(386, 432, 7).map(x => <path key={x} className="da-elev__fine" d={`M${x} ${(24 + (x - 380) * (28 / 58)).toFixed(1)}h5`} />)}
          {[426, 458].map(x => <circle key={x} className="da-elev__buoy" cx={x} cy="47" r="2.4" />)}
        </g>

        <g className="da-elev__band" data-deck="lower" data-hidden={!shown.has("lower") || undefined} onClick={() => pick("lower")}>
          <path className="da-elev__fill" d="M20 52H470V78H598C596 86 590 94 578 100H24L14 94V78H20Z" />
          <path d="M20 78V52H470V78" />
          <path d="M14 78H598C596 86 590 94 578 100H24L14 94Z" />
          <path className="da-elev__boot" d="M14 89H593C590 94 585 97 578 100H24L14 94Z" />
          {CABIN_PAIRS.map(x => <g key={x}><rect className="da-elev__pane" x={x} y="58" width="8" height="12" /><rect className="da-elev__pane" x={x + 11} y="58" width="8" height="12" /></g>)}
          <path d="M470 52L486 78" />
          <path d="M490 70H592" />
          {FORE_POSTS.map(x => <path key={x} className="da-elev__fine" d={`M${x} 70V78`} />)}
          <path d="M512 78V60H540V78" />
          <path d="M506 60H546L541 55H511Z" />
          {[515, 523, 531].map(x => <rect key={x} className="da-elev__pane" x={x} y="63" width="5.5" height="6" />)}
        </g>

        <g className="da-elev__water">
          <path d="M-10 100H610" />
          <path d="M8 104.5h40M70 104.5h66M170 104.5h44M246 104.5h80M360 104.5h52M446 104.5h70M540 104.5h46" />
        </g>
      </svg>
    </div>
  );
}
