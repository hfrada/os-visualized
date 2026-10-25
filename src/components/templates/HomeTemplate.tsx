import type { ReactNode } from 'react'

type HomeTemplateProps = {
  toolbar: ReactNode
  heading: ReactNode
  content: ReactNode
}

export function HomeTemplate({ toolbar, heading, content }: HomeTemplateProps) {
  return (
    <div className="flex min-h-svh flex-col px-4 py-6 sm:px-8">
      <header className="flex justify-end">{toolbar}</header>
      <main className="flex flex-1 flex-col items-center justify-center gap-14 py-12">
        {heading}
        {content}
      </main>
    </div>
  )
}
