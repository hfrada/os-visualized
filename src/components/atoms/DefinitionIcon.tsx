import type { ReactNode } from 'react'

export type DefinitionIconKind =
  | 'hardwareController'
  | 'abstraction'
  | 'workOrganizer'
  | 'resourceManager'
  | 'controlProgram'
  | 'kernel'
  | 'guardian'

const shapes: Record<DefinitionIconKind, ReactNode> = {
  hardwareController: (
    <>
      <path d="M14 9.5v29M24 10v28.6M34 9.6v28.9" />
      <circle cx="14" cy="30" r="3.8" className="fill-paper" />
      <circle cx="24" cy="17" r="3.8" className="fill-paper" />
      <circle cx="34" cy="25" r="3.8" className="fill-paper" />
    </>
  ),
  abstraction: (
    <>
      <path d="M9 9.5h30c.5 5.5.5 11 0 16.5H9c-.5-5.5-.5-11 0-16.5z" />
      <circle cx="24" cy="17.8" r="3.6" />
      <path d="M12 31c3 3 5-2 8 1s4 4 6 0 5-3 8 1 3 2 4 0M14.5 37c2.5 2 4.5-1.5 7 .5s4 2.5 6-.5 4-2 7 .8" />
    </>
  ),
  workOrganizer: (
    <>
      <path d="M12.2 10.4h23.4c.6 9.5.6 20.2-.2 30.6H12.6c-.8-10.3-.9-20.6-.4-30.6z" />
      <path d="M19.4 8h9.3l.2 5.2h-9.6z" />
      <path d="M16.8 21.6l2.2 2.2 4.1-4.4M26.3 22h6M16.8 31l2.2 2.2 4.1-4.4M26.3 31.4h6" />
    </>
  ),
  resourceManager: (
    <>
      <path d="M24 7.5v30.8M14.5 39.6h19.2M9.6 13.6c9.6-.6 19.2-.7 28.8.2" />
      <path d="M9.8 13.8L4.3 25.2M9.8 13.8l5.8 11.4M38.2 14L32.6 25.3M38.2 14l5.6 11.3" />
      <path d="M3.8 25.3c1.7 4.3 10.3 4.4 12.2 0M32.2 25.4c1.7 4.3 10.4 4.3 12 0" />
    </>
  ),
  controlProgram: (
    <>
      <path d="M9.8 35.6c.4-3.7 28-4 28.4 0v3.3c-.3 3.4-28.1 3.6-28.4 0z" />
      <path d="M24 33.4c-.2-5.8-.1-11.6.2-17.3" />
      <circle cx="24.1" cy="11.6" r="5.2" />
      <circle cx="33" cy="35.8" r="1.6" />
    </>
  ),
  kernel: (
    <>
      <path d="M24 39.6C14 32.6 7.8 26.4 8 19.2c.2-4.8 3.8-8 8-8 3.6 0 6 2 8 5 2-3 4.5-5 8-5 4.2 0 8 3.2 8 8.2 0 7.2-6 13.2-16 20.2z" />
      <path d="M11 23.4h7l2.5-4.2 3 8.4 2.6-6.2 1.5 2h9.4" />
    </>
  ),
  guardian: (
    <>
      <path d="M24 6c5 3 10.2 4 15.2 4.2-.2 14.2-4.2 24-15.2 30.4C13 34.2 9 24.4 8.8 10.2 13.8 10 19 9 24 6z" />
      <path d="M17.8 23.6l4.2 4 8.2-8.4" />
    </>
  ),
}

export function DefinitionIcon({ kind }: { kind: DefinitionIconKind }) {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[kind]}
    </svg>
  )
}
