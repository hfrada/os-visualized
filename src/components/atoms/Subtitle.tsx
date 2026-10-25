import type { ReactNode } from 'react'

export function Subtitle({ children }: { children: ReactNode }) {
  return <p className="font-hand text-xl text-muted">{children}</p>
}
