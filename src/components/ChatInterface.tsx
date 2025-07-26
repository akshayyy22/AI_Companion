"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Auto-resize textarea with better height calculation
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const maxHeight = isMobile ? 120 : 160
      const newHeight = Math.max(40, Math.min(scrollHeight, maxHeight))
      textarea.style.height = `${newHeight}px`
    }
  }, [inputValue, isMobile])

  useEffect(() => {
    if (textareaRef.current && !isTyping) {
      textareaRef.current.focus()
    }
  }, [isTyping])

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

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (inputValue.trim() === "" || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    const messageContent = inputValue.trim()
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${messageContent}"`,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTyping) {
      setInputValue(e.target.value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isTyping && e.key === "Enter" && e.metaKey) {
      e.preventDefault()
      handleSendMessage()
      return
    }

    if (!isTyping && !isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget ||
      (e.currentTarget === inputContainerRef.current && !(e.target as HTMLElement).closest("button"))
    ) {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleStop = () => {
    if (isTyping) {
      setIsTyping(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const hasTyped = inputValue.trim() !== ""

  return (
    <div
      ref={mainContainerRef}
      className="bg-gray-50 flex flex-col overflow-hidden relative font-poppins h-screen dark:bg-black"
      style={{
        height: isMobile ? `${viewportHeight}px` : "100vh",
        maxHeight: isMobile ? `${viewportHeight}px` : "100vh",
      }}
    >
      {/* Messages Area with proper padding for input */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-black" style={{ paddingBottom: isMobile ? "180px" : "160px" }}>
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                      message.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100",
                    )}
                  >
                    <p className="leading-relaxed text-sm">{message.content}</p>
                    <div className={cn("text-xs mt-2", message.sender === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400")}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {/* Extra spacing at bottom */}
              <div ref={messagesEndRef} className="h-8" />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Input Area */}
      <div className="fixed bottom-0 left-0 right-0  ">
        <div className={cn("safe-area-bottom", isMobile ? "p-4 pb-6" : "p-6")}>
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div
              ref={inputContainerRef}
              className={cn(
                "relative w-full rounded-3xl border-2 bg-white shadow-lg cursor-text transition-all duration-300 ease-out dark:bg-zinc-900 dark:border-zinc-700 dark:shadow-zinc-800",
                isTyping && "opacity-80 pointer-events-none",
                hasTyped
                  ? "border-blue-400 shadow-blue-100 shadow-xl ring-4 ring-blue-50 dark:shadow-blue-900"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-xl dark:hover:border-zinc-600",
              )}
              onClick={handleContainerClick}
            >
              {/* Elegant gradient border effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300",
                  hasTyped &&
                    "opacity-100 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 blur-sm -z-10",
                )}
              />

              <div className={cn("px-5 pt-4", isMobile ? "pb-14" : "pb-12")}>
                <Textarea
                  ref={textareaRef}
                  placeholder={isTyping ? "AI is thinking..." : "Type your message here..."}
                  className={cn(
                    "min-h-[40px] w-full border-0 bg-white dark:bg-zinc-900 text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none overflow-y-auto leading-relaxed p-0 font-medium dark:text-gray-100 dark:placeholder:text-gray-500",
                    isMobile ? "text-base max-h-[120px]" : "text-sm max-h-[160px]",
                    "placeholder:transition-colors placeholder:duration-200",
                    hasTyped && "placeholder:text-gray-300",
                  )}
                  
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  style={{
                    lineHeight: "1.5",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Enhanced button area */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between">
                  {/* Character count or status */}
                  <div className="text-xs text-gray-400 px-2 dark:text-gray-500">
                  {isTyping ? (
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        Thinking...
                      </span>
                    ) : (
                      inputValue.length > 0 && (
                        <span
                          className={cn(
                            "transition-colors duration-200",
                            inputValue.length > 500 ? "text-orange-500" : "text-gray-400",
                          )}
                        >
                          {inputValue.length}
                        </span>
                      )
                    )}
                  </div>

                  {/* Enhanced Send/Stop Button */}
                  {isTyping ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleStop}
                      className="h-9 w-9 p-0 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="sm"
                      className={cn(
                        "h-9 w-9 p-0 rounded-full transition-all duration-300 border-0 transform",
                        hasTyped
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl scale-105 hover:scale-110"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 shadow-sm hover:shadow-md dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-500 dark:hover:text-gray-400",
                      )}
                      disabled={!hasTyped}
                    >
                      <ArrowUp
                        className={cn("h-4 w-4 transition-transform duration-200", hasTyped && "transform rotate-0")}
                      />
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
