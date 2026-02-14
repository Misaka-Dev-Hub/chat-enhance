import { useEffect, useRef, useState } from "react"
import {
  getMessages,
  subscribeToMessages,
  type Message
} from "../utils/crawler"

export default function Sidebar() {
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null)
  const [tooltipTop, setTooltipTop] = useState<number>(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const isVisible = isPinned || isHovered

  useEffect(() => {
    setMessages(getMessages())

    const unsubscribe = subscribeToMessages((newMessages) => {
      setMessages(newMessages)
    })

    const checkDarkMode = () => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDarkMode(isDark)
    }

    checkDarkMode()

    const themeObserver = new MutationObserver(checkDarkMode)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleMediaChange = () => checkDarkMode()
    mediaQuery.addEventListener("change", handleMediaChange)

    return () => {
      unsubscribe()
      themeObserver.disconnect()
      mediaQuery.removeEventListener("change", handleMediaChange)
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current)
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const handleScrollTo = (element: HTMLElement) => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
  }

  const handleMouseEnterItem = (id: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const relativeTop = rect.top - containerRect.top
      setTooltipTop(relativeTop)
    }

    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
    }
    tooltipTimerRef.current = setTimeout(() => {
      setHoveredMessageId(id)
      tooltipTimerRef.current = null
    }, 600)
  }

  const handleMouseLeaveItem = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
      tooltipTimerRef.current = null
    }
    setHoveredMessageId(null)
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 200)
  }

  const hoveredMessage = messages.find((m) => m.id === hoveredMessageId)

  return (
    <>
      <div
        className={`sidebar-trigger ${isDarkMode ? "dark" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsPinned(!isPinned)}
        title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}>
        {isPinned ? "✕" : "≣"}
      </div>
      <div
        ref={containerRef}
        className={`sidebar-panel ${isVisible ? "visible" : ""} ${isDarkMode ? "dark" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        <div className="sidebar-content">
          <h3>Contents</h3>
          <ul className="sidebar-list">
            {messages.length === 0 ? (
              <li className="empty-state">No messages yet</li>
            ) : (
              messages.map((msg, index) => (
                <li
                  key={msg.id}
                  className="sidebar-item"
                  onClick={() => handleScrollTo(msg.element)}
                  onMouseEnter={(e) => handleMouseEnterItem(msg.id, e)}
                  onMouseLeave={handleMouseLeaveItem}>
                  <span className="msg-index">{index + 1}. </span>
                  {msg.text}
                </li>
              ))
            )}
          </ul>
        </div>
        {hoveredMessage && (
          <div className="sidebar-tooltip" style={{ top: tooltipTop }}>
            {hoveredMessage.fullText}
          </div>
        )}
      </div>
    </>
  )
}
