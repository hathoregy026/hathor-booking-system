/**
 * Springs-faithful parallax engine (from clone shared.js math).
 * Keys: data-parallax-{viewport}[-{unit}][-{element}]
 * scrollPx = elementSize * element + elementOffset - viewportPx
 * position = (scrollY - from) / (to - from), clamp optional
 */

export type SpringsParallaxProps = Record<string, string>;

type ParsedPoint = {
  viewport: number;
  viewportUnit: string;
  element: number | null;
  properties: SpringsParallaxProps;
  scroll: number;
};

type PropChannel = {
  property: string;
  strings: string[];
  numbers: number[];
};

type Instance = {
  el: HTMLElement;
  measure: HTMLElement;
  clamp: boolean;
  points: ParsedPoint[];
  channels: PropChannel[][];
  from: number;
  to: number;
  update?: (position: number) => void;
};

const KEY_RE = /^data-parallax-(-?[\d.]+)(vw|vh|svh|lvh|dvh|px)?(?:-(-?[\d.]+))?$/i;

function parsePropChannels(props: SpringsParallaxProps): PropChannel[] {
  return Object.entries(props).map(([property, raw]) => {
    const value = String(raw);
    const numbers: number[] = [];
    const strings: string[] = [];
    let lastIndex = 0;
    const numRe = /-?\d*\.?\d+/g;
    let match: RegExpExecArray | null;
    while ((match = numRe.exec(value))) {
      strings.push(value.slice(lastIndex, match.index));
      numbers.push(parseFloat(match[0]));
      lastIndex = match.index + match[0].length;
    }
    strings.push(value.slice(lastIndex));
    return { property, strings, numbers };
  });
}

function lerpChannels(
  a: PropChannel[],
  b: PropChannel[],
  t: number,
): SpringsParallaxProps {
  const out: SpringsParallaxProps = {};
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const left = a[i];
    const right = b[i];
    if (!left.numbers.length) {
      out[left.property] = t > 0.5 ? right.strings[0] : left.strings[0];
      continue;
    }
    const parts = [left.strings[0]];
    for (let k = 0; k < left.numbers.length; k++) {
      const av = left.numbers[k] ?? 0;
      const bv = right.numbers[k] ?? av;
      parts.push(String(av + (bv - av) * t));
      parts.push(left.strings[k + 1] ?? "");
    }
    out[left.property] = parts.join("");
  }
  return out;
}

function collectAttrPoints(el: HTMLElement): ParsedPoint[] {
  const points: ParsedPoint[] = [];
  for (const attr of Array.from(el.attributes)) {
    const m = attr.name.match(KEY_RE);
    if (!m) continue;
    let props: SpringsParallaxProps = {};
    try {
      props = JSON.parse(attr.value) as SpringsParallaxProps;
    } catch {
      continue;
    }
    points.push({
      viewport: parseFloat(m[1]) / 100,
      viewportUnit: (m[2] || "default").toLowerCase(),
      element: m[3] != null ? parseFloat(m[3]) / 100 : null,
      properties: props,
      scroll: 0,
    });
  }
  return points;
}

function viewportSizeList(natural: boolean) {
  const svh = window.innerHeight;
  if (natural) {
    return {
      default: svh,
      vh: window.innerHeight,
      vw: window.innerWidth,
      svh,
      dvh: window.innerHeight,
      lvh: window.innerHeight,
    };
  }
  return {
    default: window.innerWidth,
    vw: window.innerHeight,
    vh: window.innerWidth,
    svh: window.innerWidth,
    dvh: window.innerWidth,
    lvh: window.innerWidth,
  };
}

function resolveMeasure(el: HTMLElement, selector: string | null): HTMLElement {
  if (!selector) return el;
  const found = el.closest(selector);
  if (found instanceof HTMLElement) return found;
  const nested = el.querySelector(selector);
  if (nested instanceof HTMLElement) return nested;
  return el;
}

function applyProps(el: HTMLElement, props: SpringsParallaxProps) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "progress") continue;
    if (key === "transform") {
      el.style.transform = value;
    } else if (key === "opacity") {
      el.style.opacity = value;
    } else if (key === "visibility") {
      el.style.visibility = value;
    } else if (key === "clip-path" || key === "clipPath") {
      el.style.clipPath = value;
    } else if (key === "height") {
      el.style.height = value;
    } else if (key === "width") {
      el.style.width = value;
    } else {
      el.style.setProperty(key, value);
    }
  }
}

export type SpringsParallaxHandle = {
  refresh: () => void;
  update: (scrollY: number) => void;
  destroy: () => void;
};

/**
 * Bind every [data-plugin~="parallax"] (or any element with data-parallax-*)
 * inside root, measuring against measureSelector (default .sticky / [data-am-chapter]).
 */
