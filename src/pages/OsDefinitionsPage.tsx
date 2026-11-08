import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { DefinitionIconKind } from '../components/atoms/DefinitionIcon'
import { SketchButton } from '../components/atoms/SketchButton'
import { Title } from '../components/atoms/Title'
import { PlayButton } from '../components/molecules/PlayButton'
import { SketchSelect } from '../components/molecules/SketchSelect'
import { StepProgress } from '../components/molecules/StepProgress'
import { TopicSource } from '../components/molecules/TopicSource'
import { Breadcrumb } from '../components/organisms/Breadcrumb'
import { DefinitionGrid } from '../components/organisms/DefinitionGrid'
import { Toolbar } from '../components/organisms/Toolbar'
import { TopicPager } from '../components/organisms/TopicPager'
import { DeckTemplate } from '../components/templates/DeckTemplate'
import { useStepPlayer } from '../hooks/useStepPlayer'
import { useToolbar } from '../hooks/useToolbar'
import { useTopicNavigation } from '../hooks/useTopicNavigation'

const kinds: DefinitionIconKind[] = [
  'hardwareController',
  'abstraction',
  'workOrganizer',
  'resourceManager',
  'controlProgram',
  'kernel',
  'guardian',
]
const delays = [0.5, 1, 1.5, 2, 3]
const flipMs = 550

export function OsDefinitionsPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'topics.osDefinitions' })
  const { t: tPlayback } = useTranslation('translation', { keyPrefix: 'playback' })
  const toolbar = useToolbar()
  const navigation = useTopicNavigation('osDefinitions')
  const [opened, setOpened] = useState<number[]>([])
  const [delay, setDelay] = useState(1.5)
  const player = useStepPlayer({ steps: kinds.length, delayMs: delay * 1000, travelMs: flipMs })

  const allOpen = opened.length === kinds.length
  const definitions = kinds.map((kind) => ({
    kind,
    name: t(`cards.${kind}.name`),
    text: t(`cards.${kind}.definition`),
  }))

  function toggle(index: number) {
    setOpened((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]))
  }

  function togglePlayback() {
    if (player.playing) {
      player.stop()
      return
    }
    setOpened([])
    player.start()
  }

  return (
    <DeckTemplate
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
          <SketchButton
            tilt="right"
            disabled={player.playing}
            onClick={() => setOpened(allOpen ? [] : kinds.map((_, index) => index))}
          >
            {allOpen ? t('hideAll') : t('showAll')}
          </SketchButton>
          {player.target !== null && <StepProgress inline total={kinds.length} current={player.target} />}
        </>
      }
      content={
        <DefinitionGrid
          definitions={definitions}
          open={(index) => (player.target === null ? opened.includes(index) : player.target === index)}
          locked={player.playing}
          onToggle={toggle}
        />
      }
      closing={
        <p className="font-note text-[22px] leading-snug">
          <Trans
            t={t}
            i18nKey="closing"
            components={{
              mark: (
                <mark className="bg-transparent bg-[linear-gradient(100deg,transparent_1%,var(--color-highlight)_3%,var(--color-highlight)_97%,transparent_99%)] px-1 text-inherit" />
              ),
            }}
          />
        </p>
      }
      pager={<TopicPager {...navigation.pager} />}
    />
  )
}
