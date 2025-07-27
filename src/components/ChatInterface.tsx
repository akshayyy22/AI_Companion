"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePersona } from "@/hooks/usePersona"
import { useAuthStore } from "@/state/useAuthStore"

type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [useStreaming, setUseStreaming] = useState(true) // Enable streaming by default

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)

  const mainContainerRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  // selectedPersona.system_prompt ||
  const { selectedPersona } = usePersona()

  const {session} = useAuthStore()
  const fullName = session?.user?.user_metadata?.full_name;

  // Initial greeting and update when persona changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content: `Hi ${fullName}! Did You Forget That I'm Your ${selectedPersona.name}?`,
        sender: "assistant",
        timestamp: new Date(),
      },
    ])
  }, [selectedPersona , fullName])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
        if (scrollElement) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth"
          })
        }
      }
    }, 50)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, isStreaming])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const maxHeight = isMobile ? 120 : 160
      const newHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [inputValue, isMobile])

  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      const vh = window.visualViewport?.height || window.innerHeight
      setViewportHeight(vh)
      if (isMobileDevice && mainContainerRef.current) {
        mainContainerRef.current.style.height = `${vh}px`
      }
    }

    checkMobileAndViewport()
    window.addEventListener("resize", checkMobileAndViewport)
    window.visualViewport?.addEventListener("resize", checkMobileAndViewport)

    return () => {
      window.removeEventListener("resize", checkMobileAndViewport)
      window.visualViewport?.removeEventListener("resize", checkMobileAndViewport)
    }
  }, [])

  const handleStreamingResponse = async (userMessage: Message) => {
    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          persona: selectedPersona,
        }),
        signal: abortControllerRef.current?.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }
              
              if (data.chunk) {
                assistantMessage.content += data.chunk
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                )
                // Smooth scroll during streaming
                setTimeout(() => {
                  if (scrollAreaRef.current) {
                    const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
                    if (scrollElement) {
                      scrollElement.scrollTo({
                        top: scrollElement.scrollHeight,
                        behavior: "smooth"
                      })
                    }
                  }
                }, 10)
              }
              
              if (data.done) {
                return
              }
            } catch (parseError) {
              console.error("Error parsing stream data:", parseError)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Stream aborted")
        return
      }
      throw error
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isTyping || isStreaming) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setIsStreaming(false)

    // Create abort controller for streaming
    abortControllerRef.current = new AbortController()

    try {
      if (useStreaming) {
        setIsStreaming(true)
        await handleStreamingResponse(userMessage)
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            persona: selectedPersona,
            conversationHistory: messages.map(({ content, sender }) => ({
              role: sender === "user" ? "user" : "assistant",
              content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to get response");
        }

        const data = await res.json()

        const assistantMessage: Message = {
          id: `${Date.now()}-assistant`,
          content: data.reply || "Something went wrong.",
          sender: "assistant",
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          content: err instanceof Error ? err.message : "Sorry, I couldn't respond. Please try again.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTyping && !isStreaming) setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isTyping && !isStreaming && e.key === "Enter" && (e.metaKey || (!isMobile && !e.shiftKey))) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStop = () => {
    setIsTyping(false)
    setIsStreaming(false)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div
      ref={mainContainerRef}
      className=" flex flex-col overflow-hidden relative font-poppins h-screen dark:bg-black"
      style={{
        height: isMobile ? `${viewportHeight}px` : "100vh",
        maxHeight: isMobile ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* Chat messages */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: isMobile ? "180px" : "160px" }}>
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100",
                    )}
                  >
                    <p className="leading-relaxed text-sm">{msg.content}</p>
                    <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))}
              {(isTyping || isStreaming) && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="h-8" />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Input field */}
      <div className="fixed bottom-0 left-0 right-0 ">
        <div className={cn("safe-area-bottom", isMobile ? "p-4 pb-6" : "p-6")}>
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div
              ref={inputContainerRef}
              className={cn(
                "relative w-full rounded-3xl border-2 bg-white shadow-lg transition-all dark:bg-zinc-900 dark:border-zinc-700",
                (isTyping || isStreaming) && "opacity-80 pointer-events-none",
              )}
            >
              <div className="px-5 pt-4 pb-12">
                <Textarea
                  ref={textareaRef}
                  placeholder={(isTyping || isStreaming) ? "Thinking..." : "Type your message..."}
                  className={cn(
                    "min-h-[40px] w-full border-0 bg-white dark:bg-zinc-900 text-gray-900 placeholder:text-gray-400 focus:ring-0 resize-none p-0 font-medium dark:text-gray-100",
                    isMobile ? "text-base max-h-[120px]" : "text-sm max-h-[160px]",
                  )}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping || isStreaming}
                />
              </div>

              {/* Send or Stop */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {(isTyping || isStreaming) ? "Thinking..." : inputValue.length > 0 ? `${inputValue.length}` : ""}
                  </div>
                  {(isTyping || isStreaming) ? (
                    <Button type="button" size="sm" onClick={handleStop} className="h-9 w-9 p-0 rounded-full bg-red-600 text-white">
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputValue.trim()}
                      className={cn(
                        "h-9 w-9 p-0 rounded-full",
                        inputValue ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400",
                      )}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
