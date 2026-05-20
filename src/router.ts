import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router'
import RootLayout from 'src/components/layouts/RootLayout'
import AuthPage from 'src/pages/AuthPage'
import ProjectsPage from 'src/pages/ProjectsPage'
import ProjectPage from 'src/pages/ProjectPage'

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/auth' }) },
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
})

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  projectsRoute,
  projectRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
