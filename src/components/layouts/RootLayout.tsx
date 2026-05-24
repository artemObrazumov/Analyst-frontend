import { Outlet } from '@tanstack/react-router'
import Toaster from 'src/components/ui/Toaster'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
      <Toaster />
    </div>
  )
}
