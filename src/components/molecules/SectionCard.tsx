import { Link } from 'react-router'
import { SketchBox } from '../atoms/SketchBox'
import type { Tilt } from '../atoms/tilt'

type SectionCardProps = {
  label: string
  tilt: Tilt
  to?: string
}

const boxClasses = 'grid h-28 w-full place-items-center px-4 sm:w-44'

export function SectionCard({ label, tilt, to }: SectionCardProps) {
  const content = <span className="text-center font-hand text-2xl">{label}</span>

  if (!to) {
    return (
      <SketchBox tilt={tilt} interactive={false} className={`cursor-not-allowed ${boxClasses}`}>
        {content}
      </SketchBox>
    )
  }

  return (
    <Link to={to} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
      <SketchBox tilt={tilt} className={boxClasses}>
        {content}
      </SketchBox>
    </Link>
  )
}
