export interface Message {
  id: string
  text: string
  fullText: string
  element: HTMLElement
}

export function getMessages(): Message[] {
  const elements = document.querySelectorAll('[data-message-author-role="user"]')
  return Array.from(elements).map((element, index) => {
    const text = element.textContent?.trim() || ""
    return {
      id: `msg-${index}`,
      text: text.length > 20 ? text.substring(0, 20) + "..." : text,
      fullText: text,
      element: element as HTMLElement
    }
  })
}

export function subscribeToMessages(callback: (messages: Message[]) => void) {
  let timeout: ReturnType<typeof setTimeout>

  const observer = new MutationObserver(() => {
    clearTimeout(timeout)
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
