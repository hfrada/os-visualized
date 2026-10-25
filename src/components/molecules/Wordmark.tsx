import { sketchBlob } from '../../lib/sketch'

const stampPath = sketchBlob(7)

export function Wordmark({ text }: { text: string }) {
  return (
    <span className="relative inline-block leading-none">
      {text}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <clipPath id="wordmark-stamp" clipPathUnits="objectBoundingBox">
          <path d={stampPath} />
        </clipPath>
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-[0.18em] -left-[0.28em] size-[1.2em] bg-ink transition-colors select-none [clip-path:url(#wordmark-stamp)]"
      >
        <span className="absolute top-[0.18em] left-[0.28em] whitespace-nowrap text-paper transition-colors">{text}</span>
      </span>
    </span>
  )
}
