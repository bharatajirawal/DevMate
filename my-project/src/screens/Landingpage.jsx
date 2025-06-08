"use client"

import { useState, useEffect } from "react"
import { Code, Users, FileCode, ArrowRight, Bot, Zap, Globe, Play, Star, GitBranch } from "lucide-react"
import { Link } from "react-router-dom"

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      title: "AI-Powered Development",
      description: "Intelligent code suggestions and real-time assistance",
      icon: <Bot className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Real-time Collaboration",
      description: "Work together seamlessly with your team",
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Live Code Editor",
      description: "Advanced editor with syntax highlighting",
      icon: <FileCode className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="w-full px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                DevMate
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-300 hover:text-white transition-colors font-medium">
                Home
              </a>
              <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors font-medium">
                About
              </a>
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-2 border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400/10 transition-all font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 font-medium shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-lg border-t border-white/10">
            <div className="px-6 py-4 space-y-3">
              <a href="#home" className="block text-gray-300 hover:text-white transition-colors font-medium">
                Home
              </a>
              <a href="#features" className="block text-gray-300 hover:text-white transition-colors font-medium">
                Features
              </a>
              <a href="#about" className="block text-gray-300 hover:text-white transition-colors font-medium">
                About
              </a>
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded-lg hover:bg-cyan-400/10 transition-colors text-center font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg transition-colors text-center font-medium"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 px-6 lg:px-12 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30">
                  <Zap className="w-4 h-4 text-cyan-400 mr-2" />
                  <span className="text-sm font-medium text-cyan-300">AI-Powered Collaboration Platform</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    DevMate
                  </span>
                  <br />
                  <span className="text-white">Code Together,</span>
                  <br />
                  <span className="text-gray-300">Build Smarter</span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  Revolutionary AI-powered collaborative development platform. Real-time coding, intelligent assistance,
                  and seamless team collaboration in one unified workspace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 font-semibold shadow-2xl flex items-center justify-center"
                >
                  Start Building Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-semibold flex items-center justify-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  View Demo
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-gray-300">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Real-time Sync</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Cloud-based</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-1 backdrop-blur-sm">
                <div className="bg-black/40 rounded-xl overflow-hidden backdrop-blur-sm">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6 py-4 flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="ml-4 text-white font-medium">DevMate - AI Collaborative IDE</span>
                  </div>
                  <div className="p-6">
                    <img
                      src="/placeholder.svg?height=400&width=600"
                      alt="DevMate Interface"
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl animate-pulse">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-xl animate-pulse">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-black/20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <br />
              <span className="text-white">for Modern Development</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of collaborative coding with our cutting-edge AI technology
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 rounded-2xl border transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                  currentFeature === index
                    ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => setCurrentFeature(index)}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 lg:px-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold">
                <span className="text-white">Built for the</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Future of Coding
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                DevMate represents the next generation of development tools, combining artificial intelligence with
                real-time collaboration to create an unparalleled coding experience.
              </p>
              <div className="space-y-4">
                {[
                  "AI-powered code suggestions and debugging",
                  "Real-time collaborative editing",
                  "Integrated chat and project management",
                  "Instant deployment and preview",
                  "Cross-platform compatibility",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-black/40 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">AI</div>
                    <div className="text-gray-300">Powered</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-3xl font-bold text-purple-400 mb-2">Real-time</div>
                    <div className="text-gray-300">Collaboration</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-3xl font-bold text-green-400 mb-2">Live</div>
                    <div className="text-gray-300">Preview</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-6 text-center backdrop-blur-sm">
                    <div className="text-3xl font-bold text-pink-400 mb-2">Cloud</div>
                    <div className="text-gray-300">Based</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of collaborative coding with DevMate's AI-powered platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 font-semibold shadow-2xl flex items-center justify-center"
            >
              Start Building Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/10">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                DevMate
              </span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2024 DevMate. Revolutionizing collaborative development.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
