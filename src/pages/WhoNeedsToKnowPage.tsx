import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Title } from '../components/atoms/Title'
import { NoteCard } from '../components/molecules/NoteCard'
import { PlayButton } from '../components/molecules/PlayButton'
import { SketchSelect } from '../components/molecules/SketchSelect'
import { StepProgress } from '../components/molecules/StepProgress'
import { TopicSource } from '../components/molecules/TopicSource'
import { Breadcrumb } from '../components/organisms/Breadcrumb'
import { KnowledgeLadder, type PersonId, type RungId } from '../components/organisms/KnowledgeLadder'
import { Toolbar } from '../components/organisms/Toolbar'
import { TopicPager } from '../components/organisms/TopicPager'
import { LabTemplate } from '../components/templates/LabTemplate'
import { useStepPlayer } from '../hooks/useStepPlayer'
import { useToolbar } from '../hooks/useToolbar'
import { useTopicNavigation } from '../hooks/useTopicNavigation'

const order: PersonId[] = ['user', 'programmer', 'designer']
const delays = [0.5, 1, 1.5, 2, 3]
const settleMs = 400

export function WhoNeedsToKnowPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'topics.whoNeedsToKnow' })
  const { t: tPlayback } = useTranslation('translation', { keyPrefix: 'playback' })
  const toolbar = useToolbar()
  const navigation = useTopicNavigation('whoNeedsToKnow')
  const [selected, setSelected] = useState<PersonId | null>(null)
  const [delay, setDelay] = useState(1.5)
  const player = useStepPlayer({ steps: order.length, delayMs: delay * 1000, travelMs: settleMs })

  const shown = player.target === null ? selected : order[player.target]
  const rungLabels: Record<RungId, string> = {
    app: t('rungs.app'),
    util: t('rungs.util'),
    os: t('rungs.os'),
    hw: t('rungs.hw'),
  }
  const names: Record<PersonId, string> = {
    user: t('people.user.name'),
    programmer: t('people.programmer.name'),
    designer: t('people.designer.name'),
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
        <KnowledgeLadder
          rungLabels={rungLabels}
          personNames={names}
          selected={shown}
          interactive={!player.playing}
          onSelect={(person) => setSelected((current) => (current === person ? null : person))}
        />
      }
      detail={
        shown ? (
          <NoteCard title={names[shown]}>
            <p>{t(`people.${shown}.reason`)}</p>
          </NoteCard>
        ) : (
          <NoteCard>
            <p className="text-muted">{t('hint')}</p>
          </NoteCard>
        )
      }
      progress={player.target !== null && <StepProgress total={order.length} current={player.target} />}
      pager={<TopicPager {...navigation.pager} />}
    />
  )
}
