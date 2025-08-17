"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card } from "../components/ui/card"
import { ScrollArea } from "../components/ui/scroll-area"
import { Mic, MicOff, Send, Play, Pause, Volume2, History, Trash2, Sun, Moon } from "lucide-react"

// Círculo elegante SIEMPRE morado (marca de Natal-IA)
function ElegantCircle({ size = "w-20 h-20" }) {
  // Siempre colores purple/pink/blue - la marca de Natal-IA
  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Resplandor exterior masivo - extendido */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/50 via-pink-500/50 via-orange-400/30 to-blue-600/50 blur-3xl scale-[4] animate-pulse opacity-70"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 via-pink-400/40 to-blue-500/30 blur-2xl scale-[3.5] animate-pulse" style={{animationDelay: '0.5s'}}></div>
      
      {/* Borde exterior brillante */}
      <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-purple-400 via-pink-300 via-orange-300 to-blue-400 animate-spin-slow shadow-2xl">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-purple-950/50 to-gray-900"></div>
      </div>
      
      {/* Círculo intermedio con gradiente sutil */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30"></div>
      
      {/* Efectos de luz brillante en el borde */}
      <div className="absolute inset-0 rounded-full">
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-90 animate-pulse"></div>
        <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-1/4 -right-1 w-3 h-3 bg-purple-300 rounded-full blur-sm opacity-80 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute bottom-1/3 -left-1 w-2 h-2 bg-blue-400 rounded-full blur-sm opacity-70 animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full blur-sm opacity-60 animate-pulse" style={{animationDelay: '1.2s'}}></div>
      </div>
      
      {/* Centro brillante */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-white/10 blur-sm animate-pulse"></div>
        <div className="absolute w-3 h-3 rounded-full bg-white/90 shadow-lg"></div>
        <div className="absolute w-2 h-2 rounded-full bg-white shadow-sm"></div>
      </div>
      
      {/* Resplandor interior suave */}
      <div className="absolute inset-6 rounded-full bg-gradient-radial from-purple-400/20 via-pink-400/10 to-transparent animate-pulse opacity-60" style={{animationDelay: '0.4s'}}></div>
      
      {/* Efecto de rotación de luz */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-spin-slow opacity-40"></div>
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

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

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
    if (messages.length > 0) {
      const newConversation = {
        id: Date.now().toString(),
        title: messages[0]?.content.slice(0, 50) + "..." || "Nueva conversación",
        messages: [...messages],
        createdAt: new Date(),
      }
      setConversations((prev) => [newConversation, ...prev])
    }
    setMessages([])
    setCurrentConversationId(null)
  }

  const loadConversation = (conversation) => {
    setMessages(conversation.messages)
    setCurrentConversationId(conversation.id)
    setShowHistory(false)
  }

  const deleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const isDark = theme === "dark"

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar - History */}
      <div
        className={`transition-all duration-300 border-r backdrop-blur-sm ${
          isDark ? 'bg-black/40 border-gray-800/30' : 'bg-white/40 border-gray-200/30'
        } ${showHistory ? "w-80" : "w-0 overflow-hidden"}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Historial</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              Nueva
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="group">
                  <Card
                    className={`p-3 cursor-pointer transition-colors ${
                      isDark 
                        ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700' 
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    }`}
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conversation.title}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {conversation.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conversation.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className={`border-b p-4 relative ${isDark ? 'bg-black/20 border-gray-800/20' : 'bg-white/20 border-gray-200/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ElegantCircle size="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold">
                  Natal-<span className="text-blue-600">IA</span>
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tu asistente premium inteligente
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={`${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <History className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 pb-4 relative overflow-visible">
          {/* Resplandor que se extiende hacia arriba atravesando el header */}
          {messages.length === 0 && (
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-blue-600/30 blur-3xl opacity-50 pointer-events-none z-50"></div>
          )}
          
          <div className="max-w-4xl mx-auto space-y-4 relative pt-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                  <ElegantCircle size="w-32 h-32" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  ¡Hola! Soy Natal-<span className="text-blue-600">IA</span>
                </h3>
                <p className={`text-lg mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Diseñado para escucharte y responder a todas tus consultas
                </p>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Mi función principal es escucharte - habla conmigo o escribe tu mensaje
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                {!message.isUser && (
                  <div className="mr-3 mt-1">
                    <ElegantCircle size="w-8 h-8" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.isUser
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-12"
                      : isDark
                        ? "bg-gray-800 text-gray-100 mr-12 border border-gray-700"
                        : "bg-white text-gray-900 mr-12 border border-gray-200 shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs ${
                      message.isUser 
                        ? "text-purple-100" 
                        : isDark ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.hasAudio && !message.isUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(message.id)}
                        className="h-7 w-7 p-0 ml-2"
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
                <div className={`rounded-2xl p-4 mr-12 ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
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
          <div className={`px-4 py-3 border-y ${
            isDark ? 'bg-black border-gray-800' : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <ElegantCircle size="w-10 h-10" />
                <div className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mr-4">
                  Escuchando...
                </div>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-pulse"
                    style={{ 
                      height: `${16 + Math.random() * 8}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`p-4 border-t ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pregunta lo que quieras"
                  className={`min-h-[48px] rounded-xl border-2 ${
                    isDark 
                      ? 'bg-purple-900/20 border-purple-700/50 text-white placeholder-purple-300 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-200 focus:border-purple-500'
                  }`}
                />
              </div>
              <Button
                variant={isListening ? "default" : "outline"}
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={`h-12 w-12 p-0 rounded-xl transition-all duration-200 ${
                  isListening
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    : isDark
                      ? "border-purple-700 text-purple-300 hover:bg-purple-900/30 hover:text-purple-200"
                      : "border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="h-12 w-12 p-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-200"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  )
}