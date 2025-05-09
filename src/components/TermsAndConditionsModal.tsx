// components/TermsAndConditionsModal.tsx
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TermsAndConditionsModal({
  onAgree,
}: { onAgree: () => void }) {
  const [html, setHtml] = useState<string>('<p>Loading…</p>')
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/terms.html')
      .then(r => r.text())
      .then(setHtml)
      .catch(() => setHtml('<p>Failed to load.</p>'))
  }, [])

  const onScroll = () => {
    const el = ref.current!
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setScrolledToBottom(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-0 w-full max-w-2xl">
        <header className="bg-purple-600 text-white p-4 rounded-t-lg">
          <h2 className="text-lg">Terms of Service</h2>
        </header>
        <div
          ref={ref}
          onScroll={onScroll}
          className="p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <footer className="flex justify-end p-4 border-t">
          <button
            onClick={onAgree}
            disabled={!scrolledToBottom}
            className={`px-4 py-2 rounded-lg ${
              scrolledToBottom
                ? 'bg-purple-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            I Agree
          </button>
        </footer>
      </div>
    </div>
  )
}
