import Image from "next/image";
import rotatingWheel from "@/assets/LOGOS/rotating-wheel-hathor-cruise.png";
import { H4_PATH, H4_STOPS } from "@/components/pages/home-four/atlas-data";
import { NILE_TOTAL_KM } from "@/lib/nile-route";

/**
 * The sailing chart — Home 4's geographic atlas, driven by Home 3's flow.
 *
 * Server-rendered and free of its own animation — hooks/useHomeThreeFlow.ts
 * draws the course in, walks the needle, swings the helm and lights each
 * mooring from the same loop that moves the horizontal track.
 */
export function NileChart() {
  return (
    <div className="h3-chart" data-h3-chart data-h3-total-km={NILE_TOTAL_KM}>
      <figure className="h3-chart__plate">
        <svg
          className="h3-chart__svg"
          viewBox="0 0 420 565"
          role="img"
          aria-labelledby="h3-chart-t h3-chart-d"
        >
          <title id="h3-chart-t">The Nile between Luxor and Aswan</title>
          <desc id="h3-chart-d">
            North-up geographic overview with city locations. Dotted leaders
            connect places to a generalized river course; they do not mark
            berths. Sailing is shown southwards from Luxor to Aswan.
          </desc>
          <defs>
            <pattern
              id="h3-atlas-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M60 0H0V60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
              />
            </pattern>
          </defs>
          <rect
            width="420"
            height="565"
            fill="url(#h3-atlas-grid)"
            opacity="0.13"
          />
          <text x="355" y="31" className="h3-map-north">
            N ↑
          </text>
          <text
            x="32"
            y="360"
            transform="rotate(-90 32 360)"
            className="h3-map-region"
          >
            WESTERN DESERT
          </text>
          <text
            x="386"
            y="190"
            transform="rotate(90 386 190)"
            className="h3-map-region"
          >
            EASTERN DESERT
          </text>
          <path d={H4_PATH} className="h3-chart__banks" />
          <path d={H4_PATH} className="h3-chart__ghost" />
          <path d={H4_PATH} className="h3-chart__course" data-h3-course />
          {H4_STOPS.map((stop, i) => (
            <g
              key={stop.name}
              className="h3-stop"
              data-h3-stop={stop.t}
            >
              <path
                d={`M${stop.route.x} ${stop.route.y}L${stop.x} ${stop.y}`}
                className="h3-stop__tick"
              />
              <circle cx={stop.x} cy={stop.y} r="3.5" className="h3-stop__dot" />
              <text
                className="h3-stop__name"
                x={stop.x + (i % 2 === 0 ? -14 : 14)}
                y={stop.y - 10}
                textAnchor={i % 2 === 0 ? "end" : "start"}
              >
                {stop.name}
              </text>
            </g>
          ))}
          <g className="h3-ship" data-h3-ship aria-hidden="true">
            <path
              d="M0-13 Q5-7 5 4 L3 11 H-3 L-5 4 Q-5-7 0-13Z"
              className="h3-ship__hull"
            />
            <path d="M0-9V7M1-7L11 3H1" className="h3-ship__sail" />
          </g>
        </svg>
        <figcaption className="h3-chart__caption">
          Geographic overview · approximate city locations
          <br />
          <a
            href="https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-rivers-lake-centerlines/"
            target="_blank"
            rel="noreferrer"
          >
            Natural Earth
          </a>{" "}
          /{" "}
          <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">
            GeoNames
          </a>{" "}
          · not a navigation chart
        </figcaption>
      </figure>
    </div>
  );
}

/**
 * The helm.
 *
 * Reads the course rather than decorating it, so it belongs with the figures
 * in the reading column and not on the chart, where it covered the channel it
 * was reporting on. The hook swings it from the same loop that walks the
 * vessel: a few degrees of course is many degrees of wheel.
 */
export function NileHelm() {
  return (
    <div className="h3-helm" data-h3-helm>
      <div className="h3-helm__dial" aria-hidden="true">
        <Image
          src={rotatingWheel}
          alt=""
          className="h3-helm__wheel"
          sizes="(max-width: 480px) 5.5rem, (max-width: 950px) 5rem, 6rem"
        />
        <span className="h3-helm__index" />
      </div>
      <p className="h3-helm__read">
        <span data-h3-heading>180</span>
        <em>Heading</em>
      </p>
    </div>
  );
}
