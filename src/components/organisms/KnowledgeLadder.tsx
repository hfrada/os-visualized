import type { KeyboardEvent } from 'react'
import { sketchArrow, sketchRect, stickFigure } from '../../lib/sketch'

export type RungId = 'app' | 'util' | 'os' | 'hw'
export type PersonId = 'user' | 'programmer' | 'designer'

type Rung = {
  id: RungId
  y: number
  width: number
}

type Person = {
  id: PersonId
  x: number
  y: number
  reach: RungId[]
  limit: number
}

const rungLeft = 250
const rungHeight = 64

const rungs: Rung[] = [
  { id: 'app', y: 20, width: 236 },
  { id: 'util', y: 94, width: 284 },
  { id: 'os', y: 168, width: 332 },
  { id: 'hw', y: 242, width: 380 },
]

const people: Person[] = [
  { id: 'user', x: 70, y: 46, reach: ['app'], limit: 0 },
  { id: 'programmer', x: 70, y: 157, reach: ['util', 'os'], limit: 2 },
  { id: 'designer', x: 70, y: 268, reach: ['hw'], limit: 3 },
]

const outlines = rungs.map((rung, index) => ({
  main: sketchRect(rungLeft, rung.y, rung.width, rungHeight, 21 + index),
  faint: sketchRect(rungLeft - 3, rung.y - 3, rung.width + 2, rungHeight + 1, 61 + index),
}))

const figures = people.map((person, index) => stickFigure(person.x, person.y, 90 + index))

const arrows = people.map((person, index) =>
  person.reach.map((id, branch) => {
    const rung = rungs[rungs.findIndex((candidate) => candidate.id === id)]
    return sketchArrow(person.x + 26, person.y - 8, rungLeft - 10, rung.y + rungHeight / 2, 300 + index * 10 + branch)
  }),
)

type KnowledgeLadderProps = {
  rungLabels: Record<RungId, string>
  personNames: Record<PersonId, string>
  selected: PersonId | null
  interactive: boolean
  onSelect: (person: PersonId) => void
}

export function KnowledgeLadder({ rungLabels, personNames, selected, interactive, onSelect }: KnowledgeLadderProps) {
  const active = people.find((person) => person.id === selected)

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, person: PersonId) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(person)
  }

  return (
    <svg viewBox="0 0 650 330" className="block h-auto w-full max-w-[650px] select-none">
      <g strokeLinecap="round" strokeLinejoin="round">
        {rungs.map((rung, index) => {
          const faded = active !== undefined && index > active.limit
          return (
            <g key={rung.id} className={`transition-opacity duration-200 ${faded ? 'opacity-22' : ''}`}>
              {active?.reach.includes(rung.id) && (
                <rect
                  x={rungLeft + 7}
                  y={rung.y + 7}
                  width={rung.width - 14}
                  height={rungHeight - 14}
                  rx="6"
                  className="fill-highlight"
                />
              )}
              <path d={outlines[index].main} strokeWidth="2" className="fill-none stroke-ink" />
              <path d={outlines[index].faint} strokeWidth="1.3" opacity="0.45" className="fill-none stroke-ink" />
              <text x={rungLeft + 20} y={rung.y + 40} fontSize="21" className="fill-ink font-hand">
                {rungLabels[rung.id]}
              </text>
            </g>
          )
        })}

        {people.map((person, index) => {
          const lit = selected === person.id
          const dim = selected !== null && !lit
          return arrows[index].map((path, branch) => (
            <path
              key={`${person.id}-${branch}`}
              d={path}
              strokeWidth={lit ? 2.6 : 1.8}
              className={`fill-none transition-opacity duration-200 ${lit ? 'stroke-marker' : 'stroke-ink'} ${dim ? 'opacity-30' : ''}`}
            />
          ))
        })}

        {people.map((person, index) => {
          const on = selected === person.id
          const box = on
            ? 'fill-highlight'
            : interactive
              ? 'fill-transparent group-hover:fill-highlight-soft group-focus-visible:fill-highlight-soft'
              : 'fill-transparent'
          return (
            <g
              key={person.id}
              role="button"
              tabIndex={interactive ? 0 : -1}
              aria-label={personNames[person.id]}
              aria-pressed={on}
              className={`group outline-none ${interactive ? 'cursor-pointer' : ''}`}
              onClick={interactive ? () => onSelect(person.id) : undefined}
              onKeyDown={interactive ? (event) => handleKeyDown(event, person.id) : undefined}
            >
              <rect x={person.x - 62} y={person.y - 42} width="124" height="80" rx="10" className={box} />
              <path d={figures[index]} strokeWidth="1.6" className="fill-none stroke-ink" />
              <text x={person.x} y={person.y + 32} fontSize="15" textAnchor="middle" className="fill-ink font-hand">
                {personNames[person.id]}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
