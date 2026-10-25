type TopicSourceProps = {
  prefix: string
  author: string
  work: string
}

export function TopicSource({ prefix, author, work }: TopicSourceProps) {
  return (
    <p className="mt-1 font-hand text-lg text-muted">
      {prefix} {author}, <cite>{work}</cite>
    </p>
  )
}
