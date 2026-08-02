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
    <div className="charterRoutes" id="charter-itinerary">
      <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
        <legend className="luxMeta" style={{ marginBottom: "1.25rem" }}>
          Preferred charter route
        </legend>
        <ul className="charterRoutes__list">
          {routes.map((route, index) => {
            const id = `charter-route-${index}`;
            const [origin, dest] = parseStops(route);
            const active = value === route;
            return (
              <li key={route} className={active ? "is-active" : undefined}>
                <input
                  id={id}
                  className="charterRoutes__input"
                  type="radio"
                  name="charterPreferredRoute"
                  value={route}
                  checked={active}
                  onChange={() => onChange(route)}
                />
                <label htmlFor={id} className="charterRoutes__row">
                  <span className="charterRoutes__origin">{origin}</span>
                  <span className="charterRoutes__line" aria-hidden="true">
                    <i />
                  </span>
                  <span className="charterRoutes__dest">{dest || "—"}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
