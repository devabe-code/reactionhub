"use client"

import type * as React from "react"
import { Film, HistoryIcon, Settings2, Star, Tv2 } from "lucide-react"

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenuButton, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { ProfileSwitcher } from "./ui/profile-switcher"
import { Session } from "next-auth"
import { SearchBar } from "./SearchBar"
import { FaUserNinja } from "react-icons/fa6"
import Link from "next/link"

// Sample navigation data
const navItems = [
  {
    title: "Anime",
    url: "/anime",
    icon: FaUserNinja,
  },
  {
    title: "Movies",
    url: "/movies",
    icon: Film
  },
  {
    title: "TV Shows",
    url: "/tv-shows",
    icon: Tv2
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
        {/* Main Navigation */}
        {navItems.map((item) => (
          <div key={item.title} className="ml-2">
              <Link href={item.url}>
                <SidebarMenuButton tooltip={item.title} className="hover:cursor-pointer">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
          </div>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

