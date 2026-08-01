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
      className="charter-section charter-routes"
      aria-labelledby="charter-routes-heading"
    >
      <svg
        className="charter-routes__nile"
        viewBox="0 0 320 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M168 12c-18 42-48 74-52 128-4 48 22 78 18 128-5 58-42 92-38 148 3 42 34 72 28 118"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M188 28c-14 38-40 68-44 116-5 52 18 84 14 132-5 54-36 88-32 140"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      <div className="charter-shell">
        <div className="charter-routes__grid">
          <div className="charter-routes__intro" data-charter-reveal="">
            <p className="charter-eyebrow charter-eyebrow--gold">
              Your Private Itinerary
            </p>
            <h2 id="charter-routes-heading" className="charter-heading charter-heading--light">
              Choose the beginning.
              <br />
              We will compose the rest.
            </h2>
            <p className="charter-copy charter-copy--light">
              Select a preferred route as a starting point. Every charter can
              then be tailored to your dates, pace and interests.
            </p>
          </div>

          <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
            <legend className="charter-sr-only">Preferred charter route</legend>
            <p className="charter-sr-only" aria-live="polite">
              Selected route: {value}
            </p>
            <ul className="charter-routes__list" data-charter-reveal="">
              {routes.map((route, index) => {
                const id = `charter-route-${index}`;
                const stops = parseStops(route);
                const checked = value === route;

                return (
                  <li key={route} className="charter-route">
                    <input
                      id={id}
                      className="charter-route__input"
                      type="radio"
                      name="charterPreferredRoute"
                      value={route}
                      checked={checked}
                      onChange={() => onChange(route)}
                    />
                    <label htmlFor={id} className="charter-route__label">
                      <span className="charter-route__num">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="charter-route__path">
                        {stops.map((stop, stopIndex) => (
                          <span
                            key={`${route}-${stop}-${stopIndex}`}
                            className="charter-route__fragment"
                          >
                            {stopIndex > 0 ? (
                              <>
                                <span
                                  className="charter-route__line"
                                  aria-hidden="true"
                                />
                                <span
                                  className="charter-route__diamond"
                                  aria-hidden="true"
                                />
                                <span
                                  className="charter-route__line"
                                  aria-hidden="true"
                                />
                              </>
                            ) : null}
                            <span className="charter-route__stop">{stop}</span>
                          </span>
                        ))}
                      </span>
                    </label>
                    <p className="charter-route__selected" aria-hidden="true">
                      Selected route
                    </p>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </div>
      </div>
    </section>
  );
}
