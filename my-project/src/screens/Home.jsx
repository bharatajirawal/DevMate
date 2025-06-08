"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Code2,
  Users,
  Calendar,
  FolderPlus,
  X,
  Settings,
  LogOut,
  FileText,
  Trash2,
  MoreVertical,
  Clock,
  AlertTriangle,
} from "lucide-react"

const Home = () => {
  // Mock user data
  const mockUser = { email: "agrawall@dm.com" }
  const user = mockUser

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projects, setProjects] = useState([
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, project: null })
  const [activeDropdown, setActiveDropdown] = useState(null)

  const handleLogout = () => {
    console.log("Logout clicked")
    alert("Logout functionality would redirect to login page")
  }

  const createProject = (e) => {
    e.preventDefault()
    if (!projectName.trim()) return

    // Mock project creation
    const newProject = {
      _id: Date.now().toString(),
      name: projectName.trim(),
      users: [{ email: user.email }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setProjects((prev) => [newProject, ...prev])
    setIsModalOpen(false)
    setProjectName("")
  }

  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p._id !== projectId))
    setDeleteModal({ isOpen: false, project: null })
  }

  const openProject = (project) => {
    console.log("Opening project:", project.name)
    alert(`Opening project: ${project.name}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null)
    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [activeDropdown])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* DevMate Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">DevMate</h1>
                <p className="text-sm text-gray-600">AI Collaborative Code Generator</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{user?.email?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">Developer</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-blue-600">{user?.email?.split("@")[0]}</span>!
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Ready to build something amazing with AI assistance? Let's create your next breakthrough project.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Project
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FolderPlus className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            <p className="text-sm text-gray-600">Total Projects</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Code2 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">AI</p>
            <p className="text-sm text-gray-600">Powered</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Live</p>
            <p className="text-sm text-gray-600">Collaboration</p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-gray-600" />
            <h3 className="text-2xl font-bold text-gray-900">Your Projects</h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Project Card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center text-center h-[220px]"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
                <span className="text-lg font-medium text-gray-700">Create New Project</span>
                <span className="text-sm text-gray-500 mt-1">Start building with AI</span>
              </button>

              {/* Project Cards */}
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => openProject(project)}
                  className="relative p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300 h-[220px] flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Active
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveDropdown(activeDropdown === project._id ? null : project._id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === project._id && (
                          <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveDropdown(null)
                                setDeleteModal({ isOpen: true, project })
                              }}
                              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Project
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{project.name}</h3>

                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{project.users?.length || 0} collaborators</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Updated {getTimeAgo(project.updatedAt || project.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-2">
                      {project.users?.slice(0, 3).map((user, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center"
                        >
                          <span className="text-xs text-white font-semibold">{user.email?.[0]?.toUpperCase()}</span>
                        </div>
                      ))}
                      {project.users?.length > 3 && (
                        <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600 font-semibold">+{project.users.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openProject(project)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && projects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first project and start building with AI assistance.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setProjectName("")
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your project name..."
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setProjectName("")
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Project</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{deleteModal.project?.name}"</strong>? All project data will be
              permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, project: null })}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProject(deleteModal.project._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
