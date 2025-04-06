"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Plus, CheckSquare } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const routes = [
    {
      href: "/dashboard/assignments",
      label: "Assignments",
      icon: <FileText className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/assignments",
    },
    {
      href: "/dashboard/assignments/new",
      label: "Create Assignment",
      icon: <Plus className="h-4 w-4 mr-2" />,
      active: pathname === "/dashboard/assignments/new",
    },
    {
      href: "/dashboard/assignments/123/grade",
      label: "Grade Assignment",
      icon: <CheckSquare className="h-4 w-4 mr-2" />,
      active: pathname.includes("/grade"),
    },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      {routes.map((route) => (
        <Button key={route.href} asChild variant={route.active ? "default" : "ghost"} className="h-9">
          <Link
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors flex items-center",
              route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
            )}
          >
            {route.icon}
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

