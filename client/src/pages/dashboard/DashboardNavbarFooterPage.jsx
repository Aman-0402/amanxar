import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Plus, GripVertical } from 'lucide-react'
import { navbarAPI, footerSectionsAPI, footerCTAAPI, socialLinksAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import NavbarLinkFormModal from '@components/dashboard/NavbarLinkFormModal'
import FooterSectionFormModal from '@components/dashboard/FooterSectionFormModal'
import FooterCTAFormModal from '@components/dashboard/FooterCTAFormModal'
import SocialLinkFormModal from '@components/dashboard/SocialLinkFormModal'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function DashboardNavbarFooterPage() {
  const [activeTab, setActiveTab] = useState('navbar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Navbar state
  const [navbarLinks, setNavbarLinks] = useState([])
  const [navbarFormOpen, setNavbarFormOpen] = useState(false)
  const [editingNavbar, setEditingNavbar] = useState(null)
  const [navbarFormLoading, setNavbarFormLoading] = useState(false)

  // Footer state
  const [footerSections, setFooterSections] = useState([])
  const [footerCTA, setFooterCTA] = useState(null)
  const [socialLinks, setSocialLinks] = useState([])
  const [footerFormOpen, setFooterFormOpen] = useState(false)
  const [editingFooter, setEditingFooter] = useState(null)
  const [footerFormLoading, setFooterFormLoading] = useState(false)
  const [ctaFormOpen, setCtaFormOpen] = useState(false)
  const [ctaFormLoading, setCtaFormLoading] = useState(false)
  const [socialFormOpen, setSocialFormOpen] = useState(false)
  const [editingSocial, setEditingSocial] = useState(null)
  const [socialFormLoading, setSocialFormLoading] = useState(false)

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteType, setDeleteType] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchNavbarLinks(),
        fetchFooterData(),
        fetchSocialLinks(),
      ])
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNavbarLinks = async () => {
    const { data } = await navbarAPI.getAll()
    setNavbarLinks(data.sort((a, b) => a.order - b.order))
  }

  const fetchFooterData = async () => {
    const { data: sections } = await footerSectionsAPI.getAll()
    const { data: cta } = await footerCTAAPI.getAll()

    setFooterSections(sections.sort((a, b) => a.order - b.order))
    setFooterCTA(cta[0] || null)
  }

  const fetchSocialLinks = async () => {
    const { data } = await socialLinksAPI.getAll()
    setSocialLinks(data.sort((a, b) => a.order - b.order))
  }

  // Navbar handlers
  const handleNavbarDelete = async () => {
    if (!deleteTarget) return
    try {
      await navbarAPI.delete(deleteTarget.id)
      alert('✅ Navigation link deleted!')
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      await fetchNavbarLinks()
    } catch (err) {
      alert('❌ Failed to delete')
      console.error(err)
    }
  }

  // Footer handlers
  const handleFooterDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteType === 'section') {
        await footerSectionsAPI.delete(deleteTarget.id)
      } else if (deleteType === 'social') {
        await socialLinksAPI.delete(deleteTarget.id)
      }
      alert('✅ Deleted successfully!')
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      setDeleteType(null)
      await fetchData()
    } catch (err) {
      alert('❌ Failed to delete')
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2 border-b border-bg-border"
      >
        {['navbar', 'footer', 'social'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'border-b-2 border-brand-primary text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Navbar Tab */}
      {activeTab === 'navbar' && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">Navigation Links</h2>
            <button
              onClick={() => {
                setEditingNavbar(null)
                setNavbarFormOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors"
            >
              <Plus size={16} />
              Add Link
            </button>
          </div>

          <div className="rounded-lg border border-bg-border bg-bg-surface overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-bg-border bg-bg-elevated/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">Label</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">URL</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {navbarLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-bg-elevated/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <GripVertical size={16} />
                        {link.order}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-primary">{link.label}</td>
                    <td className="px-6 py-4 text-text-secondary">{link.href}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingNavbar(link)
                          setNavbarFormOpen(true)
                        }}
                        className="p-2 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(link)
                          setDeleteType('navbar')
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <NavbarLinkFormModal
            isOpen={navbarFormOpen}
            onClose={() => {
              setNavbarFormOpen(false)
              setEditingNavbar(null)
            }}
            link={editingNavbar}
            onSave={async () => {
              setNavbarFormOpen(false)
              setEditingNavbar(null)
              await fetchNavbarLinks()
            }}
          />
        </motion.div>
      )}

      {/* Footer Tab */}
      {activeTab === 'footer' && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="space-y-4">
            {/* Footer CTA */}
            <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">CTA Section</h3>
              {footerCTA && (
                <div className="space-y-2 text-sm text-text-secondary mb-4">
                  <p><strong>Badge:</strong> {footerCTA.badge_text}</p>
                  <p><strong>Heading:</strong> {footerCTA.heading}</p>
                  <p><strong>Button:</strong> {footerCTA.button_text} → {footerCTA.button_url}</p>
                </div>
              )}
              <button
                onClick={() => setCtaFormOpen(true)}
                className="px-3 py-1.5 text-sm rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                Edit CTA
              </button>
            </div>

            {/* Footer Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Link Sections</h3>
                <button
                  onClick={() => {
                    setEditingFooter(null)
                    setFooterFormOpen(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors text-sm"
                >
                  <Plus size={16} />
                  Add Section
                </button>
              </div>

              <div className="space-y-4">
                {footerSections.map((section) => (
                  <div key={section.id} className="rounded-lg border border-bg-border bg-bg-surface p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary">{section.title}</h4>
                      <button
                        onClick={() => {
                          setDeleteTarget(section)
                          setDeleteType('section')
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {section.links?.map((link) => (
                        <li key={link.id} className="text-xs text-text-secondary">
                          {link.label} → {link.href}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FooterSectionFormModal
            isOpen={footerFormOpen}
            onClose={() => {
              setFooterFormOpen(false)
              setEditingFooter(null)
            }}
            section={editingFooter}
            onSave={async () => {
              setFooterFormOpen(false)
              setEditingFooter(null)
              await fetchFooterData()
            }}
            isLoading={footerFormLoading}
          />

          <FooterCTAFormModal
            isOpen={ctaFormOpen}
            onClose={() => setCtaFormOpen(false)}
            cta={footerCTA}
            onSave={async (formData) => {
              setCtaFormLoading(true)
              try {
                if (footerCTA?.id) {
                  await footerCTAAPI.update(footerCTA.id, formData)
                } else {
                  await footerCTAAPI.create(formData)
                }
                setCtaFormOpen(false)
                await fetchFooterData()
              } catch (err) {
                alert('❌ Failed to save: ' + (err.response?.data?.detail || 'Unknown error'))
              } finally {
                setCtaFormLoading(false)
              }
            }}
            isLoading={ctaFormLoading}
          />
        </motion.div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">Social Media Links</h2>
            <button
              onClick={() => {
                setEditingSocial(null)
                setSocialFormOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors"
            >
              <Plus size={16} />
              Add Social Link
            </button>
          </div>

          <div className="rounded-lg border border-bg-border bg-bg-surface overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-bg-border bg-bg-elevated/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">Platform</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted">URL</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {socialLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-bg-elevated/30">
                    <td className="px-6 py-4">{link.order}</td>
                    <td className="px-6 py-4 text-text-primary">{link.platform}</td>
                    <td className="px-6 py-4 text-text-secondary truncate">{link.url}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingSocial(link)
                          setSocialFormOpen(true)
                        }}
                        className="p-2 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(link)
                          setDeleteType('social')
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SocialLinkFormModal
            isOpen={socialFormOpen}
            onClose={() => {
              setSocialFormOpen(false)
              setEditingSocial(null)
            }}
            link={editingSocial}
            onSave={async (formData) => {
              setSocialFormLoading(true)
              try {
                if (editingSocial?.id) {
                  await socialLinksAPI.update(editingSocial.id, formData)
                  alert('✅ Social link updated successfully!')
                } else {
                  await socialLinksAPI.create(formData)
                  alert('✅ Social link created successfully!')
                }
                setSocialFormOpen(false)
                setEditingSocial(null)
                await fetchSocialLinks()
              } catch (err) {
                alert('❌ Failed to save: ' + (err.response?.data?.detail || 'Unknown error'))
              } finally {
                setSocialFormLoading(false)
              }
            }}
            isLoading={socialFormLoading}
          />
        </motion.div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
          setDeleteType(null)
        }}
        onConfirm={deleteType === 'navbar' ? handleNavbarDelete : handleFooterDelete}
        title="Delete Item"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
