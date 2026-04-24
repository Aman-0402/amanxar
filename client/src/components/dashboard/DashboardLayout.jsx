import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardSidebar from './Sidebar'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-bg-base text-text-primary">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <DashboardSidebar onClose={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:ml-64">
        {/* Top bar with toggle */}
        <div className="border-b border-bg-border bg-bg-surface/50 backdrop-blur-sm sticky top-0 z-40 h-16 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-bg-elevated rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto"
        >
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </motion.div>
      </main>
    </div>
  )
}
