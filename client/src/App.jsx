import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
const DashboardSkills   = lazy(() => import('@pages/dashboard/DashboardSkillsPage'))
const DashboardTechStack = lazy(() => import('@pages/dashboard/DashboardTechStackPage'))
const DashboardTimeline = lazy(() => import('@pages/dashboard/DashboardTimelinePage'))
const DashboardMessages = lazy(() => import('@pages/dashboard/DashboardMessagesPage'))
const DashboardEbooks   = lazy(() => import('@pages/dashboard/DashboardEbooksPage'))
const DashboardKnowledgeHub = lazy(() => import('@pages/dashboard/DashboardKnowledgeHubPage'))
const DashboardGallery  = lazy(() => import('@pages/dashboard/DashboardGalleryPage'))
const DashboardServices = lazy(() => import('@pages/dashboard/DashboardServicesPage'))
const DashboardNavbarFooter = lazy(() => import('@pages/dashboard/DashboardNavbarFooterPage'))
const DashboardTest     = lazy(() => import('@pages/dashboard/DashboardTestPage'))
const DashboardUsers    = lazy(() => import('@pages/dashboard/DashboardUsersPage'))
const DashboardAssessments = lazy(() => import('@pages/dashboard/DashboardAssessmentsPage'))
const DashboardAssessmentEditor = lazy(() => import('@pages/dashboard/DashboardAssessmentEditorPage'))
const DashboardSettings         = lazy(() => import('@pages/dashboard/DashboardSettingsPage'))

// ─── Student portal pages ──────────────────────────────────────────────────────
const StudentLayout   = lazy(() => import('@pages/student/StudentLayout'))
const StudentHome     = lazy(() => import('@pages/student/StudentHomePage'))
const StudentCourses   = lazy(() => import('@pages/student/StudentCoursesPage'))
const StudentLearning    = lazy(() => import('@pages/student/StudentMyLearningPage'))
const StudentAssessments = lazy(() => import('@pages/student/StudentAssessmentsPage'))
const StudentExam        = lazy(() => import('@pages/student/StudentExamPage'))
const StudentServices = lazy(() => import('@pages/student/StudentServicesPage'))
const StudentRequest  = lazy(() => import('@pages/student/StudentRequestPage'))
const StudentProfile  = lazy(() => import('@pages/student/StudentProfilePage'))

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
    path: '/student',
    element: <ProtectedRoute allowedRoles={['student']} />,
    children: [
      {
        element: (
          <Suspense fallback={<PageLoader />}>
            <StudentLayout />
          </Suspense>
        ),
        children: [
          { index: true,        element: <Suspense fallback={<PageLoader />}><StudentHome /></Suspense> },
          { path: 'courses',    element: <Suspense fallback={<PageLoader />}><StudentCourses /></Suspense>  },
          { path: 'learning',     element: <Suspense fallback={<PageLoader />}><StudentLearning /></Suspense>    },
          { path: 'assessments',  element: <Suspense fallback={<PageLoader />}><StudentAssessments /></Suspense> },
          { path: 'assessments/:id', element: <Suspense fallback={<PageLoader />}><StudentExam /></Suspense>    },
          { path: 'services',   element: <Suspense fallback={<PageLoader />}><StudentServices /></Suspense> },
          { path: 'request',    element: <Suspense fallback={<PageLoader />}><StudentRequest /></Suspense> },
          { path: 'profile',    element: <Suspense fallback={<PageLoader />}><StudentProfile /></Suspense> },
        ],
      },
    ],
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute allowedRoles={['admin', 'employee']} />,
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
            path: 'skills',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardSkills />
              </Suspense>
            ),
          },
          {
            path: 'tech-stack',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardTechStack />
              </Suspense>
            ),
          },
          {
            path: 'timeline',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardTimeline />
              </Suspense>
            ),
          },
          {
            path: 'messages',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardMessages />
              </Suspense>
            ),
          },
          {
            path: 'ebooks',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardEbooks />
              </Suspense>
            ),
          },
          {
            path: 'knowledge-hub',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardKnowledgeHub />
              </Suspense>
            ),
          },
          {
            path: 'gallery',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardGallery />
              </Suspense>
            ),
          },
          {
            path: 'services',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardServices />
              </Suspense>
            ),
          },
          {
            path: 'navbar-footer',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardNavbarFooter />
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
          {
            path: 'users',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardUsers />
              </Suspense>
            ),
          },
          {
            path: 'assessments',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardAssessments />
              </Suspense>
            ),
          },
          {
            path: 'assessments/:id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardAssessmentEditor />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardSettings />
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
        element: <Navigate to="/login" replace />,
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
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <RouterProvider router={router} />
    </>
  )
}
