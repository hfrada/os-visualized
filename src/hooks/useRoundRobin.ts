import { useEffect, useState } from 'react'

type RoundRobinOptions = {
  count: number
  startMs: number
  stepMs: number
}

export function useRoundRobin(active: boolean, { count, startMs, stepMs }: RoundRobinOptions) {
  const [current, setCurrent] = useState<number | null>(null)

  useEffect(() => {
    if (!active) return
    let next = 0
    let interval: ReturnType<typeof setInterval> | undefined
    const start = setTimeout(() => {
      setCurrent(next)
      interval = setInterval(() => {
        next = (next + 1) % count
        setCurrent(next)
      }, stepMs)
    }, startMs)
    return () => {
      clearTimeout(start)
      clearInterval(interval)
      setCurrent(null)
    }
  }, [active, count, startMs, stepMs])

  return current
}
