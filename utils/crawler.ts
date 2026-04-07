export interface Message {
  id: string
  text: string
  fullText: string
  element: HTMLElement
}

function getSelector(): string {
  const hostname = window.location.hostname
  if (
    hostname.includes("chatgpt.com") ||
    hostname.includes("openai.com")
  ) {
    return '[data-message-author-role="user"]'
  } else if (hostname.includes("gemini.google.com")) {
    return '.query-text, .user-query, [data-test-id="user-query"]'
  } else if (
    hostname.includes("x.com") ||
    hostname.includes("grok.x.ai") ||
    hostname.includes("grok.com")
  ) {
    // Grok uses `message-bubble` class.
    // We'll select ALL bubbles and filter in the loop for user-specific classes like `bg-surface-l1`.
    return ".message-bubble"
  }
  return ""
}

export function getMessages(): Message[] {
  const selector = getSelector()
  if (!selector) return []

  const elements = document.querySelectorAll(selector)
  const messages: Message[] = []
  const hostname = window.location.hostname

  Array.from(elements).forEach((element, index) => {
    let isValid = true
    let text = element.textContent?.trim() || ""

    if (hostname.includes("gemini.google.com")) {
      text = text.replace(/^You said\s*/i, "")
    } else if (
      hostname.includes("x.com") ||
      hostname.includes("grok.x.ai") ||
      hostname.includes("grok.com")
    ) {
      // Grok User Message Check:
      // Must contain `bg-surface-l1` (user bubble background)
      // Or `rounded-br-lg` (user bubble geometry)
      const isGrokUserMessage =
        element.classList.contains("bg-surface-l1") ||
        element.classList.contains("rounded-br-lg")

      if (!isGrokUserMessage) {
        isValid = false
      }
    }

    if (isValid && text) {
      messages.push({
        id: `msg-${index}`,
        text: text.length > 20 ? text.substring(0, 20) + "..." : text,
        fullText: text,
        element: element as HTMLElement
      })
    }
  })
  return messages
}

export function subscribeToMessages(callback: (messages: Message[]) => void) {
  let timeout: ReturnType<typeof setTimeout>

  const observer = new MutationObserver(() => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      const messages = getMessages()
      callback(messages)
    }, 500)
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  return () => observer.disconnect()
}
