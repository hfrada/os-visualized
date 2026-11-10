import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Title } from '../components/atoms/Title'
import { NoteCard } from '../components/molecules/NoteCard'
import { PlayButton } from '../components/molecules/PlayButton'
import { SketchSelect } from '../components/molecules/SketchSelect'
import { StepProgress } from '../components/molecules/StepProgress'
import { TabGroup } from '../components/molecules/TabGroup'
import { TopicQuote } from '../components/molecules/TopicQuote'
import { TopicSource } from '../components/molecules/TopicSource'
import { Breadcrumb } from '../components/organisms/Breadcrumb'
import { RoleDiagram, type AppId, type OsFlash, type RoleId, type RoleScene } from '../components/organisms/RoleDiagram'
import { Toolbar } from '../components/organisms/Toolbar'
import { TopicPager } from '../components/organisms/TopicPager'
import { LabTemplate } from '../components/templates/LabTemplate'
import { useRoundRobin } from '../hooks/useRoundRobin'
import { useStepPlayer } from '../hooks/useStepPlayer'
import { useToolbar } from '../hooks/useToolbar'
import { useTopicNavigation } from '../hooks/useTopicNavigation'
import type en from '../i18n/en.json'

type StepCaptions = (typeof en)['topics']['osRoles']['steps']
type StepCaption = { [Role in RoleId]: `steps.${Role}.${Extract<keyof StepCaptions[Role], string>}` }[RoleId]

type Step = {
  caption: StepCaption
  crashed?: boolean
  isolated?: boolean
  restart?: boolean
  open?: boolean
  memory?: boolean
  glue?: number
  flash?: boolean
}

const scenarios: Record<RoleId, Step[]> = {
  referee: [
    { caption: 'steps.referee.running' },
    { caption: 'steps.referee.bug', crashed: true },
    { caption: 'steps.referee.isolate', crashed: true, isolated: true, flash: true },
    { caption: 'steps.referee.restart', restart: true, flash: true },
  ],
  illusionist: [
    { caption: 'steps.illusionist.illusion' },
    { caption: 'steps.illusionist.reveal', open: true },
    { caption: 'steps.illusionist.turns', open: true },
    { caption: 'steps.illusionist.memory', open: true, memory: true },
    { caption: 'steps.illusionist.fast' },
  ],
  glue: [
    { caption: 'steps.glue.copy', glue: 1 },
    { caption: 'steps.glue.clipboard', glue: 2, flash: true },
    { caption: 'steps.glue.paste', glue: 3, flash: true },
    { caption: 'steps.glue.save', glue: 4, flash: true },
    { caption: 'steps.glue.open', glue: 5, flash: true },
  ],
}

const roles: RoleId[] = ['referee', 'illusionist', 'glue']
const appOrder: AppId[] = ['editor', 'chat', 'music']
const noRestarts: Record<AppId, number> = { editor: 0, chat: 0, music: 0 }
const delays = [0.5, 1, 1.5, 2, 3]
const travelMs = 900
const isolateDelayMs = 700
const curtainMs = 1000
const turnMs = 750

