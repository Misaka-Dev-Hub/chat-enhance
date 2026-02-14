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
    return '[data-testid="messageEntry"], [data-testid="tweetText"]'
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
    let text = element.textContent?.trim() || ""

    if (hostname.includes("gemini.google.com")) {
      // Remove "You said " prefix if present
      text = text.replace(/^You said\s*/i, "")
    }

    if (text) {
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
