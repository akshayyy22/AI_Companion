"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Menu } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ModeToggle } from "@/themes/mode-toggle"
import { useRouter } from "next/navigation"
import Link from "next/link"
export function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <motion.div initial="hidden" animate="visible" className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-border/50" 
            : ""
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto py-4 md:py-6">
          <nav className="flex items-center justify-between">
            <motion.a href="/" className="flex items-center space-x-3 group">
              <div className="relative w-8 h-8 overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%201171274909-6qAc0l9yFtnmWK0yfTDOWwiPgp4bEd.png"
                  alt="Graphyn Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                  unoptimized
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
              <span className="font-mono text-xl font-medium">Eunoia</span>
            </motion.a>
            <motion.div
              className="hidden md:flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                className="rounded-full border-border bg-muted/50 backdrop-blur-sm text-sm px-6 py-2 h-auto hover:bg-muted transition-colors"
              >
                Beautiful thinking, beautiful living
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-border bg-muted/50 backdrop-blur-sm text-sm px-6 py-2 h-auto hover:bg-muted transition-colors"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
              <ModeToggle/>
            </motion.div>
            <motion.button
              className="md:hidden"
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </nav>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden bg-background/90 backdrop-blur-md border-t border-border/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container mx-auto py-4">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-muted/50 backdrop-blur-sm text-sm px-6 py-2 h-auto hover:bg-muted transition-colors"
                >
                  Beautiful thinking, beautiful living
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border bg-muted/50 backdrop-blur-sm text-sm px-6 py-2 h-auto hover:bg-muted transition-colors mt-2"
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        className="min-h-[80vh] flex flex-col items-center justify-center pt-16 px-4 md:px-0"
        variants={staggerChildren}
      >
        <div className="container mx-auto">
          <div className="max-w-[800px] mx-auto text-center space-y-6">
            <motion.h1
              className="text-3xl md:text-[56px] leading-tight md:leading-[1.1] font-medium tracking-[-0.02em]"
              variants={fadeIn}
            >
              Your AI companion for beautiful thinking
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-[600px] mx-auto"
              variants={fadeIn}
            >
              Eunoia offers personalized support, mood tracking, and therapeutic conversations to help you cultivate beautiful thinking and mental wellness with empathy and understanding.
            </motion.p>
            <motion.div className="pt-8" variants={fadeIn}>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-3 h-auto text-sm md:text-md transition-colors"
                onClick={() => {
                  const videoSection = document.getElementById("video-section")
                  videoSection?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Start Your Wellness Journey
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Video Demo Section */}
      <motion.section
        id="video-section"
        className="pt-4 -mt-16 md:-mt-24 px-4 md:px-0"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <div className="max-w-[1000px] mx-auto">
            {/* Browser Window Mockup */}
            <div className="rounded-xl overflow-hidden bg-card/50 shadow-2xl border border-border">
              {/* Browser Controls */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-muted/40 rounded-md py-1.5 px-3 text-xs text-muted-foreground max-w-[300px] flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground/60" />
                    eunoia.ai
                  </div>
                </div>
              </div>

              {/* Video/Content Area */}
              <div className="aspect-[16/9] relative">
                {isPlaying ? (
                  <iframe
                    src={`https://player.vimeo.com/video/1055784280?h=your_hash_here&autoplay=1&title=0&byline=0&portrait=0`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    onClick={() => setIsPlaying(true)}
                  >
                    <div className="absolute inset-0">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lQJe60OxxGongNvLeFeJWGT3Gz0Rra.png"
                        alt="Eunoia - Your AI companion for beautiful thinking"
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        size="lg"
                        className="relative z-10 size-16 md:size-20 rounded-full p-0 bg-background/20 hover:bg-background/30 transition-all duration-200 backdrop-blur-sm border border-border/50"
                      >
                        <Play className="size-6 md:size-8 text-foreground" />
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="py-8 mt-16 border-t border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto">
          <motion.div className="text-center text-sm text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <a
              href="#"
              className="inline-flex items-center gap-2 hover:text-foreground transition-colors relative group"
            >
              <span className="relative overflow-hidden">
              Built By <Link href="https://www.akshayesackimuthu.com/">Akshay Esackimuthu</Link>
               
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </span>
            </a>
          </motion.div>
        </div>
      </motion.footer>
    </motion.div>
  )
}
