import { SectionCard } from '../molecules/SectionCard'

type Section = {
  key: string
  label: string
}

export function SectionGrid({ sections }: { sections: Section[] }) {
  return (
    <ul className="flex w-full max-w-6xl flex-wrap justify-center gap-8">
      {sections.map((section, index) => (
        <li key={section.key} className="w-full max-w-xs sm:w-auto">
          <SectionCard label={section.label} tilt={index % 2 === 0 ? 'left' : 'right'} />
        </li>
      ))}
    </ul>
  )
}
