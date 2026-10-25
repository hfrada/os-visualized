export type SectionKey = 'fundamentals' | 'processes' | 'memory' | 'storage' | 'caseStudies'
export type TopicKey = 'computerSystemLayers'

export type Topic = {
  key: TopicKey
  slug: string
  source?: {
    author: string
    work: string
  }
}

export type Section = {
  key: SectionKey
  slug: string
  topics: Topic[]
}

export const sections: Section[] = [
  {
    key: 'fundamentals',
    slug: 'fundamentals',
    topics: [
      {
        key: 'computerSystemLayers',
        slug: 'computer-system-layers',
        source: { author: 'Silberschatz et al.', work: 'Operating System Concepts' },
      },
    ],
  },
  { key: 'processes', slug: 'processes', topics: [] },
  { key: 'memory', slug: 'memory', topics: [] },
  { key: 'storage', slug: 'storage', topics: [] },
  { key: 'caseStudies', slug: 'case-studies', topics: [] },
]

export function sectionPath(section: Section) {
  return `/${section.slug}`
}

export function topicPath(section: Section, topic: Topic) {
  return `/${section.slug}/${topic.slug}`
}

export function locateTopic(key: TopicKey) {
  for (const section of sections) {
    const index = section.topics.findIndex((topic) => topic.key === key)
    if (index !== -1) return { section, topic: section.topics[index], index }
  }
  throw new Error(`Unknown topic: ${key}`)
}
