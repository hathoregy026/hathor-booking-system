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
    <div className="ch-lux-routes" id="charter-itinerary">
      <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
        <legend className="lux-kicker" style={{ marginBottom: "1.5rem" }}>
          Preferred charter route
        </legend>
        <ul className="ch-lux-routes__list">
          {routes.map((route, index) => {
            const id = `charter-route-${index}`;
            const [origin, dest] = parseStops(route);
            const active = value === route;
            return (
              <li key={route} className={active ? "is-active" : undefined}>
                <input
                  id={id}
                  className="ch-lux-routes__input"
                  type="radio"
                  name="charterPreferredRoute"
                  value={route}
                  checked={active}
                  onChange={() => onChange(route)}
                />
                <label htmlFor={id} className="ch-lux-routes__row">
                  <span className="ch-lux-routes__origin">{origin}</span>
                  <span className="ch-lux-routes__line" aria-hidden="true">
                    <i />
                  </span>
                  <span className="ch-lux-routes__dest">{dest || "—"}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
