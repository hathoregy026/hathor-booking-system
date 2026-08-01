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
      <h2 id="charter-routes-heading" className="ch-routes__title aw-display">
        Choose a Beginning
      </h2>
      <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
        <legend className="aw-sr">Preferred charter route</legend>
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
                    <i />
                  </span>
                  <span className="ch-routes__dest">{dest || "—"}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </section>
  );
}
