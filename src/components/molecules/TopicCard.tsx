import { Link } from 'react-router'
import { SketchBox } from '../atoms/SketchBox'
import type { Tilt } from '../atoms/tilt'

type TopicCardProps = {
  number: number
  label: string
  to: string
  tilt: Tilt
}

export function TopicCard({ number, label, to, tilt }: TopicCardProps) {
  return (
    <Link to={to} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
      <SketchBox
        tilt={tilt}
        className="grid h-33 w-full content-center justify-items-center gap-0.5 px-5 text-center sm:w-65"
      >
        <span className="font-hand text-base text-muted">{String(number).padStart(2, '0')}</span>
        <span className="font-hand text-2xl leading-tight">{label}</span>
      </SketchBox>
    </Link>
  )
}
