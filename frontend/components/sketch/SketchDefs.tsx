/**
 * SketchDefs — global SVG <defs> mounted once in the root layout.
 * Holds the shared "wobble" displacement filter so sketch shapes can reference
 * `filter: url(#sketch-wobble)` without each redefining it. The filter itself
 * is static (we never animate it — that would be GPU-expensive); motion comes
 * from animating path `pathLength` instead.
 */
export default function SketchDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="sketch-wobble">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={2.2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
