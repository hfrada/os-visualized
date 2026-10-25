import { PlayIcon } from '../atoms/PlayIcon'
import { SketchButton } from '../atoms/SketchButton'
import { StopIcon } from '../atoms/StopIcon'

type PlayButtonProps = {
  playing: boolean
  startLabel: string
  stopLabel: string
  onClick: () => void
}

export function PlayButton({ playing, startLabel, stopLabel, onClick }: PlayButtonProps) {
  return (
    <SketchButton onClick={onClick} className="min-w-32 justify-center">
      {playing ? <StopIcon /> : <PlayIcon />}
      {playing ? stopLabel : startLabel}
    </SketchButton>
  )
}
