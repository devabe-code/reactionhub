"use client"
import Link from "next/link"
import Image from "next/image"
import { ChevronsUpDown, LogOut, User, UserPlus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Session } from "next-auth"
import { Button } from "./button"
import { signIn, signOut } from "next-auth/react"

export function ProfileSwitcher({
  session,
}: {
  session: Session
}) {
  const { isMobile } = useSidebar()

  // If no session, show sign in button
  if (!session) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="w-full">
            <SidebarMenuButton size="lg" className="w-full hover:cursor-pointer" onClick={() => signIn()}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="size-4" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="font-semibold">Sign In</span>
                <UserPlus className="size-4 opacity-70" />
              </div>
            </SidebarMenuButton>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // With session, show user profile
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                {session.user?.image ? (
                  <Image
                    src={session?.user?.image || "/placeholder.svg"}
                    alt={session?.user?.name || "Profile"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <User className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{session?.user?.name || "User"}</span>
                <span className="truncate text-xs opacity-70">{session?.user?.email || ""}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <User className="size-4 shrink-0" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm">{session?.user?.name || "User"}</span>
                <span className="text-xs text-muted-foreground">{session.user?.email || ""}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2 p-2 text-destructive focus:text-destructive">
                <Button variant="destructive" onClick={() => {signOut()}} className="flex w-full items-center gap-2">
                  <LogOut className="size-4 shrink-0" />
                  <span className="text-white">Sign out</span>
                </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

