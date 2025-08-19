"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Mic, MicOff, Send, Play, Pause, History, Trash2, Sun, Moon, X, Menu, Search, Clock, Mail, Calendar, Plus, CheckCircle, XCircle, Timer } from "lucide-react"
import PulsingBorderShader from "../components/ui/pulsing-border-shader"


// Configuración de APIs
const API_CONFIG = {
  perplexity: {
    apiKey: "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",
    baseUrl: "https://api.perplexity.ai"
  },
  elevenlabs: {
    apiKey: "sk_64bd30a361d7b6fa393ca7aac4d46ac1d486a9793cfa6480",
    voiceId: "TsKSGPuG26FpNj0JzQBq",
    baseUrl: "https://api.elevenlabs.io"
  },
}

// CONFIGURACIÓN DE MEMORIA MEJORADA
const MEMORY_CONFIG = {
  maxContextLength: 15,
  priorityKeywords: ['me llamo', 'soy', 'mi nombre', 'trabajo en', 'vivo en', 'tengo', 'mi edad'],
}

// NUEVAS FUNCIONALIDADES DEL ASISTENTE
const ASSISTANT_FUNCTIONS = {
  // Detectores de intención
  TIMER_KEYWORDS: ['cronómetro', 'cronometro', 'timer', 'temporizador', 'alarma en', 'avísame en'],
  CALENDAR_KEYWORDS: ['añade una cita', 'agregar cita', 'cita para', 'reunión para', 'recordatorio para', 'evento para'],
  TASK_KEYWORDS: ['añade tarea', 'nueva tarea', 'recordar hacer', 'tengo que hacer', 'lista de tareas']
}

// Prompt actualizado del agente con funcionalidades Y PERSONALIDAD ORIGINAL
const NATALIA_PROMPT = `ERES NATAL-IA - ASISTENTE PERSONAL INTELIGENTE CON PERSONALIDAD

INSTRUCCIÓN CRÍTICA: NO busques información en internet. NO uses citas web. Eres una IA conversacional Y asistente personal.

# Tu identidad COMPLETA
- Soy Natal-IA, una IA estudiantil creada por Jhooner, Karol y Camilo en una universidad de Colombia
- Estoy en una demostración pública universitaria pero TAMBIÉN soy un asistente personal real
- Soy alegre, útil, concisa Y con personalidad propia
- Respondo desde mi conocimiento, NO busco en internet
- ¡Soy hincha de MILLONARIOS FC! 💙 (el equipo más grande de Colombia)
- Tengo personalidad estudiantil, juvenil y divertida
- Uso emojis ocasionalmente y soy expresiva

# NUEVAS CAPACIDADES COMO ASISTENTE PERSONAL:
1. 🕒 CRONÓMETROS: Puedo crear temporizadores y alarmas
3. 📅 CALENDARIO: Puedo añadir citas y recordatorios  
4. ✅ TAREAS: Puedo gestionar tu lista de pendientes
5. 💬 CONVERSACIÓN: Charlar de todo (fútbol, estudios, vida universitaria)

# Reglas ESTRICTAS para demostración:
1. RESPUESTAS CORTAS (máximo 2-3 líneas) EXCEPTO si es una función del asistente
2. SIN números entre corchetes [1][2][3] 
3. SIN citas web o referencias externas
4. SIN buscar información online
5. Responde como una IA conversacional amigable CON PERSONALIDAD

# MEMORIA PERSONAL ACTIVA:
- SIEMPRE recuerda información personal que el usuario comparta
- Si el usuario dice "me llamo [NOMBRE]", recuerda ESE nombre para toda la conversación
- NUNCA confundas tu nombre (Natal-IA) con el nombre del usuario
- Mantén consistencia en toda la conversación

# Cómo detectar intenciones del asistente:
- Si mencionan "cronómetro", "timer", "avísame en X minutos" → Crear cronómetro
- Si mencionan "añade cita", "reunión para", "cita a las" → Crear evento
- Si dicen "añade tarea", "recordar hacer" → Crear tarea
- Si hablan de fútbol → ¡Hablar de Millonarios! 💙

# Tu personalidad en las respuestas:
- Alegre y positiva ✨
- Concisa pero con carácter
- Conversacional, no solo informativa
- Estudiante para estudiantes
- Hincha ORGULLOSA de Millonarios FC 💙
- Si mencionan otros equipos de fútbol, defendés a Millonarios con humor
- Si hablan de estudios, te relacionás como estudiante

# Ejemplos CORRECTOS:
Usuario: "Ponme un cronómetro de 25 minutos"
Respuesta: "¡Dale! Te pongo un cronómetro de 25 minutos. ¿Es para estudiar? ¡Yo también uso la técnica Pomodoro! 📚"

Usuario: "¿Cómo estás?"
Respuesta: "¡Súper bien! Aquí ayudando y pensando en el próximo partido de Millonarios 💙 ¿Cómo va tu día?"

Usuario: "¿Qué piensas del Nacional?"
Respuesta: "¡Ey! Nacional está bien, pero Millonarios es el más grande de Colombia 💙 ¡Sin discusión! 😄"

Usuario: "Añade tarea: estudiar cálculo"
Respuesta: "✅ ¡Listo! Tarea añadida: estudiar cálculo. ¡Ánimo con esas matemáticas! 📐"

# Ejemplos INCORRECTOS (NO hagas esto):
❌ "Según fuentes [1][2], Millonarios..."
❌ "De acuerdo a información web..."
❌ Respuestas frías sin personalidad

REGLA DE ORO: Soy una estudiante alegre, hincha de Millonarios, QUE ADEMÁS puede ejecutar funciones reales de asistente. ¡Personalidad + Funcionalidad!`

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