export function createSpringsParallax(
  root: HTMLElement,
  options?: {
    measureSelector?: string;
    patterns?: Record<
      string,
      | SpringsParallaxProps
      | ((el?: HTMLElement) => Record<string, SpringsParallaxProps>)
    >;
  },
): SpringsParallaxHandle {
  const measureSelector =
    options?.measureSelector ?? "[data-am-chapter], .sticky";
  const patterns = options?.patterns ?? {};
  let instances: Instance[] = [];

  const build = () => {
    instances = [];
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-plugin~="parallax"], [data-parallax-pattern], [data-parallax-0-0], [data-parallax--0-0], [data-parallax--100-0], [data-parallax-100-0]',
      ),
    );
    // Also catch any element with a data-parallax-* attr
    const extra = Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
      (el) =>
        Array.from(el.attributes).some((a) => a.name.startsWith("data-parallax-")),
    );
    const all = Array.from(new Set([...nodes, ...extra]));

    for (const el of all) {
      const enableMq = el.getAttribute("data-parallax-enable-mq");
      if (enableMq === "md-down" && window.matchMedia("(min-width: 1025px)").matches) {
        continue;
      }
      if (enableMq === "md-up" && window.matchMedia("(max-width: 1024px)").matches) {
        continue;
      }
      if (enableMq === "lg-up" && window.matchMedia("(max-width: 1024px)").matches) {
        continue;
      }
      if (enableMq === "sm-down" && window.matchMedia("(min-width: 481px)").matches) {
        continue;
      }

      const localMeasure =
        el.getAttribute("data-parallax-measure-selector") || measureSelector;
      const measure = resolveMeasure(el, localMeasure);
      const clamp = el.getAttribute("data-parallax-clamp") !== "false";

      let points = collectAttrPoints(el);

      const patternNames = (el.getAttribute("data-parallax-pattern") || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      for (const name of patternNames) {
        const pattern = patterns[name];
        if (!pattern) continue;
        const resolved =
          typeof pattern === "function" ? pattern(el) : pattern;
        for (const [key, value] of Object.entries(resolved)) {
          /* keys like parallax--100-0 → data-parallax--100-0 */
          const attrName = key.startsWith("data-") ? key : `data-${key}`;
          const m = attrName.match(KEY_RE);
          if (!m) continue;
          const props = value as SpringsParallaxProps;
          points.push({
            viewport: parseFloat(m[1]) / 100,
            viewportUnit: (m[2] || "default").toLowerCase(),
            element: m[3] != null ? parseFloat(m[3]) / 100 : null,
            properties: props,
            scroll: 0,
          });
        }
      }

      if (!points.length) continue;

      const rect = measure.getBoundingClientRect();
      const elementOffset = window.scrollY + rect.top;
      const elementSize = measure.offsetHeight;
      const sizes = viewportSizeList(true);

      for (const point of points) {
        const unit = point.viewportUnit in sizes ? point.viewportUnit : "default";
        const viewportPx =
          point.viewportUnit === "px"
            ? point.viewport * 100
            : point.viewport * sizes[unit as keyof typeof sizes];
        point.scroll =
          point.element == null
            ? Math.round(viewportPx)
            : Math.round(elementSize * point.element + elementOffset - viewportPx);
      }
      points.sort((a, b) => a.scroll - b.scroll);

      const from = points[0]?.scroll ?? 0;
      const to = points[points.length - 1]?.scroll ?? from + 1;
      const channels = points.map((p) => parsePropChannels(p.properties));

      instances.push({
        el,
        measure,
        clamp,
        points,
        channels,
        from,
        to: to === from ? from + 1 : to,
      });
    }
  };

  const update = (scrollY: number) => {
    for (const inst of instances) {
      let position = (scrollY - inst.from) / (inst.to - inst.from);
      if (inst.clamp) position = Math.min(1, Math.max(0, position));

      if (inst.update) {
        inst.update(position);
        continue;
      }

      const scrollAt = inst.from + position * (inst.to - inst.from);
      let left = 0;
      let right = inst.points.length - 1;
      for (let i = 1; i < inst.points.length; i++) {
        if (inst.points[i].scroll >= scrollAt) {
          right = i;
          left = i - 1;
          break;
        }
        left = i;
        right = i;
      }
      const aScroll = inst.points[left].scroll;
      const bScroll = inst.points[right].scroll;
      const localT =
        bScroll === aScroll
          ? 1
          : (scrollAt - aScroll) / (bScroll - aScroll);
      const props = lerpChannels(
        inst.channels[left],
        inst.channels[right],
        Math.min(1, Math.max(0, localT)),
      );
      applyProps(inst.el, props);
    }
  };

  build();

  return {
    refresh: () => {
      build();
      update(window.scrollY);
    },
    update,
    destroy: () => {
      instances = [];
    },
  };
}

/** Springs infrastructureSliderScroll index helper */
export function sliderCaptionIndex(position: number, count: number) {
  if (count <= 0) return 0;
  if (position < 0.05) return 0;
  return Math.min(count - 1, Math.ceil((position - 0.1) * count));
}
