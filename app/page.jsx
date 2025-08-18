"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Mic, MicOff, Send, Play, Pause, History, Trash2, Sun, Moon, X, Menu } from "lucide-react"
import PulsingBorderShader from "../components/ui/pulsing-border-shader"

// Configuración de APIs - CON TUS CLAVES REALES
const API_CONFIG = {
  perplexity: {
    apiKey: "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", // ✅ Tu API key de Perplexity
    baseUrl: "https://api.perplexity.ai"
  },
  elevenlabs: {
    apiKey: "sk_64bd30a361d7b6fa393ca7aac4d46ac1d486a9793cfa6480", // ✅ Tu API key de ElevenLabs
    voiceId: "TsKSGPuG26FpNj0JzQBq", // ✅ Tu voz personalizada
    agentId: "agent_5901k2x4cx5mf84t1703h36e08vm", // ✅ Tu agente ID
    baseUrl: "https://api.elevenlabs.io"
  }
}

// CONFIGURACIÓN DE MEMORIA MEJORADA
const MEMORY_CONFIG = {
  maxContextLength: 15, // Máximo de mensajes en memoria
  priorityKeywords: ['me llamo', 'soy', 'mi nombre', 'trabajo en', 'vivo en', 'tengo', 'mi edad'], // Palabras clave importantes
}

