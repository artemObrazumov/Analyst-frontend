import { useState } from 'react'
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
      <aside className="flex w-[20%] flex-col border-r border-border p-4">
        <div className="mb-6">
          <Link
            to="/projects"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Все проекты
          </Link>
          <p className="mt-2 text-sm font-medium">Проект {projectId}</p>
        </div>

        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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
