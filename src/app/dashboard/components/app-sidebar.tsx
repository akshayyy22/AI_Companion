"use client"

import type * as React from "react"
import { BookOpen, Bot, Command, LifeBuoy, Send, BarChart3, MemoryStick, MessageSquare,PhoneCall, Notebook } from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/state/useAuthStore"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Persona",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "BestFriend",
          url: "#",
        },
        {
          title: "Friend",
          url: "#",
        },
        {
          title: "Mentor",
          url: "#",
        },
        {
          title: "psychiatrist",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Journal",
      url: "#",
      icon: Notebook,
    },
    {
      name: "Mood",
      url: "#",
      icon: MessageSquare,
    },
    {
      name: "Memories",
      url: "#",
      icon: MemoryStick,
    },
    {
      name: "Analytics",
      url: "#",
      icon: BarChart3,
    },
    {
      name: "Conversation",
      url: "/agent",
      icon: PhoneCall,
    },
    
  ],
}



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {session} = useAuthStore()
const {logout} = useAuth();
const fullName = session?.user?.user_metadata?.full_name;
const email = session?.user?.email;
const avatar = "/avatars/shadcn.jpg"; // Keep avatar as before or update if you have avatar in session

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MindCareBot Inc</span>
                  <span className="truncate text-xs">akshay Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: fullName || "",
          email: email || "",
          avatar: avatar
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}
