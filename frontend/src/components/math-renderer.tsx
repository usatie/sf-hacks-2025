"use client"

import { useEffect, useRef } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathRendererProps {
  math: string
  display?: boolean
}

export default function MathRenderer({ math, display = false }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          throwOnError: false,
          displayMode: display,
          trust: true,
          strict: false,
        })
      } catch (error) {
        console.error("KaTeX rendering error:", error)
        containerRef.current.textContent = math
      }
    }
  }, [math, display])

  return <div ref={containerRef} className={display ? "katex-display" : ""} />
}

