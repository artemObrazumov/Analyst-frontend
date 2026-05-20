import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import RootLayout from 'src/components/layouts/RootLayout'
import DashboardPage from 'src/pages/DashboardPage'

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
