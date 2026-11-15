// Closed blobs: every control point sits inside the 500×500 viewBox, so the
// curve never touches its edges and each wave always renders whole.
const PATHS = {
  hero: "M70 150 C120 70 210 95 290 70 C380 42 460 60 482 140 C496 225 488 330 430 390 C370 452 270 470 180 452 C95 435 30 390 22 300 C15 230 35 190 70 150Z",
  chart:
    "M40 170 C75 85 175 100 255 80 C345 58 440 40 476 120 C496 190 492 300 430 350 C360 405 250 372 165 395 C90 415 22 360 18 280 C15 230 22 200 40 170Z",
  mission:
    "M28 140 C70 70 190 85 275 70 C375 52 468 85 480 170 C492 260 440 340 340 360 C240 380 130 400 68 345 C18 300 10 210 28 140Z",
};

export function Marea({ variant = "hero" }: { variant?: keyof typeof PATHS }) {
  return (
    <svg
      className={`marea marea-${variant}`}
      viewBox="0 0 500 500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`aqua-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop style={{ stopColor: "var(--reference-aqua-200)" }} />
          <stop
            offset=".5"
            style={{ stopColor: "var(--reference-aqua-100)" }}
          />
          <stop offset="1" style={{ stopColor: "var(--reference-aqua-300)" }} />
        </linearGradient>
      </defs>
      <path d={PATHS[variant]} fill={`url(#aqua-${variant})`} />
    </svg>
  );
}
