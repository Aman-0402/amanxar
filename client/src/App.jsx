import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, ScrollRestoration } from 'react-router-dom'
import RootLayout from '@components/layout/RootLayout'
import DashboardLayout from '@components/dashboard/DashboardLayout'
import ProtectedRoute from '@components/auth/ProtectedRoute'
import PageLoader from '@components/ui/PageLoader'

// ─── Lazy-load all page components ────────────────────────────────────────────
// This enables code-splitting — each page loads only when navigated to
const HomePage         = lazy(() => import('@pages/HomePage'))
const AboutPage        = lazy(() => import('@pages/AboutPage'))
const ProjectsPage     = lazy(() => import('@pages/ProjectsPage'))
const ProjectDetail    = lazy(() => import('@pages/ProjectDetailPage'))
const GalleryPage      = lazy(() => import('@pages/GalleryPage'))
const EbooksPage       = lazy(() => import('@pages/EbooksPage'))
const KnowledgeHubPage = lazy(() => import('@pages/KnowledgeHubPage'))
const ServicesPage     = lazy(() => import('@pages/ServicesPage'))
const ResourcesPage    = lazy(() => import('@pages/ResourcesPage'))
const ContactPage      = lazy(() => import('@pages/ContactPage'))
const NotFoundPage     = lazy(() => import('@pages/NotFoundPage'))
const LoginPage        = lazy(() => import('@pages/auth/LoginPage'))
const DashboardOverview = lazy(() => import('@pages/dashboard/DashboardOverviewPage'))
const DashboardProjects = lazy(() => import('@pages/dashboard/DashboardProjectsPage'))
const DashboardAbout    = lazy(() => import('@pages/dashboard/DashboardAboutPage'))
const DashboardTest     = lazy(() => import('@pages/dashboard/DashboardTestPage'))

// ─── Router configuration ─────────────────────────────────────────────────────
// import.meta.env.BASE_URL is injected by Vite from the `base` option.
// Locally it's '/', on GitHub Pages subdomain it's '/aman.ai/'.
// Without this basename, React Router starts at '/' while the HTML is served
// at '/aman.ai/' — no routes match and the screen stays blank.
const router = createBrowserRouter(
  [
  {
    path: '/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardOverview />
              </Suspense>
            ),
          },
          {
            path: 'projects',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardProjects />
              </Suspense>
            ),
          },
          {
            path: 'about',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardAbout />
              </Suspense>
            ),
          },
          {
            path: 'test',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardTest />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: 'projects',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectsPage />
          </Suspense>
        ),
      },
      {
        path: 'projects/:slug',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectDetail />
          </Suspense>
        ),
      },
      {
        path: 'gallery',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GalleryPage />
          </Suspense>
        ),
      },
      {
        path: 'ebooks',
        element: (
          <Suspense fallback={<PageLoader />}>
            <EbooksPage />
          </Suspense>
        ),
      },
      {
        path: 'knowledge-hub',
        element: (
          <Suspense fallback={<PageLoader />}>
            <KnowledgeHubPage />
          </Suspense>
        ),
      },
      {
        path: 'knowledge-hub/:category',
        element: (
          <Suspense fallback={<PageLoader />}>
            <KnowledgeHubPage />
          </Suspense>
        ),
      },
      {
        path: 'services',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ServicesPage />
          </Suspense>
        ),
      },
      {
        path: 'resources',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResourcesPage />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ContactPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
  ],
  { basename: import.meta.env.BASE_URL }
)

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return <RouterProvider router={router} />
}
