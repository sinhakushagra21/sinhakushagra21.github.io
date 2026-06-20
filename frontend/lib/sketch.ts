/* ═══════════════════════════════════════════════════════════════════════════
   Hand-drawn SVG path generators.

   All jitter is produced from a SEEDED deterministic PRNG so the same `seed`
   always yields the same path — this is what keeps SSR and client renders
   identical and avoids hydration mismatches. NEVER use Math.random() here.
   ═══════════════════════════════════════════════════════════════════════════ */

/** mulberry32 — tiny deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash so strings can seed a path. */
export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const f = (n: number) => n.toFixed(1);

function jitterLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rand: () => number,
  rough: number,
  steps = 3,
): string {
  let d = "";
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const last = i === steps;
    const x = x1 + (x2 - x1) * t + (last ? 0 : (rand() * 2 - 1) * rough);
    const y = y1 + (y2 - y1) * t + (last ? 0 : (rand() * 2 - 1) * rough);
    d += ` L ${f(x)} ${f(y)}`;
  }
  return d;
}

/** Closed, slightly wobbly rectangle inset by `pad`. */
export function roughRectPath(
  w: number,
  h: number,
  seed: number,
  opts: { rough?: number; pad?: number } = {},
): string {
  const { rough = 2, pad = 5 } = opts;
  if (w <= pad * 2 || h <= pad * 2) return "";
  const rand = mulberry32(seed);
  const c = () => (rand() * 2 - 1) * rough;
  const tl: [number, number] = [pad + c(), pad + c()];
  const tr: [number, number] = [w - pad + c(), pad + c()];
  const br: [number, number] = [w - pad + c(), h - pad + c()];
  const bl: [number, number] = [pad + c(), h - pad + c()];
  let d = `M ${f(tl[0])} ${f(tl[1])}`;
  d += jitterLine(tl[0], tl[1], tr[0], tr[1], rand, rough, 4);
  d += jitterLine(tr[0], tr[1], br[0], br[1], rand, rough, 4);
  d += jitterLine(br[0], br[1], bl[0], bl[1], rand, rough, 4);
  d += jitterLine(bl[0], bl[1], tl[0], tl[1], rand, rough, 4);
  d += " Z";
  return d;
}

/** Wobbly underline with a slight upward bow, spanning width `w`. */
export function roughUnderlinePath(
  w: number,
  seed: number,
  opts: { rough?: number; h?: number } = {},
): string {
  const { rough = 1.6, h = 10 } = opts;
  if (w <= 6) return "";
  const rand = mulberry32(seed);
  const baseY = h * 0.55;
  const steps = Math.max(5, Math.floor(w / 36));
  let d = `M 2 ${f(baseY + (rand() * 2 - 1) * rough)}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = 2 + (w - 4) * t;
    const y = baseY + (rand() * 2 - 1) * rough + Math.sin(t * Math.PI) * -2;
    d += ` L ${f(x)} ${f(y)}`;
  }
  return d;
}

/** Open, overshooting hand-drawn ellipse (a "circled word"). */
export function roughEllipsePath(
  w: number,
  h: number,
  seed: number,
  opts: { rough?: number } = {},
): string {
  const { rough = 2 } = opts;
  if (w <= 8 || h <= 8) return "";
  const rand = mulberry32(seed);
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - rough - 3;
  const ry = h / 2 - rough - 2;
  const start = -0.35 + rand() * 0.2;
  const end = Math.PI * 2 * 1.08;
  const steps = 26;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = start + (end - start) * (i / steps);
    const x = cx + Math.cos(a) * rx + (rand() * 2 - 1) * rough;
    const y = cy + Math.sin(a) * ry + (rand() * 2 - 1) * rough;
    d += i === 0 ? `M ${f(x)} ${f(y)}` : ` L ${f(x)} ${f(y)}`;
  }
  return d;
}

/** Wobbly horizontal divider line spanning width `w`. */
export function roughDividerPath(
  w: number,
  seed: number,
  opts: { rough?: number; h?: number } = {},
): string {
  const { rough = 1.4, h = 8 } = opts;
  if (w <= 6) return "";
  const rand = mulberry32(seed);
  const baseY = h / 2;
  const steps = Math.max(6, Math.floor(w / 28));
  let d = `M 2 ${f(baseY + (rand() * 2 - 1) * rough)}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = 2 + (w - 4) * t;
    const y = baseY + (rand() * 2 - 1) * rough;
    d += ` L ${f(x)} ${f(y)}`;
  }
  return d;
}
