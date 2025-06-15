'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Toast } from '@/components/ui/toast'

export interface ToastMessage {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastContextType {
  toasts: ToastMessage[]
  toast: (message: Omit<ToastMessage, 'id'>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...message,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, newToast.duration)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  const value: ToastContextType = {
    toasts,
    toast,
    dismiss,
    dismissAll,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 space-y-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(toast.id)
              }
            }}
          >
            {toast.title && (
              <div className="font-semibold">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { toast } = useToast()
  
  return useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Berhasil!',
      description: message,
      variant: 'default',
    })
  }, [toast])
}

export function useErrorToast() {
  const { toast } = useToast()
  
  return useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Terjadi Kesalahan',
      description: message,
      variant: 'destructive',
    })
  }, [toast])
}

export function useInfoToast() {
  const { toast } = useToast()
  
  return useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Informasi',
      description: message,
      variant: 'default',
    })
  }, [toast])
}