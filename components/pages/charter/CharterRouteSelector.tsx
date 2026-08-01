"use client";

type CharterRouteSelectorProps = {
  routes: readonly string[];
  value: string;
  onChange: (route: string) => void;
};

function parseStops(route: string): [string, string] {
  const parts = route
    .split(/\s*↔\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [parts[0] ?? route, parts[parts.length - 1] ?? ""];
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
    >
      <div className="lx-shell">
        <div className="ch-routes__grid">
          <div className="ch-routes__intro" data-ch-reveal="">
            <p className="lx-label lx-label--light">Your Itinerary</p>
            <h2 id="charter-routes-heading" className="lx-title ch-routes__title">
              Choose a beginning.
            </h2>
            <p className="lx-copy lx-copy--light">
              Every charter can then be tailored to your dates, pace and
              interests.
            </p>
            <p className="ch-routes__selected" aria-live="polite">
              {value}
            </p>
          </div>

          <fieldset className="ch-routes__field">
            <legend className="lx-sr">Preferred charter route</legend>
            <ul className="ch-routes__list">
              {routes.map((route, index) => {
                const id = `charter-route-${index}`;
                const [origin, dest] = parseStops(route);
                const active = value === route;
                return (
                  <li key={route} className={active ? "is-active" : undefined}>
                    <input
                      id={id}
                      className="ch-routes__input"
                      type="radio"
                      name="charterPreferredRoute"
                      value={route}
                      checked={active}
                      onChange={() => onChange(route)}
                    />
                    <label htmlFor={id} className="ch-routes__row">
                      <span className="ch-routes__origin">{origin}</span>
                      <span className="ch-routes__line" aria-hidden="true">
                        <i data-ch-route-line="" />
                      </span>
                      <span className="ch-routes__dest">{dest || "—"}</span>
                    </label>
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
