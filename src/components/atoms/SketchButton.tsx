import type { ComponentProps } from 'react'
import { tiltClasses, tiltHoverClasses, type Tilt } from './tilt'

type SketchButtonProps = ComponentProps<'button'> & {
  tilt?: Tilt
}

export function SketchButton({ tilt = 'left', className = '', ...props }: SketchButtonProps) {
  return (
    <button
      type="button"
      className={`sketch-outline flex cursor-pointer items-center gap-2 bg-paper px-4 py-2 text-sm font-medium text-ink transition duration-150 hover:scale-103 ${tiltClasses[tilt]} ${tiltHoverClasses[tilt]} ${className}`}
      {...props}
    />
  )
}
