import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { ComputerSystemLayersPage } from './pages/ComputerSystemLayersPage'
import { HomePage } from './pages/HomePage'
import { OsDefinitionsPage } from './pages/OsDefinitionsPage'
import { OsRolesPage } from './pages/OsRolesPage'
import { SectionPage } from './pages/SectionPage'
import { WhoNeedsToKnowPage } from './pages/WhoNeedsToKnowPage'
import { RootLayout } from './RootLayout'
import { sectionPath, sections, topicPath, type TopicKey } from './sections'

const topicPages: Record<TopicKey, ComponentType> = {
  computerSystemLayers: ComputerSystemLayersPage,
  whoNeedsToKnow: WhoNeedsToKnowPage,
  osDefinitions: OsDefinitionsPage,
  osRoles: OsRolesPage,
}

const sectionRoutes: RouteObject[] = sections
  .filter((section) => section.topics.length > 0)
  .flatMap((section) => [
    { path: sectionPath(section), element: <SectionPage section={section} /> },
    ...section.topics.map((topic) => {
      const Page = topicPages[topic.key]
      return { path: topicPath(section, topic), element: <Page /> }
    }),
  ])

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [{ path: '/', element: <HomePage /> }, ...sectionRoutes],
  },
])
