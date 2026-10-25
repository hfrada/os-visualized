import type { ComponentProps } from 'react'

export type Tilt = 'left' | 'right'

const tiltClasses: Record<Tilt, string> = {
  left: '-rotate-1 hover:rotate-[0.5deg]',
  right: 'rotate-[0.8deg] hover:-rotate-[0.5deg]',
}

type SketchBoxProps = ComponentProps<'div'> & {
  tilt?: Tilt
}

export function SketchBox({ tilt = 'left', className = '', ...props }: SketchBoxProps) {
  return (
    <div
      className={`sketch-border bg-paper transition duration-150 hover:scale-103 ${tiltClasses[tilt]} ${className}`}
      {...props}
    />
  )
}
