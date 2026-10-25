import { sketchCircle } from '../../lib/sketch'

type StepProgressProps = {
  total: number
  current: number
  caption: string
}

const gap = 22

export function StepProgress({ total, current, caption }: StepProgressProps) {
  return (
    <div className="pl-1">
      <svg width={total * gap} height="20" viewBox={`0 0 ${total * gap} 20`} aria-hidden="true">
        {Array.from({ length: total }, (_, index) => {
          const cx = gap / 2 + index * gap
          return (
            <g key={index}>
              {index < current && <circle cx={cx} cy="10" r="3.5" className="fill-ink opacity-55" />}
              {index === current && <circle cx={cx} cy="10" r="4.5" className="fill-marker" />}
              <path d={sketchCircle(cx, 10, 6.5, 200 + index)} strokeWidth="1.6" className="fill-none stroke-ink" />
            </g>
          )
        })}
      </svg>
      <p aria-live="polite" className="mt-2.5 font-note text-xl leading-snug">
        <span className="mr-2 font-hand text-base text-muted">
          {current + 1}/{total}
        </span>
        {caption}
      </p>
    </div>
  )
}
