'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck } from 'lucide-react'

interface Notification {
  _id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  booking_confirmed: '✅',
  booking_cancelled: '❌',
  booking_rescheduled: '🔄',
  refund_issued: '💰',
  session_reminder: '⏰',
  kundali_uploaded: '📜',
}

function timeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnread(data.unreadCount ?? 0)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 30000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
    setUnread((u) => Math.max(0, u - 1))
  }

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnread(0)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full transition-colors hover:bg-white/5"
        aria-label="Notifications"
        style={{ color: 'var(--text-muted)' }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden z-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(201,168,76,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-cinzel)' }}>
              Notifications
            </p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                style={{ color: 'var(--gold)' }}
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markRead(n._id)}
                  className="w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-white/5"
                  style={{
                    borderBottom: '1px solid rgba(201,168,76,0.06)',
                    background: n.isRead ? 'transparent' : 'rgba(201,168,76,0.04)',
                  }}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed" style={{ color: n.isRead ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {n.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--gold)' }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
