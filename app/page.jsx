"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Mic, MicOff, Send, Play, Pause, History, Trash2, Sun, Moon, X, Menu } from "lucide-react"
import PulsingBorderShader from "../components/ui/pulsing-border-shader"

function ElegantCircle({ size = "w-20 h-20", className = "", theme = "dark" }) {
  const sizeMap = {
    "w-6 h-6": "w-6 h-6 min-w-[24px] min-h-[24px]",
    "w-8 h-8": "w-8 h-8 min-w-[32px] min-h-[32px]",
    "w-10 h-10": "w-10 h-10 min-w-[40px] min-h-[40px]",
    "w-12 h-12": "w-12 h-12 min-w-[48px] min-h-[48px]",
    "w-20 h-20": "w-20 h-20 min-w-[80px] min-h-[80px]",
    "w-48 h-48": "w-48 h-48 min-w-[192px] min-h-[192px]",
    "w-64 h-64": "w-64 h-64 min-w-[256px] min-h-[256px]",
    "w-80 h-80": "w-80 h-80 min-w-[320px] min-h-[320px]",
  }

  const finalSize = sizeMap[size] || sizeMap["w-20 h-20"]

  return (
    <div className={`relative ${finalSize} flex items-center justify-center mx-auto aspect-square ${className}`}>
      <div
        className={`absolute inset-0 blur-3xl scale-110 ${
          theme === "dark"
            ? "bg-gradient-to-r from-purple-500/20 to-purple-500/20"
            : "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
        }`}
      />
      <div className="w-full h-full">
        <PulsingBorderShader size={size} theme={theme} />
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
  const [isTablet, setIsTablet] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }
    
    checkDeviceType()
    window.addEventListener("resize", checkDeviceType)
    
    // Detectar cuando aparece/desaparece el teclado virtual en móviles
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        setKeyboardVisible(viewportHeight < windowHeight * 0.75)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
    }

    // Fallback para dispositivos que no soportan visualViewport
    const handleResize = () => {
      if (isMobile || isTablet) {
        const currentHeight = window.innerHeight
        const expectedHeight = window.screen.height
        setKeyboardVisible(currentHeight < expectedHeight * 0.75)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener("resize", checkDeviceType)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile, isTablet])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      "Esa es una excelente pregunta. Te puedo decir que este tipo de consultas requieren analisis cuidadoso.",
      "Me complace poder asistirte. Aqui tienes la informacion que necesitas.",
      "Perfecto, puedo ayudarte con eso. La respuesta es la siguiente.",
      "Interesante punto. Permiteme explicarte esto de manera detallada.",
    ]

    const baseResponse = responses[Math.floor(Math.random() * responses.length)]
    const elaboration = " He procesado tu mensaje y entiendo que necesitas una respuesta comprehensiva."

    return baseResponse + elaboration + " Tu mensaje fue: '" + userMessage + "'"
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

    // Restablecer altura del textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

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
    if (messages.length > 0) {
      const newConversation = {
        id: Date.now().toString(),
        title: messages.find((m) => m.isUser)?.content.slice(0, 30) + "..." || "Nueva conversacion",
        messages: [...messages],
        createdAt: new Date(),
      }
      setConversations((prev) => [newConversation, ...prev])
    }

    setMessages([])
    setCurrentConversationId(null)
    setInput("")

    if (isMobile || isTablet) {
      setShowHistory(false)
    }
  }

  const loadConversation = (conversation) => {
    if (messages.length > 0 && currentConversationId !== conversation.id) {
      const currentConversation = {
        id: currentConversationId || Date.now().toString(),
        title: messages.find((m) => m.isUser)?.content.slice(0, 30) + "..." || "Conversacion sin titulo",
        messages: [...messages],
        createdAt: new Date(),
      }

      setConversations((prev) => {
        const filtered = prev.filter((conv) => conv.id !== currentConversationId)
        return [currentConversation, ...filtered]
      })
    }

    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    setShowHistory(false)
  }

  const deleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

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
    <div
      className={`flex h-screen transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"} relative overflow-hidden`}
      style={{
        height: isMobile || isTablet ? '100vh' : '100vh',
        maxHeight: isMobile || isTablet ? '100vh' : '100vh'
      }}
    >
      {/* Overlay para móvil cuando está abierto el historial */}
      {(isMobile || isTablet) && showHistory && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Sidebar del historial */}
      <div
        className={`transition-all duration-300 border-r backdrop-blur-sm z-50 fixed top-0 left-0 h-full ${
          isDark ? "bg-black/95 border-neutral-800/30" : "bg-white/95 border-neutral-200/30"
        } ${
          isMobile || isTablet
            ? showHistory
              ? "w-80 shadow-2xl"
              : "w-0 overflow-hidden"
            : showHistory
              ? "w-72"
              : "w-0 overflow-hidden"
        }`}
      >
        {/* Header del historial */}
        <div className={`p-3 md:p-4 border-b ${isDark ? "border-neutral-800/30" : "border-neutral-200/30"}`}>
          <div className="flex items-center justify-between">
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
                    ? "text-purple-400 hover:text-white hover:bg-[#C972FF] hover:border-transparent"
                    : "text-purple-600 hover:text-white hover:bg-[#C972FF] hover:border-transparent"
                }`}
              >
                Nueva
              </Button>
              {(isMobile || isTablet) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className={`p-1.5 rounded-lg ${
                    isDark
                      ? "text-neutral-400 hover:text-white hover:bg-neutral-800"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del historial */}
        <div className={`flex-1 overflow-y-auto p-3 ${isDark ? "bg-black/95" : "bg-white/95"}`}>
          <div className="space-y-2 pr-2">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="group">
                <div
                  className={`relative p-3 cursor-pointer transition-all duration-200 rounded-xl border ${
                    currentConversationId === conversation.id
                      ? isDark
                        ? "bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/10 shadow-lg"
                        : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100 shadow-md"
                      : isDark
                        ? "bg-neutral-800/40 hover:bg-neutral-800/70 border-neutral-700/50 hover:border-neutral-600"
                        : "bg-white/70 hover:bg-white/90 border-neutral-200/60 hover:border-neutral-300 shadow-sm hover:shadow-md"
                  } hover:translate-y-[-1px] active:scale-95`}
                  onClick={() => loadConversation(conversation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-2">
                      <p
                        className={`text-sm font-medium truncate mb-1.5 ${
                          currentConversationId === conversation.id
                            ? isDark
                              ? "text-white"
                              : "text-purple-900"
                            : isDark
                              ? "text-neutral-200"
                              : "text-neutral-800"
                        }`}
                      >
                        {conversation.title}
                      </p>
                      <div className="flex items-center space-x-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            currentConversationId === conversation.id
                              ? "bg-gradient-to-r from-purple-400 to-blue-400"
                              : isDark
                                ? "bg-neutral-500"
                                : "bg-neutral-400"
                          }`}
                        ></div>
                        <p
                          className={`text-xs ${
                            currentConversationId === conversation.id
                              ? isDark
                                ? "text-purple-200"
                                : "text-purple-700"
                              : isDark
                                ? "text-neutral-400"
                                : "text-neutral-500"
                          }`}
                        >
                          {conversation.createdAt.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
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
                          ? "hover:bg-red-500/20 hover:text-red-400 text-neutral-400"
                          : "hover:bg-red-50 hover:text-red-500 text-neutral-500"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className={`text-center py-8 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                    isDark ? "bg-neutral-800/50" : "bg-neutral-200/50"
                  }`}
                >
                  <History className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium mb-1">No hay conversaciones</p>
                <p className="text-xs opacity-75">Inicia una nueva para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full">
        {/* Header - FIJO EN LA PARTE SUPERIOR */}
        <header
          className={`fixed top-0 left-0 right-0 z-30 border-b backdrop-blur-md transition-all duration-300 ${
            isDark ? "bg-black/95 border-neutral-800/30" : "bg-white/95 border-neutral-200/30"
          } ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""}`}
          style={{
            padding: isMobile ? '0.75rem' : '1rem',
            boxShadow: isDark ? '0 2px 20px rgba(0, 0, 0, 0.3)' : '0 2px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
              {(isMobile || isTablet) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 mr-1 ${isDark ? "text-neutral-300 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"}`}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <ElegantCircle 
                size={isMobile ? "w-10 h-10" : "w-12 h-12"} 
                className="shrink-0" 
                theme={theme} 
              />
              <div className="min-w-0">
                <h1 className={`font-bold truncate ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                  Natal-<span className="text-[#C972FF]">IA</span>
                </h1>
                <p className={`truncate ${isMobile ? 'text-xs' : 'text-xs md:text-sm'} ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  Tu asistente premium inteligente
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`p-2 ${isDark ? "text-neutral-300 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
              </Button>
              {!(isMobile || isTablet) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 ${isDark ? "text-neutral-300 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"}`}
                >
                  <History className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Contenedor principal con altura calculada para header y input fijos */}
        <div 
          className={`transition-all duration-300 ${isDark ? "bg-black" : "bg-neutral-50"} ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""}`}
          style={{
            marginTop: isMobile ? '60px' : '80px', // Espacio para el header fijo
            marginBottom: isMobile ? '100px' : '120px', // Espacio reducido para el input fijo
            minHeight: `calc(100vh - ${isMobile ? '160px' : '200px'})`, // Altura total menos header e input
            height: `calc(100vh - ${isMobile ? '160px' : '200px'})`
          }}
        >
          {/* Área de mensajes con scroll independiente */}
          <div 
            className={`w-full h-full overflow-y-auto overflow-x-hidden ${isDark ? "bg-black" : "bg-neutral-50"}`}
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            {/* Fondo decorativo */}
            {messages.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-r from-purple-600/20 via-pink-500/30 to-purple-600/20 blur-3xl opacity-50 pointer-events-none z-10"></div>
            )}

            <div className={`px-3 md:px-4 pb-4 min-h-full ${isDark ? "bg-black" : "bg-neutral-50"}`}>
              <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 py-6">
                {/* Mensaje de bienvenida */}
                {messages.length === 0 && (
                  <div className="text-center py-6 md:py-8">
                    <div className="mb-6 md:mb-8 flex justify-center">
                      <ElegantCircle 
                        size={isMobile ? "w-48 h-48" : "w-80 h-80"} 
                        theme={theme} 
                      />
                    </div>
                    <h3 className={`font-bold mb-2 md:mb-3 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                      Hola! Soy Natal-<span className="text-[#C972FF]">IA</span>
                    </h3>
                    <p className={`mb-2 px-4 ${isMobile ? 'text-sm' : 'text-base md:text-lg'} ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                      Diseñado para escucharte y responder a todas tus consultas
                    </p>
                    <p className={`px-4 ${isMobile ? 'text-xs' : 'text-sm md:text-base'} ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Mi función principal es escucharte - habla conmigo o escribe tu mensaje
                    </p>
                  </div>
                )}

                {/* Mensajes */}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    {!message.isUser && (
                      <div className={`mt-1 shrink-0 ${isMobile ? 'mr-2' : 'mr-2 md:mr-3'}`}>
                        <ElegantCircle 
                          size={isMobile ? "w-6 h-6" : "w-6 h-6 md:w-8 h-8"} 
                          theme={theme} 
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-2xl transition-all duration-200 ${isMobile ? 'p-3' : 'p-3 md:p-4'} ${
                        message.isUser
                          ? `text-black ${isMobile ? 'ml-6' : 'ml-8 md:ml-12'}`
                          : `mr-8 md:mr-12 border ${isDark
                              ? "bg-neutral-800 text-neutral-100 border-neutral-700"
                              : "bg-white text-neutral-900 border-neutral-200 shadow-sm"
                            }`
                      }`}
                      style={message.isUser ? { backgroundColor: "#C972FF" } : {}}
                    >
                      <div className="break-words hyphens-auto">
                        <p className={`leading-relaxed whitespace-pre-wrap overflow-wrap-anywhere ${isMobile ? 'text-sm' : 'text-sm'}`}>
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 md:mt-3">
                        <span
                          className={`text-xs ${
                            message.isUser ? "text-black/80" : isDark ? "text-neutral-400" : "text-neutral-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {message.hasAudio && !message.isUser && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(message.id)}
                            className={`p-0 ml-2 shrink-0 ${isMobile ? 'h-6 w-6' : 'h-6 w-6 md:h-7 md:w-7'}`}
                          >
                            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Indicador de escritura */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`mt-1 shrink-0 ${isMobile ? 'mr-2' : 'mr-2 md:mr-3'}`}>
                      <ElegantCircle 
                        size={isMobile ? "w-6 h-6" : "w-6 h-6 md:w-8 h-8"} 
                        theme={theme} 
                      />
                    </div>
                    <div
                      className={`rounded-2xl mr-8 md:mr-12 ${isMobile ? 'p-3' : 'p-3 md:p-4'} ${
                        isDark
                          ? "bg-neutral-800 border border-neutral-700"
                          : "bg-white border border-neutral-200 shadow-sm"
                      }`}
                    >
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
            </div>
          </div>
        </div>

        {/* Indicador de escucha - FIJO ARRIBA DEL INPUT */}
        {isListening && (
          <div
            className={`fixed bottom-0 left-0 right-0 z-39 backdrop-blur-md transition-all duration-300 ${
              isDark ? "bg-black/95" : "bg-purple-50/95"
            } ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""}`}
            style={{
              bottom: isMobile ? '100px' : '120px', // Justo arriba del área de input
              padding: isMobile ? '0.75rem' : '1rem'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <div className={`font-medium bg-[#C972FF] bg-clip-text text-transparent ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
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
                        animationDuration: "0.8s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Área de input - COMPLETAMENTE FIJA EN LA PARTE INFERIOR SIN LÍNEA DIVISORIA */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md transition-all duration-300 ${
            isDark ? "bg-black/95" : "bg-white/95"
          } ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""}`}
          style={{
            padding: isMobile ? '0.75rem' : '1rem 1.5rem',
            boxShadow: isDark ? '0 -8px 32px rgba(0, 0, 0, 0.6)' : '0 -8px 32px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-end gap-2 ${isMobile ? 'gap-2' : 'gap-2 md:gap-3'}`}>
              <div className="flex-1 min-w-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Pregunta lo que quieras..."
                  rows={1}
                  className={`w-full max-h-24 rounded-xl border-2 font-medium transition-all duration-200 resize-none overflow-hidden leading-tight ${
                    isMobile ? 'h-12 px-3 py-3 text-sm' : 'h-11 md:h-12 px-3 md:px-4 py-2.5 md:py-3 text-sm'
                  } ${
                    isDark
                      ? "bg-neutral-800/10 border-neutral-700 text-white placeholder-neutral-400 focus:border-purple-600/50 focus:outline-none"
                      : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
                  }`}
                  onInput={(e) => {
                    e.target.style.height = "auto"
                    const newHeight = Math.min(e.target.scrollHeight, 96)
                    e.target.style.height = newHeight + "px"
                  }}
                  style={{
                    minHeight: isMobile ? '48px' : '44px'
                  }}
                />
              </div>
              <Button
                variant={isListening ? "default" : "outline"}
                onClick={isListening ? stopListening : startListening}
                className={`rounded-xl transition-all duration-200 flex items-center justify-center p-0 active:scale-95 shrink-0 ${
                  isMobile ? 'h-12 w-12' : 'h-11 w-11 md:h-12 md:w-12'
                } ${
                  isListening
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                    : isDark
                      ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
                      : "border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {isListening ? (
                  <MicOff className={isMobile ? "h-5 w-5" : "h-4 w-4 md:h-5 md:w-5"} />
                ) : (
                  <Mic className={isMobile ? "h-5 w-5" : "h-4 w-4 md:h-5 md:w-5"} />
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className={`rounded-xl bg-[#C972FF] hover:bg-[#B565E8] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0 active:scale-95 shrink-0 shadow-lg ${
                  isMobile ? 'h-12 w-12' : 'h-11 w-11 md:h-12 md:w-12'
                }`}
              >
                <Send className={isMobile ? "h-5 w-5" : "h-4 w-4 md:h-5 md:w-5"} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}