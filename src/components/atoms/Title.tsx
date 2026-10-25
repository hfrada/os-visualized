import type { ReactNode } from 'react'

export function Title({ children }: { children: ReactNode }) {
  return <h1 className="font-hand text-5xl font-bold sm:text-6xl">{children}</h1>
}
