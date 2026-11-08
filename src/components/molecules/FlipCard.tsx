import type { ReactNode } from 'react'
import { tiltClasses, tiltHoverClasses, type Tilt } from '../atoms/tilt'

type FlipCardProps = {
  icon: ReactNode
  name: string
  definition: string
  open: boolean
  locked: boolean
  tilt: Tilt
  onToggle: () => void
}

const face = 'sketch-border absolute inset-0 grid bg-paper backface-hidden transition-[opacity,background-color]'

export function FlipCard({ icon, name, definition, open, locked, tilt, onToggle }: FlipCardProps) {
  const hover = locked ? '' : `hover:scale-103 ${tiltHoverClasses[tilt]}`

  return (
    <button
      type="button"
      aria-pressed={open}
      onClick={locked ? undefined : onToggle}
      className={`relative block h-40 w-full perspective-[900px] transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-ink sm:h-46 sm:w-52.5 ${locked ? 'cursor-default' : 'cursor-pointer'} ${tiltClasses[tilt]} ${hover}`}
    >
      <span
        className={`absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(.3,.7,.3,1)] transform-3d motion-reduce:transform-none motion-reduce:transition-none ${open ? 'rotate-y-180' : ''}`}
      >
        <span
          aria-hidden={open}
          className={`${face} content-center justify-items-center gap-2 px-4.5 py-4 text-center ${open ? 'motion-reduce:opacity-0' : ''}`}
        >
          {icon}
          <span className="font-hand text-[22px] leading-tight">{name}</span>
        </span>
        <span
          aria-hidden={!open}
          className={`${face} content-start justify-items-start gap-2 px-4.5 pt-3.5 pb-4 text-left rotate-y-180 motion-reduce:rotate-y-0 ${open ? '' : 'motion-reduce:opacity-0'}`}
        >
          <span className="font-hand text-[15px] text-muted">{name}</span>
          <span className="font-note text-[17px] leading-snug">{definition}</span>
        </span>
      </span>
    </button>
  )
}