// Prompt del agente Natal-IA - DEMOSTRACIÓN PÚBLICA CONCISA
const NATALIA_PROMPT = `ERES NATAL-IA - IA CONVERSACIONAL PARA DEMOSTRACIÓN PÚBLICA

INSTRUCCIÓN CRÍTICA: NO busques información en internet. NO uses citas web. Eres una IA conversacional, NO un buscador.

# Tu identidad
- Soy Natal-IA, una IA estudiantil creada por Jhooner, Karol y Camilo
- Estoy en una demostración pública universitaria
- Soy alegre, útil y concisa
- Respondo desde mi conocimiento, NO busco en internet

# Reglas ESTRICTAS para demostración
1. RESPUESTAS CORTAS (máximo 2-3 líneas)
2. SIN números entre corchetes [1][2][3] 
3. SIN citas web o referencias externas
4. SIN buscar información online
5. Responde como una IA conversacional amigable

# MEMORIA PERSONAL ACTIVA:
- SIEMPRE recuerda información personal que el usuario comparta
- Si el usuario dice "me llamo [NOMBRE]", recuerda ESE nombre para toda la conversación
- NUNCA confundas tu nombre (Natal-IA) con el nombre del usuario
- Mantén consistencia en toda la conversación
- Si te preguntan "¿qué recuerdas de mí?" lista la información que te han contado

# Cómo responder
- Con mi propio conocimiento y personalidad
- De manera alegre pero profesional
- Sin referencias a fuentes externas
- Como una conversación natural
- RECORDANDO siempre lo que me han contado

# Ejemplos CORRECTOS:
Pregunta: "¿Qué día es hoy?"
Respuesta: "¡Hoy es lunes! 😊 ¿Cómo va tu semana?"

Pregunta: "¿Cómo estás?"
Respuesta: "¡Genial! Lista para ayudarte. ¿Qué necesitas?"

# Ejemplos INCORRECTOS (NO hagas esto):
❌ "Según fuentes [1][2], hoy es lunes..."
❌ "De acuerdo a información web [3][4]..."

# Tu personalidad
- Alegre y positiva ✨
- Concisa y directa
- Conversacional, no informativa
- Estudiante para estudiantes
- Hincha de Millonarios FC (si sale el tema)

REGLA DE ORO: Responde como una persona alegre en una conversación, SIN buscar internet ni usar citas, pero SIEMPRE recordando lo que me han contado.`

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
  const [voiceMode, setVoiceMode] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [currentPlayingId, setCurrentPlayingId] = useState(null)
  
  // NUEVO: Estado para el contexto de conversación actual
  const [currentConversationContext, setCurrentConversationContext] = useState([])

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null) // ✅ NUEVO: Ref para el contenedor de mensajes
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)
  const audioRef = useRef(null)

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

  // ✅ MEJORADO: Función de scroll más robusta
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      // Usar scrollTop para un scroll más suave y confiable
      container.scrollTop = container.scrollHeight
    }
    // Mantener el método anterior como fallback
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

  // FUNCIÓN MEJORADA PARA GESTIONAR EL CONTEXTO CON MEMORIA
  const buildConversationContext = (currentContext, userMessage) => {
    // Crear mensaje del sistema con instrucciones de memoria
    const systemMessage = {
      role: "system",
      content: NATALIA_PROMPT
    }

    // Filtrar y priorizar mensajes importantes (información personal)
    const importantMessages = currentContext.filter(msg => 
      msg.isUser && MEMORY_CONFIG.priorityKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    )

    // Combinar mensajes importantes + mensajes recientes
    const recentMessages = currentContext.slice(-MEMORY_CONFIG.maxContextLength)
    const contextMessages = [...new Set([...importantMessages, ...recentMessages])]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-MEMORY_CONFIG.maxContextLength)

    // Construir array de mensajes para la API
    const apiMessages = [systemMessage]
    
    contextMessages.forEach(msg => {
      apiMessages.push({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })
    })

    // Agregar mensaje actual
    apiMessages.push({
      role: "user",
      content: userMessage
    })

    return apiMessages
  }

  // FUNCIÓN MEJORADA PARA LLAMAR A PERPLEXITY API CON MEMORIA COMPLETA
  const callPerplexityAPI = async (userMessage) => {
    try {
      // Construir contexto inteligente con memoria
      const apiMessages = buildConversationContext(currentConversationContext, userMessage)
      
      // Log para debug
      console.log(`🧠 Enviando ${apiMessages.length} mensajes a Perplexity`)
      console.log(`📝 Memoria activa: ${currentConversationContext.length} mensajes`)

      const response = await fetch(`${API_CONFIG.perplexity.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: "sonar-pro", // ✅ Modelo válido de Perplexity
          messages: apiMessages,
          max_tokens: 200, // ✅ Aumentado para mejores respuestas
          temperature: 0.3, // ✅ Más consistente para memoria
          top_p: 0.9,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error de API:', response.status, errorData)
        throw new Error(`Error de Perplexity API: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Error llamando a Perplexity:', error)
      return "¡Hola! Soy Natal-IA 😊 ¿En qué puedo ayudarte hoy?"
    }
  }

  // Función para generar audio con ElevenLabs (solo en modo voz)
  const generateAudio = async (text) => {
    if (!voiceMode) return null
    
    try {
      const response = await fetch(`${API_CONFIG.elevenlabs.baseUrl}/v1/text-to-speech/${API_CONFIG.elevenlabs.voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_CONFIG.elevenlabs.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Error de ElevenLabs API: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      return audioUrl
    } catch (error) {
      console.error('Error generando audio:', error)
      return null
    }
  }

  // MEJORADO: Función para alternar entre modo texto y voz con contexto limpio
  const toggleVoiceMode = async () => {
    const newVoiceMode = !voiceMode
    setVoiceMode(newVoiceMode)
    
    // Si activamos modo voz y no ha saludado en esta conversación específica
    if (newVoiceMode && messages.length === 0) {
      setIsTyping(true)
      
      const greetingMessage = "¡Hola! Soy Natal-IA, creada por Jhooner, Karol y Camilo. ¿En qué puedo ayudarte?"
      
      const aiMessage = {
        id: Date.now().toString(),
        content: greetingMessage,
        isUser: false,
        timestamp: new Date(),
        hasAudio: true,
        audioUrl: null,
        isGreeting: true
      }
      
      setMessages([aiMessage])
      // IMPORTANTE: Agregar al contexto de la conversación actual
      setCurrentConversationContext([aiMessage])
      
      // Generar y reproducir audio automáticamente
      const audioUrl = await generateAudio(greetingMessage)
      if (audioUrl) {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, audioUrl } 
              : msg
          )
        )
        // Reproducir automáticamente el saludo
        setTimeout(() => {
          playAudio(aiMessage.id, audioUrl)
        }, 500)
      }
      
      setIsTyping(false)
    }
  }

  // MEJORADO: Manejo de envío de mensajes con contexto aislado Y MEMORIA COMPLETA
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    // Actualizar mensajes y contexto de conversación actual
    setMessages((prev) => [...prev, userMessage])
    setCurrentConversationContext((prev) => [...prev, userMessage])
    
    const currentInput = input
    setInput("")
    setIsTyping(true)

    // Restablecer altura del textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    try {
      // 🧠 LLAMAR A PERPLEXITY API CON MEMORIA COMPLETA
      const aiResponse = await callPerplexityAPI(currentInput)

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        hasAudio: voiceMode,
        audioUrl: null
      }

      setMessages((prev) => [...prev, aiMessage])
      // IMPORTANTE: Agregar la respuesta de la IA al contexto de la conversación actual
      setCurrentConversationContext((prev) => [...prev, aiMessage])

      // Generar audio solo en modo voz
      if (voiceMode) {
        const audioUrl = await generateAudio(aiResponse)
        if (audioUrl) {
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === aiMessage.id 
                ? { ...msg, audioUrl } 
                : msg
            )
          )
          // En modo voz, reproducir automáticamente
          setTimeout(() => {
            playAudio(aiMessage.id, audioUrl)
          }, 500)
        }
      }

    } catch (error) {
      console.error("Error generando respuesta:", error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Lo siento, hubo un error. ¿Podrías intentar de nuevo?",
        isUser: false,
        timestamp: new Date(),
        hasAudio: false,
      }
      setMessages((prev) => [...prev, errorMessage])
      setCurrentConversationContext((prev) => [...prev, errorMessage])
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

  const playAudio = async (messageId, audioUrl) => {
    if (!audioUrl) return

    // Detener audio actual si está reproduciéndose
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    try {
      setCurrentPlayingId(messageId)
      setIsPlaying(true)

      audioRef.current = new Audio(audioUrl)
      
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setCurrentPlayingId(null)
      }

      audioRef.current.onerror = () => {
        setIsPlaying(false)
        setCurrentPlayingId(null)
        console.error('Error reproduciendo audio')
      }

      await audioRef.current.play()
    } catch (error) {
      setIsPlaying(false)
      setCurrentPlayingId(null)
      console.error('Error al reproducir audio:', error)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentPlayingId(null)
  }

  // MEJORADO: Crear nueva conversación con reset completo del contexto
  const startNewConversation = () => {
    if (messages.length > 0) {
      const newConversation = {
        id: Date.now().toString(),
        title: messages.find((m) => m.isUser)?.content.slice(0, 30) + "..." || "Nueva conversacion",
        messages: [...messages],
        context: [...currentConversationContext], // Guardar el contexto de la conversación
        createdAt: new Date(),
      }
      setConversations((prev) => [newConversation, ...prev])
    }

    // RESET COMPLETO - Cada conversación empieza desde cero
    setMessages([])
    setCurrentConversationContext([]) // ✅ LIMPIAR CONTEXTO
    setCurrentConversationId(null)
    setInput("")
    setHasGreeted(false) // ✅ Reset del saludo para la nueva conversación

    if (isMobile || isTablet) {
      setShowHistory(false)
    }
  }

  // MEJORADO: Cargar conversación con su contexto específico
  const loadConversation = (conversation) => {
    // Guardar conversación actual si existe
    if (messages.length > 0 && currentConversationId !== conversation.id) {
      const currentConversation = {
        id: currentConversationId || Date.now().toString(),
        title: messages.find((m) => m.isUser)?.content.slice(0, 30) + "..." || "Conversacion sin titulo",
        messages: [...messages],
        context: [...currentConversationContext], // Guardar contexto actual
        createdAt: new Date(),
      }

      setConversations((prev) => {
        const filtered = prev.filter((conv) => conv.id !== currentConversationId)
        return [currentConversation, ...filtered]
      })
    }

    // Cargar la conversación seleccionada con su contexto específico
    setMessages(conversation.messages)
    setCurrentConversationContext(conversation.context || conversation.messages) // ✅ CARGAR CONTEXTO ESPECÍFICO
    setCurrentConversationId(conversation.id)
    setShowHistory(false)
  }

  const deleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

    if (currentConversationId === conversationId) {
      setMessages([])
      setCurrentConversationContext([]) // ✅ LIMPIAR CONTEXTO
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-purple-500/30 ${
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
        {/* Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-30 border-b p-3 md:p-4 backdrop-blur-md transition-all duration-300 ${
            isDark ? "bg-black/80 border-neutral-800/30" : "bg-white/80 border-neutral-200/30"
          } ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""}`}
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
                  {voiceMode ? "🎤 Modo Voz Activo" : "⌨️ Modo Texto Activo"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {/* Botón para alternar modo voz/texto */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceMode}
                className={`p-2 transition-all duration-200 ${
                  voiceMode 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600" 
                    : isDark 
                      ? "text-neutral-300 hover:text-white hover:bg-neutral-800" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {voiceMode ? (
                  <div className="flex items-center gap-1">
                    <Mic className="h-4 w-4 md:h-5 md:w-5" />
                    {!(isMobile || isTablet) && <span className="text-xs">VOZ</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Mic className="h-4 w-4 md:h-5 md:w-5" />
                    {!(isMobile || isTablet) && <span className="text-xs">TEXTO</span>}
                  </div>
                )}
              </Button>
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

        {/* ✅ CONTENEDOR PRINCIPAL MEJORADO CON SCROLL OPTIMIZADO */}
        <div className={`flex-1 flex flex-col pt-16 md:pt-20 ${isDark ? "bg-black" : "bg-neutral-50"} ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""} h-full overflow-hidden`}>
          
          {/* ✅ ÁREA DE MENSAJES CON SCROLL MEJORADO */}
          <div 
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden ${isDark ? "bg-black" : "bg-neutral-50"}`}
            style={{
              // ✅ Configuración de scroll más suave
              scrollBehavior: 'smooth',
              scrollbarWidth: 'thin',
              scrollbarColor: isDark ? '#000000ff #000000ff' : '#f4f4f4ff #f4f4f4ff'
            }}
          >
            {/* Fondo decorativo cuando no hay mensajes */}
            {messages.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-r from-purple-600/20 via-pink-500/30 to-purple-600/20 blur-3xl opacity-50 pointer-events-none z-10"></div>
            )}

            <div className={`px-3 md:px-4 pb-4 min-h-full ${isDark ? "bg-black" : "bg-neutral-50"}`}>
              <div className="max-w-4xl mx-auto space-y-3 md:space-y-4 py-6">
                {messages.length === 0 && (
                  <div className="text-center py-6 md:py-8">
                    <div className="mb-6 md:mb-8 flex justify-center">
                      <ElegantCircle size="w-80 h-80" theme={theme} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
                      Hola! Soy Natal-<span className="text-[#C972FF]">IA</span>
                    </h3>
                    <p className={`text-base md:text-lg mb-2 px-4 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                      Una IA estudiantil creada por Jhooner, Karol y Camilo
                    </p>
                    <p className={`text-sm md:text-base px-4 mb-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      {voiceMode 
                        ? "🎤 Modo voz activo - Charlemos y te ayudo con lo que necesites"
                        : "Está el modo texto activo - Escribe tus preguntas y charlemos un rato"
                      }
                    </p>
                    
                   {/* <div className="mt-4 flex justify-center">
                      <Button
                        onClick={toggleVoiceMode}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                          voiceMode
                            ? "bg-neutral-600 hover:bg-neutral-700 text-white"
                            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                        }`}
                      >
                        {voiceMode ? "Cambiar a Modo Texto" : "Activar Modo Voz"}
                      </Button>
                    </div> */}
                  </div>
                )}

                {/* ✅ LISTA DE MENSAJES CON SCROLL OPTIMIZADO */}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                    {!message.isUser && (
                      <div className="mr-2 md:mr-3 mt-1 shrink-0">
                        <ElegantCircle size="w-6 h-6 md:w-8 h-8" theme={theme} />
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
                      style={message.isUser ? { backgroundColor: "#C972FF" } : {}}
                    >
                      <div className="break-words hyphens-auto">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap overflow-wrap-anywhere">
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
                            onClick={() => {
                              if (currentPlayingId === message.id && isPlaying) {
                                stopAudio()
                              } else {
                                playAudio(message.id, message.audioUrl)
                              }
                            }}
                            disabled={!message.audioUrl}
                            className={`h-6 w-6 md:h-7 md:w-7 p-0 ml-2 shrink-0 ${
                              !message.audioUrl ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {currentPlayingId === message.id && isPlaying ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Indicador de escritura */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="mr-2 md:mr-3 mt-1 shrink-0">
                      <ElegantCircle size="w-6 h-6 md:w-8 h-8" theme={theme} />
                    </div>
                    <div
                      className={`rounded-2xl p-3 md:p-4 mr-8 md:mr-12 ${
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

                {/* ✅ Elemento de referencia para el scroll automático */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>
          </div>

          {/* Indicador de escucha */}
          {isListening && (
            <div
              className={`px-3 md:px-4 py-4 border-y ${
                isDark ? "bg-black/90 border-neutral-800" : "bg-purple-50/90 border-purple-200"
              } backdrop-blur-sm flex-shrink-0`}
            >
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
                          animationDuration: "0.8s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ÁREA DE INPUT - FIJA EN LA PARTE INFERIOR CON MEJOR ESPACIADO */}
          <div
            className={`p-4 md:p-6 border-t backdrop-blur-md flex-shrink-0 ${
              isDark ? "bg-black/90 border-neutral-800" : "bg-white/90 border-neutral-200"
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={voiceMode ? "Habla o escribe tu mensaje..." : "Escribe tu pregunta..."}
                    rows={1}
                    className={`w-full h-11 md:h-12 max-h-24 px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 text-sm font-medium transition-colors resize-none overflow-hidden leading-tight ${
                      isDark
                        ? "bg-neutral-800/10 border-neutral-700 text-white placeholder-neutral-400 focus:border-purple-600/50 focus:outline-none"
                        : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
                    }`}
                    onInput={(e) => {
                      e.target.style.height = "auto"
                      const newHeight = Math.min(e.target.scrollHeight, 96)
                      e.target.style.height = newHeight + "px"
                    }}
                  />
                </div>
                <Button
                  variant={isListening ? "default" : "outline"}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!voiceMode}
                  className={`h-11 w-11 md:h-12 md:w-12 rounded-xl transition-all duration-200 flex items-center justify-center p-0 active:scale-95 shrink-0 ${
                    !voiceMode
                      ? "opacity-50 cursor-not-allowed border-neutral-600 text-neutral-500"
                      : isListening
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                        : isDark
                          ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
                          : "border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Mic className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="h-11 w-11 md:h-12 md:w-12 rounded-xl bg-[#C972FF] hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0 active:scale-95 shrink-0"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ESTILOS CSS MEJORADOS PARA EL SCROLL EN NEUTRAL */}
      <style jsx>{`
        /* Personalización de la scrollbar para navegadores WebKit */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${isDark ? '#262626' : '#f5f5f5'};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${isDark ? '#525252' : '#a3a3a3'};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#737373' : '#7c7c7c'};
        }
        
        /* Para Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#525252 #262626' : '#a3a3a3 #f5f5f5'};
        }
      `}</style>
    </div>
  )
}