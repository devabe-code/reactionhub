"use client"

import type * as React from "react"
import { Film, HistoryIcon, Home, Link, PlayCircle, RewindIcon, Settings2, Star, Tv2 } from "lucide-react"

import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { NavMain } from "./ui/nav-main"
import { ProfileSwitcher } from "./ui/profile-switcher"
import { Session } from "next-auth"
import { SearchBar } from "./SearchBar"
import { motion } from "framer-motion"

// Sample navigation data
const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    isActive: true,
    items: [],
  },
  {
    title: "Movies",
    url: "/movies",
    icon: Film,
    items: [
      {
        title: "Popular",
        url: "/movies/popular",
      },
      {
        title: "Top Rated",
        url: "/movies/top-rated",
      },
      {
        title: "Upcoming",
        url: "/movies/upcoming",
      },
    ],
  },
  {
    title: "TV Shows",
    url: "/tv",
    icon: Tv2,
    items: [
      {
        title: "Popular",
        url: "/tv/popular",
      },
      {
        title: "Top Rated",
        url: "/tv/top-rated",
      },
      {
        title: "On Air",
        url: "/tv/on-air",
      },
    ],
  },
  {
    title: "My List",
    url: "/my-list",
    icon: Star,
  },
  {
    title: "History",
    url: "/history",
    icon: HistoryIcon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2,
    items: [
      {
        title: "Account",
        url: "/settings/account",
      },
      {
        title: "Preferences",
        url: "/settings/preferences",
      },
      {
        title: "Notifications",
        url: "/settings/notifications",
      },
    ],
  },
]

export default function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  session?: Session
}) {
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col items-end md:items-center">
        <div className="block sm:hidden">
          <SearchBar />
        </div>
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        <ProfileSwitcher session={session!} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

