"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Bell, Menu, Sidebar, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "./ui/sidebar"
import { SearchBar } from "./SearchBar"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track scroll position to apply blur effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 md:left-10 right-0 z-50 md:z-60 flex h-16 shrink-0 items-center gap-2 transition-[width, height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 duration-300 ease-in-out",
        scrolled ? "bg-black/70 backdrop-blur-lg" : "bg-black/70",
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-row items-center">
          <Link href="/" className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-8 w-28"
            >
              <div className="absolute inset-0 flex items-center">
                <span className="text-purple-400 text-center flex items-center font-bold text-xl">
                    ReactionHUB
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-8 hidden md:flex space-x-6">
            <Link href="/" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
              One Piece
            </Link>
            <Link href="/series" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Naruto
            </Link>
            <Link href="/movies" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Attack on Titan
            </Link>
            <Link href="/new" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Death Note
            </Link>
            <Link href="/mylist" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              My List
            </Link>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <SearchBar />
          </div>
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" className="flex text-white">
              <Bell size={20} />
              <span className="sr-only">Notifications</span>
            </Button>
          </motion.div>

          <div className="md:hidden block">
              <SidebarTrigger />
            </div>
        </div>
      </div>
      
    </header>
  )
}

