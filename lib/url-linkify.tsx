import React from 'react'

// URL regex pattern - matches http/https URLs
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi

export function linkifyText(text: string): React.ReactElement {
  if (!text) return <span></span>

  const parts = text.split(URL_REGEX)
  
  return (
    <span>
      {parts.map((part, index) => {
        if (URL_REGEX.test(part)) {
          // Reset regex lastIndex for next test
          URL_REGEX.lastIndex = 0
          
          try {
            const url = new URL(part)
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
                title={part}
              >
                {url.hostname}
                {url.pathname !== '/' && url.pathname.length > 20 
                  ? url.pathname.substring(0, 20) + '...' 
                  : url.pathname}
              </a>
            )
          } catch {
            // If URL is malformed, just show as text
            return <span key={index} className="break-all">{part}</span>
          }
        }
        
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

// For use in components that need compact text rendering
export function renderContentWithLinks(content: string): React.ReactElement {
  return (
    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
      {linkifyText(content)}
    </div>
  )
}