import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [copied, setCopied] = useState<string | null>(null)
  const [fadingOut, setFadingOut] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const fadeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

  const showCopied = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)

    setCopied(id)
    setFadingOut(null)

    timeoutRef.current = setTimeout(() => {
      setFadingOut(id)
      fadeTimeoutRef.current = setTimeout(() => {
        setFadingOut(null)
        setTimeout(() => {
          setCopied(null)
        }, 0)
      }, 200)
    }, 1800)
  }

  const copyLatest = async () => {
    await navigator.clipboard.writeText('最新のパスダウン')
    showCopied('latest')
  }

  const copyFromOtherWO = async () => {
    await navigator.clipboard.writeText('他のWOから最新のパスダウン')
    showCopied('other')
  }

  return (
    <div className="container">
      <div className="area-wrapper">
        <div className="area" onClick={copyLatest}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
          </svg>
          <span>最新のパスダウンをコピー</span>
        </div>
        {(copied === 'latest' || fadingOut === 'latest') && (
          <div className={`toast ${fadingOut === 'latest' ? 'fade-out' : ''}`}>
            コピーしました
          </div>
        )}
      </div>
      <div className="area-wrapper">
        <div className="area" onClick={copyFromOtherWO}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" />
          </svg>
          <span>他のWOから最新のパスダウンをコピー</span>
        </div>
        {(copied === 'other' || fadingOut === 'other') && (
          <div className={`toast ${fadingOut === 'other' ? 'fade-out' : ''}`}>
            コピーしました
          </div>
        )}
      </div>
    </div>
  )
}

export default App
