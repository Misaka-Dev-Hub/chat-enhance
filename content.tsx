import cssText from "data-text:./style.css"
import type { PlasmoCSConfig } from "plasmo"

import Sidebar from "./components/Sidebar"

export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function Content() {
  return <Sidebar />
}
