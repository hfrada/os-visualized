import { SketchBox, type Tilt } from '../atoms/SketchBox'

type SectionCardProps = {
  label: string
  tilt: Tilt
}

export function SectionCard({ label, tilt }: SectionCardProps) {
  return (
    <SketchBox tilt={tilt} className="grid h-28 w-full place-items-center px-4 sm:w-44">
      <span className="text-center font-hand text-2xl">{label}</span>
    </SketchBox>
  )
}
