import type { ReactNode } from "react";
import { H4_ESTIMATE_KM, H4_PATH, H4_STOPS } from "./atlas-data";

export function HomeFourAtlas({ images }: { images: ReactNode[] }) {
  return <section className="h4-scene h4-atlas" id="h4-atlas" tabIndex={-1} aria-labelledby="h4-atlas-title">
    <div className="h4-atlas-heading"><p className="h4-eyebrow">The river atlas · Upper Egypt</p><h2 id="h4-atlas-title">A line through<br /><em>living Egypt.</em></h2><p className="h4-copy">From Luxor towards Aswan, travel south against the current. The river itself flows north.</p><p className="h4-atlas-distance">≈ {H4_ESTIMATE_KM} km <span>along the illustrated river</span></p><a className="h4-link" href="#h4-voyages">Find your passage</a></div>
    <figure className="h4-map">
      <svg viewBox="0 0 420 565" role="img" aria-labelledby="h4-map-title h4-map-desc">
        <title id="h4-map-title">The Nile between Luxor and Aswan</title><desc id="h4-map-desc">North-up geographic overview with city locations. Dotted leaders connect places to a generalized river course; they do not mark berths. Sailing is shown southwards from Luxor to Aswan.</desc>
        <defs><pattern id="h4-atlas-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="currentColor" strokeWidth="0.4" /></pattern></defs>
        <rect width="420" height="565" fill="url(#h4-atlas-grid)" opacity="0.13" />
        <text x="355" y="31" className="h4-map-north">N ↑</text>
        <text x="32" y="360" transform="rotate(-90 32 360)" className="h4-map-region">WESTERN DESERT</text>
        <text x="386" y="190" transform="rotate(90 386 190)" className="h4-map-region">EASTERN DESERT</text>
        <path d={H4_PATH} className="h4-river-context" /><path d={H4_PATH} className="h4-river-base" /><path d={H4_PATH} className="h4-course" />
        {H4_STOPS.map((stop,i)=><g key={stop.name} className="h4-map-place"><path d={`M${stop.route.x} ${stop.route.y}L${stop.x} ${stop.y}`} className="h4-place-leader"/><circle cx={stop.x} cy={stop.y} r="3.5"/><text x={stop.x+(i%2===0?-14:14)} y={stop.y-10} textAnchor={i%2===0?"end":"start"}>{stop.name}</text></g>)}
        <g className="h4-vessel" aria-hidden="true"><path d="M0-13 Q5-7 5 4 L3 11 H-3 L-5 4 Q-5-7 0-13Z" fill="#f7f1e6" stroke="#806b35" strokeWidth="1.4"/><path d="M0-9V7M1-7L11 3H1" fill="#b69f64" stroke="#806b35" strokeWidth="0.7"/></g>
      </svg>
      <figcaption>Geographic overview · approximate city locations<br /><a href="https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/" target="_blank" rel="noreferrer">Natural Earth</a> / <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · not a navigation chart</figcaption>
    </figure>
    <div className="h4-atlas-reading"><p className="h4-eyebrow">A 4-night passage · Luxor to Aswan</p>
      <div className="h4-stop-buttons" role="group" aria-label="Explore places on the Nile">{H4_STOPS.map((stop,i)=><button key={stop.name} type="button" data-h4-stop={stop.t} aria-pressed={i===0} aria-controls={`h4-place-${i}`}>{stop.name}</button>)}</div>
      <p className="h4-atlas-current" aria-hidden="true">Luxor</p>
      <div className="h4-stop-details">{H4_STOPS.map((stop,i)=><article id={`h4-place-${i}`} key={stop.name} className={`h4-stop-detail${i===0?" h4-active":""}`}>
        {images[i]}<p className="h4-caption">{stop.day} · {stop.kind}</p><h3>{stop.title}</h3><p className="h4-copy">{stop.copy}</p>
      </article>)}</div>
      <p className="h4-atlas-note">Selected places, not every overnight stop. El Ramady and Gebel el-Silsila are included in the published itinerary; exact moorings and timings are confirmed for your sailing.</p>
    </div>
  </section>;
}
