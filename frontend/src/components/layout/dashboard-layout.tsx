"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link href="/dashboard/assignments" className="flex items-center gap-2">
            <span className="text-xl font-bold ml-2">GradeAssist</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  )
}

