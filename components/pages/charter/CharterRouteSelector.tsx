"use client";

type CharterRouteSelectorProps = {
  routes: readonly string[];
  value: string;
  onChange: (route: string) => void;
};

function parseStops(route: string): string[] {
  return route
    .split(/\s*↔\s*/)
    .map((stop) => stop.trim())
    .filter(Boolean);
}

export function CharterRouteSelector({
  routes,
  value,
  onChange,
}: CharterRouteSelectorProps) {
  return (
    <section
      id="charter-itinerary"
      className="ch-routes"
      aria-labelledby="charter-routes-heading"
      data-charter-routes=""
    >
      <div className="lux-ed-shell">
        <div className="lux-ed-grid ch-routes__grid">
          <div className="ch-routes__intro" data-charter-reveal="">
            <p className="lux-ed-label lux-ed-label--gold">Your Private Itinerary</p>
            <h2 id="charter-routes-heading" className="lux-ed-title ch-routes__title">
              Choose the beginning.
              <br />
              We compose the rest.
            </h2>
            <p className="lux-ed-copy lux-ed-copy--light">
              Select a preferred route as a starting point. Every charter can
              then be tailored to your dates, pace and interests.
            </p>
            <p className="ch-routes__summary" aria-live="polite">
              Selected · {value}
            </p>
          </div>

          <div className="ch-routes__atelier">
            <svg
              className="ch-routes__nile"
              viewBox="0 0 80 420"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                data-charter-nile-path=""
                d="M42 8c-10 36-28 64-30 112-2 42 14 68 12 112-3 48-24 78-20 128 2 36 20 62 16 92"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>

            <fieldset className="ch-routes__fieldset">
              <legend className="lux-ed-sr">Preferred charter route</legend>
              <ul className="ch-routes__list">
                {routes.map((route, index) => {
                  const id = `charter-route-${index}`;
                  const stops = parseStops(route);
                  const checked = value === route;
                  const origin = stops[0] ?? route;
                  const dest = stops[stops.length - 1] ?? "";

                  return (
                    <li
                      key={route}
                      className={`ch-route${checked ? " is-active" : ""}`}
                    >
                      <input
                        id={id}
                        className="ch-route__input"
                        type="radio"
                        name="charterPreferredRoute"
                        value={route}
                        checked={checked}
                        onChange={() => onChange(route)}
                      />
                      <label htmlFor={id} className="ch-route__label">
                        <span className="ch-route__num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="ch-route__origin">{origin}</span>
                        <span className="ch-route__path" aria-hidden="true">
                          <span className="ch-route__line" />
                          <span className="ch-route__dot" />
                          <span className="ch-route__line" />
                        </span>
                        <span className="ch-route__dest">{dest || "—"}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  );
}
