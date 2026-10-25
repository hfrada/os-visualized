import type { ComponentProps } from 'react'
import { tiltClasses, tiltHoverClasses, type Tilt } from './tilt'

type SketchBoxProps = ComponentProps<'div'> & {
  tilt?: Tilt
  interactive?: boolean
}

export function SketchBox({ tilt = 'left', interactive = true, className = '', ...props }: SketchBoxProps) {
  const hover = interactive ? `hover:scale-103 ${tiltHoverClasses[tilt]}` : ''

  return (
    <div
      className={`sketch-border relative bg-paper transition duration-150 ${tiltClasses[tilt]} ${hover} ${className}`}
      {...props}
    />
  )
}
