import type { ReactNode } from 'react'

type NoteCardProps = {
  title?: string
  children: ReactNode
}

export function NoteCard({ title, children }: NoteCardProps) {
  return (
    <div className="sketch-border relative min-h-36 px-5 py-4 font-note text-xl leading-snug">
      {title && <h2 className="mb-1.5 font-hand text-2xl font-bold">{title}</h2>}
      {children}
    </div>
  )
}