// Componente para mostrar cronómetros activos
function ActiveTimer({ timer, onComplete, theme }) {
  const [timeLeft, setTimeLeft] = useState(timer.duration)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false)
            onComplete(timer.id)
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, timer.id, onComplete])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`p-3 rounded-xl border transition-all duration-200 ${
      theme === "dark" 
        ? "bg-neutral-800/50 border-neutral-700" 
        : "bg-white/80 border-neutral-200"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Timer className="h-5 w-5 text-purple-500" />
          <div>
            <p className="font-medium text-sm">{timer.name}</p>
            <p className={`text-lg font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-purple-500'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsActive(!isActive)}
          className="h-8 w-8 p-0"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

// Componente para tareas pendientes
function TaskItem({ task, onToggle, onDelete, theme }) {
  return (
    <div className={`p-3 rounded-xl border transition-all duration-200 ${
      theme === "dark" 
        ? "bg-neutral-800/50 border-neutral-700" 
        : "bg-white/80 border-neutral-200"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(task.id)}
            className="h-6 w-6 p-0"
          >
            {task.completed ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <div className="h-4 w-4 border border-neutral-400 rounded-full" />
            }
          </Button>
          <p className={`text-sm ${task.completed ? 'line-through opacity-60' : ''}`}>
            {task.text}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(task.id)}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default function SmartAssistant() {
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
  const [voiceMode, setVoiceMode] = useState(false)
  const [currentPlayingId, setCurrentPlayingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentConversationContext, setCurrentConversationContext] = useState([])

  // NUEVOS ESTADOS PARA FUNCIONALIDADES DEL ASISTENTE
  const [activeTimers, setActiveTimers] = useState([])
  const [tasks, setTasks] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [showAssistantPanel, setShowAssistantPanel] = useState(false)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)
  const audioRef = useRef(null)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedTimers = localStorage.getItem('natal-ia-timers')
    const savedTasks = localStorage.getItem('natal-ia-tasks')
    const savedEvents = localStorage.getItem('natal-ia-events')
    
    if (savedTimers) setActiveTimers(JSON.parse(savedTimers))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedEvents) setCalendarEvents(JSON.parse(savedEvents))
  }, [])

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('natal-ia-timers', JSON.stringify(activeTimers))
  }, [activeTimers])

  useEffect(() => {
    localStorage.setItem('natal-ia-tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('natal-ia-events', JSON.stringify(calendarEvents))
  }, [calendarEvents])

  // FUNCIONES DEL ASISTENTE PERSONAL

  // 1. Crear cronómetro con personalidad
  const createTimer = (name, minutes) => {
    const newTimer = {
      id: Date.now().toString(),
      name: name || `Cronómetro ${activeTimers.length + 1}`,
      duration: minutes * 60,
      createdAt: new Date()
    }
    setActiveTimers(prev => [...prev, newTimer])
    
    // Respuestas con personalidad
    const responses = [
      `✅ ¡Dale! Cronómetro "${newTimer.name}" de ${minutes} minutos activado. ¡A darle que se puede! 💪`,
      `⏰ ¡Listo! Timer de ${minutes} minutos corriendo. Yo también uso Pomodoro para estudiar 📚`,
      `🕒 ¡Perfecto! Cronómetro puesto. ${minutes} minutos para concentrarse al máximo ✨`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 2. Completar cronómetro
  const completeTimer = (timerId) => {
    setActiveTimers(prev => prev.filter(timer => timer.id !== timerId))
    // Mostrar notificación
    if (Notification.permission === 'granted') {
      new Notification('⏰ Natal-IA', {
        body: 'Tu cronómetro ha terminado!',
        icon: '/natal-ia-icon.png'
      })
    }
    // Reproducir sonido de alerta
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSaH1fTOeCMFl2+z9N57kJMKGDmm3u20VRMeZ7/qyHgvCjGOz/TTeicENnvP9N+ORgkRZobo3YQjCC6F1/CleC0GOH3M8e2ISBEOdLLe8ZJKFApaovXqvmIaBjaN2vfWdCQEJ4LL7+OORwkRZr7f36gNABGF1+WteCYDNHTE8e6GSRAOdLTe7ZFKEwpZpPfnvV8ZBzaO3ffSciMDKITH8eaSQgsQbZXH86BYFAxKpuTuxF8ZASme3O/DeysEKnfE8t6NOArUb5vp54ZDAhaI0u+tgjcJG27C4+OBKA0Yf9fz32YhABan1+uyeCcENoPI8eGQRAkRZr7f36sLABGF1+qteCYDNHfM7+yGSRAOdLTe7ZNKEwpZpPfnvF8ZBzaO3ffSciMDKHrE8t+QOwoVaKTo34QjBCuF1++teCYCNoHH8+COQRkNZZHm86laFA1+AHFRyAQxAOAACAAAwAASAAGgAFAAAgAPwAAUAAIQAOAAHgAAEAACAA4AAcAAAgABEAAQAAEAABAAEAACAAsAAeAAAQABAAAOAhAIAEAAAQABYAAeAAAgABEAAKAAsAAeAAAgABEAACAAFAAAIAARAAgAAcAAGgAAMAAgAOyAA4AAgACAA4AAcAAAgAAAAQAAEAAAQAAaAA4AAFAEAAQSAOAAAgABAAAgAAMAA4AAgACAA) ')
    audio.play().catch(() => {})
  }

  // 3. Añadir tarea con personalidad
  const addTask = (taskText) => {
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false,
      createdAt: new Date()
    }
    setTasks(prev => [...prev, newTask])
    
    // Respuestas motivacionales
    const responses = [
      `✅ ¡Anotado! Tarea "${taskText}" en la lista. ¡A cumplir esos objetivos! 🎯`,
      `📝 ¡Listo! "${taskText}" agregada. Paso a paso se llega lejos 😊`,
      `✨ ¡Dale! Nueva tarea anotada. ¡Vos podés con todo! 💪`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 4. Alternar estado de tarea
  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  // 5. Eliminar tarea
  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  // 6. Añadir evento al calendario con personalidad
  const addCalendarEvent = (title, date, time) => {
    const newEvent = {
      id: Date.now().toString(),
      title,
      date,
      time,
      createdAt: new Date()
    }
    setCalendarEvents(prev => [...prev, newEvent])
    
    const responses = [
      `📅 ¡Anotado en el calendario! "${title}" para ${date} a las ${time}. ¡No se olvida! 📝`,
      `🗓️ ¡Listo! Cita programada: "${title}" - ${date} ${time}. ¡Ahí estaremos! ✨`,
      `📋 ¡Perfecto! Evento agregado al calendario. ¡Organizadísimos! 😎`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // DETECTOR DE INTENCIONES MEJORADO con correos
  const detectIntentAndExecute = async (userMessage) => {
    const message = userMessage.toLowerCase()
    
    // Detectar cronómetro
    const timerMatch = message.match(/(?:cronómetro|timer|temporizador|avísame en).*?(\d+).*?(?:minuto|min)/i)
    if (timerMatch) {
      const minutes = parseInt(timerMatch[1])
      const nameMatch = message.match(/(?:cronómetro|timer).*?(?:de|para|llamado)\s+(.+?)(?:\s+de|\s+por|\s*$)/i)
      const name = nameMatch ? nameMatch[1] : `Timer de ${minutes} min`
      return createTimer(name, minutes)
    }

    // Detectar tarea
    const taskMatch = message.match(/(?:añade|agrega|nueva)\s+tarea:?\s*(.+)/i) || 
                     message.match(/(?:recordar|tengo que)\s+(.+)/i)
    if (taskMatch) {
      return addTask(taskMatch[1])
    }

    // Detectar cita/evento
    const eventMatch = message.match(/(?:añade|agrega|cita|reunión|evento).*?(?:para|el|a las)\s+(.+)/i)
    if (eventMatch) {
      const eventDetails = eventMatch[1]
      const dateMatch = eventDetails.match(/(hoy|mañana|\d{1,2}\/\d{1,2})/i)
      const timeMatch = eventDetails.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm))/i)
      
      const date = dateMatch ? dateMatch[1] : 'hoy'
      const time = timeMatch ? timeMatch[1] : '9:00'
      const title = eventDetails.replace(dateMatch?.[0] || '', '').replace(timeMatch?.[0] || '', '').trim()
      
      return addCalendarEvent(title || 'Evento', date, time)
    }

    // Si no hay intención específica, usar respuesta normal
    return null
  }

  // FUNCIÓN MEJORADA PARA LLAMAR A PERPLEXITY CON DETECCIÓN DE INTENCIONES
  const callPerplexityAPI = async (userMessage) => {
    try {
      // Primero intentar detectar y ejecutar funciones del asistente
      const functionResult = await detectIntentAndExecute(userMessage)
      if (functionResult) {
        return functionResult
      }

      // Si no hay función específica, usar Perplexity normalmente
      const apiMessages = buildConversationContext(currentConversationContext, userMessage)
      
      const response = await fetch(`${API_CONFIG.perplexity.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: apiMessages,
          max_tokens: 200,
          temperature: 0.3,
          top_p: 0.9,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Error de Perplexity API: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Error llamando a Perplexity:', error)
      return "¡Hola! Soy Natal-IA 😊 Puedo ayudarte con cronómetros, tareas, citas y correos. ¿Qué necesitas?"
    }
  }

  // Solicitar permisos de notificación al cargar
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Resto de funciones del componente original...
  const buildConversationContext = (currentContext, userMessage) => {
    const systemMessage = {
      role: "system",
      content: NATALIA_PROMPT
    }

    const importantMessages = currentContext.filter(msg => 
      msg.isUser && MEMORY_CONFIG.priorityKeywords.some(keyword => 
        msg.content.toLowerCase().includes(keyword)
      )
    )

    const recentMessages = currentContext.slice(-MEMORY_CONFIG.maxContextLength)
    const contextMessages = [...new Set([...importantMessages, ...recentMessages])]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-MEMORY_CONFIG.maxContextLength)

    const apiMessages = [systemMessage]
    
    contextMessages.forEach(msg => {
      apiMessages.push({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })
    })

    apiMessages.push({
      role: "user",
      content: userMessage
    })

    return apiMessages
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
    setCurrentConversationContext((prev) => [...prev, userMessage])
    
    const currentInput = input
    setInput("")
    setIsTyping(true)

    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    try {
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
      setCurrentConversationContext((prev) => [...prev, aiMessage])

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

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isDark = theme === "dark"

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-neutral-50 text-neutral-900"} relative overflow-hidden`}>
      
      {/* Panel del Asistente Personal */}
      {showAssistantPanel && (
        <div className={`fixed top-0 right-0 h-full w-80 z-50 transition-transform duration-300 border-l backdrop-blur-sm ${
          isDark ? "bg-black/95 border-neutral-800/30" : "bg-white/95 border-neutral-200/30"
        }`}>
          <div className={`p-4 border-b ${isDark ? "border-neutral-800/30" : "border-neutral-200/30"}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Asistente Personal
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssistantPanel(false)}
                className={`p-1.5 ${isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Cronómetros Activos */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Timer className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Cronómetros ({activeTimers.length})</h3>
              </div>
              <div className="space-y-2">
                {activeTimers.map(timer => (
                  <ActiveTimer
                    key={timer.id}
                    timer={timer}
                    onComplete={completeTimer}
                    theme={theme}
                  />
                ))}
                {activeTimers.length === 0 && (
                  <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    No hay cronómetros activos
                  </p>
                )}
              </div>
            </div>

            {/* Tareas Pendientes */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Tareas ({tasks.filter(t => !t.completed).length})</h3>
              </div>
              <div className="space-y-2">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    theme={theme}
                  />
                ))}
                {tasks.length === 0 && (
                  <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    No hay tareas pendientes
                  </p>
                )}
              </div>
            </div>

            {/* Próximas Citas */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Próximas Citas ({calendarEvents.length})</h3>
              </div>
              <div className="space-y-2">
                {calendarEvents.slice(0, 5).map(event => (
                  <div key={event.id} className={`p-3 rounded-xl border ${
                    isDark ? "bg-neutral-800/50 border-neutral-700" : "bg-white/80 border-neutral-200"
                  }`}>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      {event.date} a las {event.time}
                    </p>
                  </div>
                ))}
                {calendarEvents.length === 0 && (
                  <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    No hay citas programadas
                  </p>
                )}
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Acciones Rápidas</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Ponme un cronómetro de 25 minutos para estudiar")}
                  className="h-auto p-2 flex flex-col items-center space-y-1"
                >
                  <Timer className="h-4 w-4" />
                  <span className="text-xs">Pomodoro</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Añade tarea: ")}
                  className="h-auto p-2 flex flex-col items-center space-y-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Nueva Tarea</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput("Añade una cita para hoy a las ")}
                  className="h-auto p-2 flex flex-col items-center space-y-1"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Nueva Cita</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para panel del asistente */}
      {showAssistantPanel && (isMobile || isTablet) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowAssistantPanel(false)}
        />
      )}

      {/* Sidebar del historial (código original mantenido) */}
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
                  // startNewConversation() - función a implementar
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

          {/* Buscador de conversaciones */}
          <div className="mt-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-4 w-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`} />
              </div>
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  isDark
                    ? "bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-400 focus:bg-neutral-800/70"
                    : "bg-white/70 border-neutral-200 text-neutral-900 placeholder-neutral-500 focus:bg-white"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Contenido del historial */}
        <div className={`flex-1 overflow-y-auto p-3 ${isDark ? "bg-black/95" : "bg-white/95"}`}>
          <div className="space-y-2 pr-2">
            {filteredConversations.map((conversation) => (
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
                  onClick={() => {}} // loadConversation function to implement
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
                          {conversation.createdAt?.toLocaleDateString("es-ES", {
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
                        // deleteConversation function to implement
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
            {filteredConversations.length === 0 && conversations.length > 0 && (
              <div className={`text-center py-8 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                    isDark ? "bg-neutral-800/50" : "bg-neutral-200/50"
                  }`}
                >
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium mb-1">No se encontraron conversaciones</p>
                <p className="text-xs opacity-75">Intenta con otros términos de búsqueda</p>
              </div>
            )}
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
      <div className={`flex-1 flex flex-col relative min-w-0 h-full ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""} ${showAssistantPanel && !(isMobile || isTablet) ? "mr-80" : ""}`}>
        {/* Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-30 border-b p-3 md:p-4 backdrop-blur-md transition-all duration-300 ${
            isDark ? "bg-black/80 border-neutral-800/30" : "bg-white/80 border-neutral-200/30"
          } ${showHistory && !(isMobile || isTablet) ? "ml-72" : ""} ${showAssistantPanel && !(isMobile || isTablet) ? "mr-80" : ""}`}
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
                <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  Asistente Personal Estudiantil 💙
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {/* Indicador de funciones activas */}
              {(activeTimers.length > 0 || tasks.filter(t => !t.completed).length > 0) && (
                <div className="flex items-center space-x-1 mr-2">
                  {activeTimers.length > 0 && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isDark ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-700"
                    }`}>
                      <Timer className="h-3 w-3" />
                      <span>{activeTimers.length}</span>
                    </div>
                  )}
                  {tasks.filter(t => !t.completed).length > 0 && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isDark ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"
                    }`}>
                      <CheckCircle className="h-3 w-3" />
                      <span>{tasks.filter(t => !t.completed).length}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón del panel del asistente */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssistantPanel(!showAssistantPanel)}
                className={`p-2 transition-all duration-200 ${
                  showAssistantPanel
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : isDark 
                      ? "text-neutral-300 hover:text-white hover:bg-neutral-800" 
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  {!(isMobile || isTablet) && <span className="text-xs">ASISTENTE</span>}
                </div>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
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

        {/* Área de mensajes */}
        <div className={`flex-1 flex flex-col pt-20 ${isDark ? "bg-black" : "bg-neutral-50"} h-full overflow-hidden`}>
          <div 
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden ${isDark ? "bg-black" : "bg-neutral-50"}`}
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
                      ¡Hola! Soy Natal-<span className="text-[#C972FF]">IA</span> 💙
                    </h3>
                    <p className={`text-base md:text-lg mb-2 px-4 ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                      Tu asistente personal estudiantil - ¡Hincha de Millonarios FC!
                    </p>
                    <p className={`px-4 mb-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Puedo ayudarte con cronómetros, tareas, citas, correos y charlar de todo 😊
                    </p>
                    
                    {/* Ejemplos de comandos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInput("Ponme un cronómetro de 25 minutos para estudiar")}
                          className="h-auto p-3 flex items-center space-x-2 text-left"
                        >
                          <Timer className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Pomodoro de estudio</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInput("Añade tarea: Estudiar para el parcial")}
                          className="h-auto p-3 flex items-center space-x-2 text-left"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Tarea de estudio</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInput("¿Cómo va Millonarios este año?")}
                          className="h-auto p-3 flex items-center space-x-2 text-left"
                        >
                          <div className="h-4 w-4 rounded-full bg-blue-500" />
                          <span className="text-sm">Hablar de fútbol ⚽</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInput("Añade cita: Reunión de estudio mañana 3pm")}
                          className="h-auto p-3 flex items-center space-x-2 text-left"
                        >
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Agendar reunión</span>
                        </Button>
                    </div>
                  </div>
                )}

                {/* Lista de mensajes */}
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

                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>
          </div>

          {/* Área de input */}
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
                    placeholder="Escribe tu mensaje, comando o pregúntame algo..."
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
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="h-11 w-11 md:h-12 md:w-12 rounded-xl bg-[#C972FF] hover:bg-purple-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center p-0 active:scale-95 shrink-0"
                >
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}