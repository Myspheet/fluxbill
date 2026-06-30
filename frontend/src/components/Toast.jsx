import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, opts) => addToast(message, opts), [addToast])
  toast.success = (message, opts) => addToast(message, { type: 'success', ...opts })
  toast.error = (message, opts) => addToast(message, { type: 'error', duration: 6000, ...opts })
  toast.warning = (message, opts) => addToast(message, { type: 'warning', ...opts })
  toast.info = (message, opts) => addToast(message, { type: 'info', ...opts })

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}

const variants = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: CheckCircleIcon,
    iconColor: 'text-green-600',
    text: 'text-green-900',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: XCircleIcon,
    iconColor: 'text-red-600',
    text: 'text-red-900',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: WarningCircleIcon,
    iconColor: 'text-amber-600',
    text: 'text-amber-900',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: InfoCircleIcon,
    iconColor: 'text-blue-600',
    text: 'text-blue-900',
  },
}

function ToastItem({ toast, onDismiss }) {
  const v = variants[toast.type] || variants.info
  const Icon = v.icon
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-up ${v.bg}`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${v.iconColor}`} />
      <p className={`flex-1 text-sm font-medium ${v.text}`}>{toast.message}</p>
      <button onClick={onDismiss} className="shrink-0 p-0.5 rounded hover:bg-black/5">
        <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function XCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function WarningCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  )
}

function InfoCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )
}
