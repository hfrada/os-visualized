export type Tilt = 'left' | 'right'

export const tiltClasses: Record<Tilt, string> = {
  left: '-rotate-1',
  right: 'rotate-[0.8deg]',
}

export const tiltHoverClasses: Record<Tilt, string> = {
  left: 'hover:rotate-[0.5deg]',
  right: 'hover:-rotate-[0.5deg]',
}