export function OsRolesPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'topics.osRoles' })
  const { t: tPlayback } = useTranslation('translation', { keyPrefix: 'playback' })
  const toolbar = useToolbar()
  const navigation = useTopicNavigation('osRoles')
  const [role, setRole] = useState<RoleId>('referee')
  const [crashed, setCrashed] = useState<AppId[]>([])
  const [restarts, setRestarts] = useState(noRestarts)
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [flashCount, setFlashCount] = useState(0)
  const [flashDelay, setFlashDelay] = useState(0)
  const [delay, setDelay] = useState(1.5)
  const steps = scenarios[role]
  const player = useStepPlayer({ steps: steps.length, delayMs: delay * 1000, travelMs })
  const step = player.target === null ? null : steps[player.target]
  const open = step ? Boolean(step.open) : curtainOpen
  const turn = useRoundRobin(role === 'illusionist' && open, { count: appOrder.length, startMs: curtainMs, stepMs: turnMs })

  const labels = {
    apps: { editor: t('diagram.apps.editor'), chat: t('diagram.apps.chat'), music: t('diagram.apps.music') },
    os: t('diagram.os'),
    cpu: t('diagram.cpu'),
    memory: t('diagram.memory'),
    disk: t('diagram.disk'),
    paintedCpu: t('diagram.paintedCpu'),
    paintedMemory: t('diagram.paintedMemory'),
    word: t('diagram.word'),
    file: t('diagram.file'),
    curtain: t('diagram.curtain'),
  }

  function sceneFor(): RoleScene {
    if (role === 'referee') {
      if (step) {
        return {
          role,
          crashed: step.crashed ? ['chat'] : [],
          isolated: step.isolated ? ['chat'] : [],
          isolateDelayMs: 0,
          restarts: step.restart ? { ...noRestarts, chat: 1 } : noRestarts,
        }
      }
      return { role, crashed, isolated: crashed, isolateDelayMs, restarts }
    }
    if (role === 'illusionist') {
      return { role, curtainOpen: open, turn: turn === null ? null : appOrder[turn], memoryFocus: Boolean(step?.memory) }
    }
    return { role, level: step?.glue ?? 0 }
  }

  const osFlash: OsFlash | null = step
    ? step.flash
      ? { key: `step-${player.target}`, delayMs: 0 }
      : null
    : flashCount > 0
      ? { key: `free-${flashCount}`, delayMs: flashDelay }
      : null

  function resetScene() {
    setCrashed([])
    setRestarts(noRestarts)
    setCurtainOpen(false)
    setFlashCount(0)
  }

  function changeRole(next: RoleId) {
    player.stop()
    resetScene()
    setRole(next)
  }

  function togglePlayback() {
    if (player.playing) {
      player.stop()
      return
    }
    resetScene()
    player.start()
  }

  function toggleApp(app: AppId) {
    const restart = crashed.includes(app)
    setCrashed((current) => (restart ? current.filter((item) => item !== app) : [...current, app]))
    if (restart) setRestarts((current) => ({ ...current, [app]: current[app] + 1 }))
    setFlashDelay(restart ? 0 : isolateDelayMs)
    setFlashCount((count) => count + 1)
  }

  function hint() {
    if (player.playing) return null
    if (role === 'referee') return t(crashed.length > 0 ? 'hints.restart' : 'hints.crash')
    if (role === 'illusionist') return t(curtainOpen ? 'hints.closeCurtain' : 'hints.openCurtain')
    return null
  }

  const term = t(`roles.${role}.term`)
  const note = hint()

  return (
    <LabTemplate
      breadcrumb={<Breadcrumb {...navigation.breadcrumb} />}
      toolbar={<Toolbar {...toolbar} />}
      title={
        <>
          <Title size="md">{t('title')}</Title>
          {navigation.source && <TopicSource {...navigation.source} />}
          <TopicQuote>{t('quote')}</TopicQuote>
        </>
      }
      controls={
        <>
          <TabGroup
            options={roles.map((value) => ({ value, label: t(`roles.${value}.tab`) }))}
            value={role}
            onChange={changeRole}
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
        <RoleDiagram
          scene={sceneFor()}
          labels={labels}
          interactive={!player.playing}
          osFlash={osFlash}
          onAppToggle={toggleApp}
          onCurtainToggle={() => setCurtainOpen((current) => !current)}
        />
      }
      detail={
        <NoteCard
          title={
            <>
              {t(`roles.${role}.name`)}
              {term && <span className="ml-2 text-xl font-normal text-muted">({term})</span>}
            </>
          }
        >
          <p>{t(`roles.${role}.summary`)}</p>
          {note && <p className="mt-2.5 text-muted">{note}</p>}
        </NoteCard>
      }
      progress={
        step && player.target !== null && (
          <StepProgress total={steps.length} current={player.target} caption={t(step.caption)} />
        )
      }
      pager={<TopicPager {...navigation.pager} />}
    />
  )
}
