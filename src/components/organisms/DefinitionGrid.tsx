import { DefinitionIcon, type DefinitionIconKind } from '../atoms/DefinitionIcon'
import { FlipCard } from '../molecules/FlipCard'

type Definition = {
  kind: DefinitionIconKind
  name: string
  text: string
}

type DefinitionGridProps = {
  definitions: Definition[]
  open: (index: number) => boolean
  locked: boolean
  onToggle: (index: number) => void
}

export function DefinitionGrid({ definitions, open, locked, onToggle }: DefinitionGridProps) {
  return (
    <ul className="flex flex-wrap justify-center gap-7">
      {definitions.map((definition, index) => (
        <li key={definition.kind} className="w-full max-w-sm sm:w-auto">
          <FlipCard
            icon={<DefinitionIcon kind={definition.kind} />}
            name={definition.name}
            definition={definition.text}
            open={open(index)}
            locked={locked}
            tilt={index % 2 === 0 ? 'left' : 'right'}
            onToggle={() => onToggle(index)}
          />
        </li>
      ))}
    </ul>
  )
}
