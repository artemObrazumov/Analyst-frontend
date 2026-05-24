import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useParams, Link } from '@tanstack/react-router'

const TABS = [
  { id: 1, label: 'Вкладка 1' },
  { id: 2, label: 'Вкладка 2' },
]

export default function ProjectPage() {
  const { projectId } = useParams({ from: '/projects/$projectId' })
  const [activeTab, setActiveTab] = useState(1)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-[20%] flex-col border-r border-border py-4">
        <div className="mb-6 flex items-center gap-1 px-4">
          <Link
            to="/projects"
            title="Все проекты"
            aria-label="Все проекты"
            className="rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-6 shrink-0" strokeWidth={2.25} />
          </Link>
          <p className="text-sm font-medium">Проект {projectId}</p>
        </div>

        <nav>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-none px-4 py-2 text-left text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 items-center justify-center">
        <p className="text-4xl font-bold text-muted-foreground">{activeTab}</p>
      </main>
    </div>
  )
}
