interface ProjectTabPlaceholderProps {
  title: string
}

export default function ProjectTabPlaceholder({
  title,
}: ProjectTabPlaceholderProps) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">Раздел в разработке.</p>
    </div>
  )
}
