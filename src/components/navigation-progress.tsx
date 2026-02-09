"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const prevPath = useRef(pathname)

  useEffect(() => {
    // When pathname changes, complete the progress bar
    if (prevPath.current !== pathname) {
      setProgress(100)
      const timeout = setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200)
      prevPath.current = pathname
      if (timerRef.current) clearInterval(timerRef.current)
      return () => clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Intercept link clicks to start the progress bar
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.target === "_blank") return
      if (href === pathname) return

      setVisible(true)
      setProgress(20)

      // Gradually increase progress
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (timerRef.current) clearInterval(timerRef.current)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 300)
    }

    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [pathname])

  if (!visible && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
          transition: progress >= 100
            ? "width 200ms ease-out, opacity 400ms ease-out 100ms"
            : "width 200ms ease-out",
        }}
      />
    </div>
  )
}
