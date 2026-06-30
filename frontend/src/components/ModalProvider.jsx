import { createContext, useCallback, useContext, useState } from 'react'
import Modal, { ConfirmModal } from './Modal'

const ModalContext = createContext(null)

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([])

  const openModal = useCallback((component, props = {}) => {
    const id = Date.now() + Math.random()
    setModals((prev) => [...prev, { id, component, props }])
    return id
  }, [])

  const closeModal = useCallback((id) => {
    setModals((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const closeAll = useCallback(() => {
    setModals([])
  }, [])

  const confirm = useCallback(({ title, message, confirmLabel, cancelLabel, variant, onConfirm }) => {
    const id = Date.now() + Math.random()
    const modal = {
      id,
      component: ConfirmModal,
      props: {
        open: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        variant,
        onConfirm: () => {
          onConfirm?.()
          closeModal(id)
        },
        onClose: () => closeModal(id),
      },
    }
    setModals((prev) => [...prev, modal])
    return id
  }, [closeModal])

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAll, confirm }}>
      {children}
      {modals.map(({ id, component: Component, props }) => (
        <Component key={id} {...props} onClose={() => closeModal(id)} />
      ))}
    </ModalContext.Provider>
  )
}
