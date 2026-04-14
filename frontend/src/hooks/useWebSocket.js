import { useState, useEffect, useRef, useCallback } from 'react'

export function useWebSocket() {
  const [stats, setStats] = useState(null)
  const [mxStats, setMxStats] = useState(null)
  const [scAccountsStats, setScAccountsStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const retryRef = useRef(null)

  const connect = useCallback(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.hostname || '127.0.0.1'
    const wsUrl = `${proto}://${host}:8899/ws`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => setConnected(true)
      ws.onmessage = (e) => {
        try { 
          const data = JSON.parse(e.data)
          if (data.type === 'state') {
            setStats(data.stats)
            if (data.mx_stats) setMxStats(data.mx_stats)
            if (data.sc_accounts_stats) setScAccountsStats(data.sc_accounts_stats)
            setLogs(data.logs || [])
          } else {
            setStats(data)
          }
        } catch {}
      }
      ws.onclose = () => {
        setConnected(false)
        retryRef.current = setTimeout(connect, 2000)
      }
      ws.onerror = () => ws.close()
    } catch {
      retryRef.current = setTimeout(connect, 2000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const sendCommand = useCallback((cmd) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd))
    }
  }, [])

  return { stats, mxStats, scAccountsStats, connected, logs, sendCommand }
}
