"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card } from "../components/ui/card"
import { ScrollArea } from "../components/ui/scroll-area"
import { Mic, MicOff, Send, Play, Pause, Volume2, History, Trash2, Sun, Moon, X, Menu } from "lucide-react"

// Importar el shader component
import PulsingBorderShader from "../components/ui/pulsing-border-shader"

// Círculo con shader real - Responsive con aspect-ratio fijo
function ElegantCircle({ size = "w-20 h-20", className = "" }) {
  // Mapeo de tamaños más preciso para mantener círculos perfectos
  const sizeMap = {
    "w-6 h-6": "w-6 h-6 min-w-[24px] min-h-[24px]",
    "w-8 h-8": "w-8 h-8 min-w-[32px] min-h-[32px]",
    "w-10 h-10": "w-10 h-10 min-w-[40px] min-h-[40px]",
    "w-12 h-12": "w-12 h-12 min-w-[48px] min-h-[48px]",
    "w-20 h-20": "w-20 h-20 min-w-[80px] min-h-[80px]",
    "w-48 h-48": "w-48 h-48 min-w-[192px] min-h-[192px]",
    "w-64 h-64": "w-64 h-64 min-w-[256px] min-h-[256px]",
    "w-80 h-80": "w-80 h-80 min-w-[320px] min-h-[320px]"
  }
  
  const finalSize = sizeMap[size] || sizeMap["w-20 h-20"]
  
  return (
    <div className={`relative ${finalSize} flex items-center justify-center mx-auto aspect-square ${className}`}>
      {/* Glow effect exacto del código original */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-500/20 blur-3xl scale-110" />
      
      {/* Shader component con tamaño dinámico */}
      <div className="w-full h-full">
        <PulsingBorderShader size={size} />
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [theme, setTheme] = useState("dark")
  const [isMobile, setIsMobile] = useState(false)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "es-ES"

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const simulateAIResponse = async (userMessage) => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const responses = [
      "Entiendo tu consulta. Como tu asistente de IA, puedo ayudarte con una amplia variedad de tareas.",
      "Esa es una excelente pregunta. Basándome en mi conocimiento, te puedo decir que...",
      "Me complace poder asistirte. Aquí tienes la información que necesitas:",
      "Perfecto, puedo ayudarte con eso. La respuesta es la siguiente:",
      "Interesante punto. Permíteme explicarte esto de manera detallada:",
    ]

    return (
      responses[Math.floor(Math.random() * responses.length)] +
      " " +
      "Esta es una respuesta simulada basada en tu mensaje: '" +
      userMessage +
      "'"
    )
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const aiResponse = await simulateAIResponse(input)

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        hasAudio: true,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error generating AI response:", error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const playAudio = (messageId) => {
    setIsPlaying(true)
    setTimeout(() => {
      setIsPlaying(false)
    }, 3000)
  }

  const startNewConversation = () => {
    // Guardar la conversación actual solo si tiene mensajes
    if (messages.length > 0) {
      const newConversation = {
        id: Date.now().toString(),
        title: messages.find(m => m.isUser)?.content.slice(0, 30) + "..." || "Nueva conversación",
        messages: [...messages],
        createdAt: new Date(),
      }
      setConversations((prev) => [newConversation, ...prev])
    }
    
    // Limpiar la conversación actual
    setMessages([])
    setCurrentConversationId(null)
    setInput("")
    
    // Cerrar historial en móvil después de crear nueva conversación
    if (isMobile) {
      setShowHistory(false)
    }
  }

  const loadConversation = (conversation) => {
    // Guardar la conversación actual antes de cargar otra
    if (messages.length > 0 && currentConversationId !== conversation.id) {
      const currentConversation = {
        id: currentConversationId || Date.now().toString(),
        title: messages.find(m => m.isUser)?.content.slice(0, 30) + "..." || "Conversación sin título",
        messages: [...messages],
        createdAt: new Date(),
      }
      
      setConversations((prev) => {
        const filtered = prev.filter(conv => conv.id !== currentConversationId)
        return [currentConversation, ...filtered]
      })
    }
    
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    setShowHistory(false) // Siempre cerrar historial al cargar conversación
  }

  const deleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
    
    // Si estamos viendo la conversación que se está eliminando, limpiar
    if (currentConversationId === conversationId) {
      setMessages([])
      setCurrentConversationId(null)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const isDark = theme === "dark"

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-900'} relative`}>
      {/* Overlay para móvil cuando está abierto el historial */}
      {isMobile && showHistory && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Sidebar - History */}
      <div
        className={`transition-all duration-300 border-r backdrop-blur-sm overflow-hidden z-50 ${
          isDark ? 'bg-black/95 border-neutral-800/30' : 'bg-white/95 border-neutral-200/30'
        } ${
          isMobile 
            ? showHistory 
              ? "fixed left-0 top-0 w-80 h-full shadow-2xl" 
              : "fixed left-0 top-0 w-0 h-full"
            : showHistory 
              ? "w-72" 
              : "w-0"
        }`}
      >
        <div className="p-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Historial
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  startNewConversation()
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-purple-500/30 ${
                  isDark 
                    ? 'text-purple-400 hover:text-white hover:bg-[#C972FF] hover:border-transparent' 
                    : 'text-purple-600 hover:text-white hover:bg-[#C972FF] hover:border-transparent'
                }`}
              >
                Nueva
              </Button>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className={`p-1.5 rounded-lg ${
                    isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-2">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="group">
                  <div
                    className={`relative p-3 cursor-pointer transition-all duration-200 rounded-xl border ${
                      currentConversationId === conversation.id
                        ? isDark 
                          ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/10 shadow-lg' 
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100 shadow-md'
                        : isDark 
                          ? 'bg-neutral-800/40 hover:bg-neutral-800/70 border-neutral-700/50 hover:border-neutral-600' 
                          : 'bg-white/70 hover:bg-white/90 border-neutral-200/60 hover:border-neutral-300 shadow-sm hover:shadow-md'
                    } hover:translate-y-[-1px] active:scale-95`}
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className={`text-sm font-medium truncate mb-1.5 ${
                          currentConversationId === conversation.id
                            ? isDark ? 'text-white' : 'text-purple-900'
                            : isDark ? 'text-neutral-200' : 'text-neutral-800'
                        }`}>
                          {conversation.title}
                        </p>
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            currentConversationId === conversation.id
                              ? 'bg-gradient-to-r from-purple-400 to-blue-400'
                              : isDark ? 'bg-neutral-500' : 'bg-neutral-400'
                          }`}></div>
                          <p className={`text-xs ${
                            currentConversationId === conversation.id
                              ? isDark ? 'text-purple-200' : 'text-purple-700'
                              : isDark ? 'text-neutral-400' : 'text-neutral-500'
                          }`}>
                            {conversation.createdAt.toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conversation.id)
                        }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 shrink-0 rounded-md ${
                          isDark 
                            ? 'hover:bg-red-500/20 hover:text-red-400 text-neutral-400' 
                            : 'hover:bg-red-50 hover:text-red-500 text-neutral-500'
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-neutral-800/50' : 'bg-neutral-200/50'
                  }`}>
                    <History className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium mb-1">No hay conversaciones</p>
                  <p className="text-xs opacity-75">Inicia una nueva para comenzar</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className={`border-b p-3 md:p-4 relative ${isDark ? 'bg-black/20 border-neutral-800/20' : 'bg-white/20 border-neutral-200/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 mr-1 ${isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <ElegantCircle size="w-10 h-10 md:w-12 md:h-12" className="shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">
                  Natal-<span className="text-[#C972FF]">IA</span>
                </h1>
                <p className={`text-xs md:text-sm truncate ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Tu asistente premium inteligente
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`p-2 ${isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
              >
                {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 ${isDark ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                >
                  <History className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-3 md:px-4 relative overflow-visible mb-4">
          {/* Resplandor que se extiende hacia arriba atravesando el header */}
          {messages.length === 0 && (
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-r from-purple-600/20 via-pink-500/30 to-purple-600/20 blur-3xl opacity-50 pointer-events-none z-50"></div>
          )}
          
          <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 relative pt-4 pb-8">
            {messages.length === 0 && (
              <div className="text-center py-6 md:py-8">
                <div className="mb-6 md:mb-8 flex justify-center">
                  <ElegantCircle size="w-80 h-80" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
                  ¡Hola! Soy Natal-<span className="text-[#C972FF]">IA</span>
                </h3>
                <p className={`text-base md:text-lg mb-2 px-4 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  Diseñado para escucharte y responder a todas tus consultas
                </p>
                <p className={`text-sm md:text-base px-4 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Mi función principal es escucharte - habla conmigo o escribe tu mensaje
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                {!message.isUser && (
                  <div className="mr-2 md:mr-3 mt-1 shrink-0">
                    <ElegantCircle size="w-6 h-6 md:w-8 h-8" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-3 md:p-4 ${
                    message.isUser
                      ? "text-black ml-8 md:ml-12"
                      : isDark
                        ? "bg-neutral-800 text-neutral-100 mr-8 md:mr-12 border border-neutral-700"
                        : "bg-white text-neutral-900 mr-8 md:mr-12 border border-neutral-200 shadow-sm"
                  }`}
                  style={message.isUser ? { backgroundColor: '#C972FF' } : {}}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2 md:mt-3">
                    <span className={`text-xs ${
                      message.isUser 
                        ? "text-black" 
                        : isDark ? "text-neutral-400" : "text-neutral-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.hasAudio && !message.isUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.id)}
                        className="h-6 w-6 md:h-7 md:w-7 p-0 ml-2"
                      >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="mr-2 md:mr-3 mt-1 shrink-0">
                  <ElegantCircle size="w-6 h-6 md:w-8 h-8" />
                </div>
                <div className={`rounded-2xl p-3 md:p-4 mr-8 md:mr-12 ${
                  isDark ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-sm'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Voice Visualization */}
        {isListening && (
          <div className={`px-3 md:px-4 py-4 border-y ${
            isDark ? 'bg-black border-neutral-800' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <div className="text-sm md:text-base font-medium bg-[#C972FF] bg-clip-text text-transparent">
                  Escuchando...
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse"
                      style={{ 
                        height: `${12 + Math.random() * 12}px`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`p-4 md:p-6 border-t ${isDark ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pregunta lo que quieras"
                  className={`w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border-2 text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-neutral-800/10 border-neutral-700 text-white placeholder-neutral-400 focus:border-neutral-600 focus:outline-none' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:border-purple-500 focus:outline-none'
                  }`}
                />
              </div>
              <Button
                variant={isListening ? "default" : "outline"}
                onClick={isListening ? stopListening : startListening}
                className={`h-11 w-11 md:h-12 md:w-12 rounded-xl transition-all duration-200 flex items-center justify-center p-0 active:scale-95 ${
                  isListening
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    : isDark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
                      : "border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4 md:h-5 md:w-5" /> : <Mic className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="h-11 w-11 md:h-12 md:w-12 rounded-xl bg-[#C972FF] hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0 active:scale-95"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}