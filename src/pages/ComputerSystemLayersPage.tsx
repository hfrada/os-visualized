import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Title } from '../components/atoms/Title'
import { NoteCard } from '../components/molecules/NoteCard'
import { PlayButton } from '../components/molecules/PlayButton'
import { SketchSelect } from '../components/molecules/SketchSelect'
import { StepProgress } from '../components/molecules/StepProgress'
import { TabGroup } from '../components/molecules/TabGroup'
import { TopicSource } from '../components/molecules/TopicSource'
import { Breadcrumb } from '../components/organisms/Breadcrumb'
import { LayerDiagram, type DiagramView, type Lane, type LayerId } from '../components/organisms/LayerDiagram'
import { Toolbar } from '../components/organisms/Toolbar'
import { TopicPager } from '../components/organisms/TopicPager'
import { LabTemplate } from '../components/templates/LabTemplate'
import { useStepPlayer } from '../hooks/useStepPlayer'
import { useToolbar } from '../hooks/useToolbar'
import { useTopicNavigation } from '../hooks/useTopicNavigation'

const steps = [
  { key: 'press', layer: 'user', lane: 'down' },
  { key: 'request', layer: 'app', lane: 'down' },
  { key: 'command', layer: 'os', lane: 'down' },
  { key: 'write', layer: 'hw', lane: 'down' },
  { key: 'reply', layer: 'os', lane: 'up' },
  { key: 'show', layer: 'app', lane: 'up' },
  { key: 'see', layer: 'user', lane: 'up' },
] as const satisfies readonly { key: string; layer: LayerId; lane: Lane }[]

const delays = [0.5, 1, 1.5, 2, 3]
const travelMs = 700
const userNumbers = [1, 2, 3, 4]

export function ComputerSystemLayersPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'topics.computerSystemLayers' })
  const { t: tPlayback } = useTranslation('translation', { keyPrefix: 'playback' })
  const toolbar = useToolbar()
  const navigation = useTopicNavigation('computerSystemLayers')
  const [view, setView] = useState<DiagramView>('onion')
  const [selected, setSelected] = useState<LayerId | null>(null)
  const [hovered, setHovered] = useState<LayerId | null>(null)
  const [delay, setDelay] = useState(1.5)
  const player = useStepPlayer({ steps: steps.length, delayMs: delay * 1000, travelMs })

  const names: Record<LayerId, string> = {
    user: t('layers.user.name'),
    app: t('layers.app.name'),
    os: t('layers.os.name'),
    hw: t('layers.hw.name'),
  }
  const target = player.target === null ? null : steps[player.target]
  const highlighted = player.current === null ? selected : steps[player.current].layer

  function changeView(next: DiagramView) {
    player.stop()
    setSelected(null)
    setView(next)
  }

  function togglePlayback() {
    if (player.playing) {
      player.stop()
      return
    }
    setSelected(null)
    player.start()
  }

  return (
    <LabTemplate
      breadcrumb={<Breadcrumb {...navigation.breadcrumb} />}
      toolbar={<Toolbar {...toolbar} />}
      title={
        <>
          <Title size="md">{t('title')}</Title>
          {navigation.source && <TopicSource {...navigation.source} />}
        </>
      }
      controls={
        <>
          <TabGroup
            options={[
              { value: 'onion', label: t('views.onion') },
              { value: 'stack', label: t('views.stack') },
            ]}
            value={view}
            onChange={changeView}
          />
          <SketchSelect
            label={tPlayback('delay')}
            options={delays.map((value) => ({ value, label: tPlayback('seconds', { value }) }))}
            value={delay}
            onChange={setDelay}
          />
          <PlayButton
            playing={player.playing}
            startLabel={tPlayback('start')}
            stopLabel={tPlayback('stop')}
            onClick={togglePlayback}
          />
        </>
      }
      stage={
        <LayerDiagram
          view={view}
          names={names}
          userLabels={userNumbers.map((number) => t('user', { number }))}
          highlighted={highlighted}
          hovered={player.playing ? null : hovered}
          interactive={!player.playing}
          onHover={setHovered}
          onSelect={(layer) => setSelected((current) => (current === layer ? null : layer))}
          dot={target && { layer: target.layer, lane: target.lane }}
          travelMs={travelMs}
        />
      }
      detail={
        highlighted ? (
          <NoteCard title={names[highlighted]}>
            <p>{t(`layers.${highlighted}.detail`)}</p>
          </NoteCard>
        ) : (
          <NoteCard>
            <p className="text-muted">{t('hint')}</p>
          </NoteCard>
        )
      }
      progress={
        player.current !== null && (
          <StepProgress
            total={steps.length}
            current={player.current}
            caption={t(`steps.${steps[player.current].key}`)}
          />
        )
      }
      pager={<TopicPager {...navigation.pager} />}
    />
  )
}
