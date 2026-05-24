import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
} from '@tanstack/react-router'
import RootLayout from 'src/components/layouts/RootLayout'
import AuthPage from 'src/pages/AuthPage'
import ProjectsPage from 'src/pages/ProjectsPage'
import ProjectPage from 'src/pages/ProjectPage'
import { ensureAuthInitialized } from 'src/stores/auth.store'
import { useAuthStore } from 'src/stores/auth.store'

async function requireAuth() {
  await ensureAuthInitialized()
  if (!useAuthStore.getState().isAuthenticated) {
    throw redirect({ to: '/auth' })
  }
}

async function requireGuest() {
  await ensureAuthInitialized()
  if (useAuthStore.getState().isAuthenticated) {
    throw redirect({ to: '/projects' })
  }
}

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    await ensureAuthInitialized()
    throw redirect({
      to: useAuthStore.getState().isAuthenticated ? '/projects' : '/auth',
    })
  },
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage,
  beforeLoad: requireGuest,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: ProjectsPage,
  beforeLoad: requireAuth,
})

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectPage,
  beforeLoad: requireAuth,
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
