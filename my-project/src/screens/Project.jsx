"use client"

import React, { useState, useEffect, useContext, useRef } from "react"
import { UserContext } from "../context/user.context"
import { useLocation } from "react-router-dom"
import axios from "../config/axios"
import { initializeSocket, receiveMessage, sendMessage } from "../config/socket"
import Markdown from "markdown-to-jsx"
import hljs from "highlight.js"
import { getWebContainer } from "../config/webcontainer"
import {
  Search,
  Send,
  Users,
  Plus,
  X,
  User,
  Play,
  Code2,
  Sparkles,
  Zap,
  FileText,
  Bot,
  Copy,
  Check,
  Trash2,
  RefreshCw,
} from "lucide-react"

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute("data-highlighted")
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation()
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state.project)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useContext(UserContext)
  const messageBox = useRef(null)
  const messageInputRef = useRef(null)

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copiedStates, setCopiedStates] = useState({})

  // Filter users based on search query
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Filter collaborators based on search query
  const filteredCollaborators =
    project.users?.filter(
      (u) =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) ?? []

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId)
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id)
      } else {
        newSelectedUserId.add(id)
      }
      return newSelectedUserId
    })
  }

  const addCollaborators = () => {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data)
        setIsModalOpen(false)
        setSelectedUserId(new Set())
        fetchProjectData()
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const send = () => {
    if (!message.trim()) return

    sendMessage("project-message", {
      message: message.trim(),
      sender: user,
    })
    setMessages((prevMessages) => [...prevMessages, { sender: user, message: message.trim() }])
    setMessage("")

    setTimeout(() => {
      messageInputRef.current?.focus()
    }, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const copyToClipboard = async (text, messageIndex) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [messageIndex]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [messageIndex]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const deleteFile = (fileName) => {
    const updatedFileTree = { ...fileTree }
    delete updatedFileTree[fileName]
    setFileTree(updatedFileTree)
    saveFileTree(updatedFileTree)

    // Remove from open files if it's open
    const newOpenFiles = openFiles.filter((file) => file !== fileName)
    setOpenFiles(newOpenFiles)

    // If the deleted file was the current file, switch to another file or clear
    if (currentFile === fileName) {
      if (newOpenFiles.length > 0) {
        setCurrentFile(newOpenFiles[newOpenFiles.length - 1])
      } else {
        setCurrentFile(null)
      }
    }
  }

  function WriteAiMessage(message, messageIndex) {
    const messageObject = JSON.parse(message)
    const isCopied = copiedStates[messageIndex]

    return (
      <div className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
        {/* AI Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-300">DevMate AI Assistant</span>
              <p className="text-xs text-slate-400">Code generation & assistance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(messageObject.text, messageIndex)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
              title="Copy response"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
              )}
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group"
              title="Regenerate response"
            >
              <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* AI Content */}
        <div className="p-4">
          <div className="prose prose-invert prose-sm max-w-none">
            <Markdown
              children={messageObject.text}
              options={{
                overrides: {
                  code: {
                    component: SyntaxHighlightedCode,
                    props: {
                      className: "bg-slate-800 text-slate-100 px-2 py-1 rounded text-sm font-mono",
                    },
                  },
                  pre: {
                    component: ({ children, ...props }) => (
                      <div className="relative group">
                        <pre
                          {...props}
                          className="bg-slate-800 border border-slate-600 rounded-lg p-4 overflow-x-auto text-sm font-mono shadow-inner"
                        >
                          {children}
                        </pre>
                        <button
                          onClick={() => {
                            const codeText = children?.props?.children || ""
                            copyToClipboard(codeText, `${messageIndex}-code`)
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Copy code"
                        >
                          <Copy className="w-3 h-3 text-slate-300" />
                        </button>
                      </div>
                    ),
                  },
                  h1: { props: { className: "text-lg font-bold text-blue-300 mb-2" } },
                  h2: { props: { className: "text-base font-semibold text-blue-300 mb-2" } },
                  h3: { props: { className: "text-sm font-semibold text-blue-300 mb-1" } },
                  p: { props: { className: "text-slate-200 leading-relaxed mb-2" } },
                  ul: { props: { className: "text-slate-200 space-y-1 mb-2" } },
                  ol: { props: { className: "text-slate-200 space-y-1 mb-2" } },
                  li: { props: { className: "text-slate-200" } },
                  strong: { props: { className: "text-white font-semibold" } },
                  em: { props: { className: "text-blue-300 italic" } },
                },
              }}
            />
          </div>
        </div>

        {/* AI Footer */}
        <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Generated by DevMate AI</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const fetchProjectData = () => {
    axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project)
      setFileTree(res.data.project.fileTree || {})
    })
  }

  useEffect(() => {
    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container)
        console.log("container started")
      })
    }

    receiveMessage("project-message", (data) => {
      console.log(data)

      if (data.sender._id === "ai") {
        const message = JSON.parse(data.message)
        console.log(message)
        webContainer?.mount(message.fileTree)
        if (message.fileTree) {
          setFileTree(message.fileTree || {})
        }
      }
      setMessages((prevMessages) => [...prevMessages, data])
    })

    fetchProjectData()

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight
    }
  }, [messages])

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const runProject = async () => {
    setIsRunning(true)
    try {
      await webContainer.mount(fileTree)
      const installProcess = await webContainer.spawn("npm", ["install"])

      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk)
          },
        }),
      )

      if (runProcess) {
        runProcess.kill()
      }

      const tempRunProcess = await webContainer.spawn("npm", ["start"])

      tempRunProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(chunk)
          },
        }),
      )

      setRunProcess(tempRunProcess)

      webContainer.on("server-ready", (port, url) => {
        console.log(port, url)
        setIframeUrl(url)
        setIsRunning(false)
      })
    } catch (error) {
      console.error("Error running project:", error)
      setIsRunning(false)
    }
  }

  return (
    <main className="h-screen w-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Left Panel - Chat */}
      <section className="left relative flex flex-col h-screen min-w-96 bg-white/80 backdrop-blur-sm border-r border-slate-200 shadow-xl">
        {/* Header with DevMate Branding - Fixed positioning */}
        <header className="flex justify-between items-center p-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg">DevMate</h1>
                <p className="text-xs text-blue-100">AI Collaborative Code Generator</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span className="font-medium">Add</span>
            </button>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <Users size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area - Fixed height calculation */}
        <div className="conversation-area flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-4 flex-grow flex flex-col gap-4 overflow-auto"
            style={{ height: "calc(100vh - 140px)" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to DevMate!</h3>
                <p className="text-gray-600 text-sm max-w-xs">
                  Start collaborating with AI to generate and manage your code files. Type a message to begin your
                  coding journey!
                </p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender._id === user._id.toString() ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-md transition-all duration-200 hover:shadow-xl
                    ${msg.sender._id === user._id.toString() ? "ml-auto" : msg.sender._id === "ai" ? "max-w-2xl" : ""}
                  `}
                >
                  {msg.sender._id === user._id.toString() ? (
                    <div className="px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <p className="break-words leading-relaxed">{msg.message}</p>
                    </div>
                  ) : msg.sender._id === "ai" ? (
                    WriteAiMessage(msg.message, index)
                  ) : (
                    <div className="px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 border border-gray-300">
                      <div className="text-xs opacity-70 mb-2 font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {msg.sender.email}
                      </div>
                      <p className="break-words leading-relaxed">{msg.message}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input - Fixed at bottom */}
          <div className="inputField w-full flex p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 sticky bottom-0">
            <div className="flex w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <input
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="p-4 outline-none flex-grow bg-transparent placeholder-gray-500"
                type="text"
                placeholder="Describe what you want to build..."
              />
              <button
                onClick={send}
                disabled={!message.trim()}
                className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Collaborators Side Panel */}
        <div
          className={`sidePanel w-full h-full flex flex-col bg-white/95 backdrop-blur-sm absolute transition-all duration-300 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"} top-0 shadow-2xl border-r border-gray-200 z-30`}
        >
          <header className="flex justify-between items-center px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200">
            <div>
              <h1 className="font-bold text-lg text-gray-900">Team</h1>
              <p className="text-sm text-gray-600">Project collaborators</p>
            </div>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </header>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
              />
            </div>
          </div>

          {/* Project Owner */}
          {project.owner && (
            <div className="px-4 py-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Project Owner</h3>
              <div className="user p-4 flex gap-3 items-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{project.owner.email}</h2>
                  <p className="text-xs text-blue-600 font-medium">Owner</p>
                </div>
              </div>
            </div>
          )}

          {/* Collaborators List */}
          <div className="flex-1 overflow-auto">
            <div className="px-4 py-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Collaborators ({filteredCollaborators.length})
              </h3>
            </div>
            <div className="users flex flex-col gap-2 px-4">
              {filteredCollaborators.length > 0 ? (
                filteredCollaborators.map((collaborator, index) => (
                  <div
                    key={index}
                    className="user cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 p-4 flex gap-3 items-center rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-gray-500 to-gray-600 shadow-md">
                      <User size={16} />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">{collaborator.email}</h2>
                      <p className="text-xs text-gray-500">Collaborator</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users size={24} className="opacity-50" />
                  </div>
                  <p className="font-medium">No collaborators yet</p>
                  <p className="text-sm">Add team members to start collaborating</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right Panel - Code Editor */}
      <section className="right bg-white/50 backdrop-blur-sm flex-grow h-full flex">
        {/* File Explorer */}
        <div className="explorer h-full max-w-64 min-w-52 bg-white/80 backdrop-blur-sm border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Files</h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">Project structure</p>
          </div>
          <div className="file-tree w-full">
            {Object.keys(fileTree).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText size={20} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">No files yet</p>
                <p className="text-xs">Ask AI to generate some code!</p>
              </div>
            ) : (
              Object.keys(fileTree).map((file, index) => (
                <div
                  key={index}
                  className={`tree-element group flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border-b border-gray-100 ${
                    currentFile === file ? "bg-gradient-to-r from-blue-50 to-purple-50 border-r-2 border-blue-500" : ""
                  }`}
                >
                  <button
                    onClick={() => {
                      setCurrentFile(file)
                      setOpenFiles([...new Set([...openFiles, file])])
                    }}
                    className="flex-1 p-4 px-5 flex items-center gap-3 text-left"
                  >
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">{file}</span>
                  </button>
                  <button
                    onClick={() => deleteFile(file)}
                    className="p-2 mr-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all duration-200"
                    title="Delete file"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="code-editor flex flex-col flex-grow h-full">
          {/* Tabs and Actions */}
          <div className="top flex justify-between w-full border-b border-gray-200 bg-gradient-to-r from-white/90 to-blue-50/50 backdrop-blur-sm">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <div key={index} className="flex items-center group">
                  <button
                    onClick={() => setCurrentFile(file)}
                    className={`open-file cursor-pointer p-4 px-6 flex items-center gap-3 border-r border-gray-200 transition-all duration-200 ${
                      currentFile === file ? "bg-white border-b-2 border-blue-500 shadow-sm" : "hover:bg-white/70"
                    }`}
                  >
                    <div className="w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                    <span className="font-medium text-gray-700">{file}</span>
                  </button>
                  <button
                    onClick={() => {
                      const newOpenFiles = openFiles.filter((f) => f !== file)
                      setOpenFiles(newOpenFiles)
                      if (currentFile === file && newOpenFiles.length > 0) {
                        setCurrentFile(newOpenFiles[newOpenFiles.length - 1])
                      } else if (newOpenFiles.length === 0) {
                        setCurrentFile(null)
                      }
                    }}
                    className="p-1 mr-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all duration-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="actions flex gap-3 p-3">
              <button
                onClick={runProject}
                disabled={isRunning || Object.keys(fileTree).length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>
  {project ? 'Running' : 'Run project'}
</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Run Project</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Content */}
          <div className="bottom flex flex-grow max-w-full overflow-auto">
            {currentFile && fileTree[currentFile] ? (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <pre className="hljs h-full p-6">
                  <code
                    className="hljs h-full outline-none text-sm leading-relaxed"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      }
                      setFileTree(ft)
                      saveFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight("javascript", fileTree[currentFile].file.contents).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Code2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Code</h3>
                  <p className="text-gray-600 max-w-md">
                    Select a file from the explorer or ask our AI assistant to generate new code files for your project.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {iframeUrl && webContainer && (
          <div className="flex min-w-96 flex-col h-full border-l border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="address-bar border-b border-gray-200 bg-gradient-to-r from-white/90 to-blue-50/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 p-3">
                <Zap className="w-4 h-4 text-green-500" />
                <input
                  type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className="flex-1 p-2 bg-white/70 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 text-sm"
                  placeholder="Preview URL"
                />
              </div>
            </div>
            <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
          </div>
        )}
      </section>

      {/* Add Collaborator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl w-96 max-w-full relative shadow-2xl border border-white/20">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Collaborators</h2>
                <p className="text-gray-600 text-sm">Invite team members to your project</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSearchQuery("")
                  setSelectedUserId(new Set())
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
              />
            </div>

            <div className="users-list flex flex-col gap-2 mb-8 max-h-64 overflow-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`user cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 p-4 flex gap-4 items-center rounded-xl transition-all duration-200 ${
                      selectedUserId.has(user._id)
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md"
                        : "border-2 border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
                      <User size={18} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{user.email}</h3>
                      {user.name && <p className="text-sm text-gray-500">{user.name}</p>}
                    </div>
                    {selectedUserId.has(user._id) && (
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User size={24} className="opacity-50" />
                  </div>
                  <p className="font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </div>

            <button
              onClick={addCollaborators}
              disabled={selectedUserId.size === 0}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Add {selectedUserId.size} Collaborator{selectedUserId.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </main>
  )
}

export default Project
