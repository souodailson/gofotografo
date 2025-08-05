import { useState, useEffect } from "react"

const TOAST_LIMIT = 1
const IS_MOBILE_THRESHOLD = 768; 

let count = 0
function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastStore = {
  state: {
    toasts: [],
    isMobileView: typeof window !== 'undefined' ? window.innerWidth < IS_MOBILE_THRESHOLD : false,
  },
  listeners: [],
  
  getState: () => toastStore.state,
  
  setState: (nextState) => {
    if (typeof nextState === 'function') {
      toastStore.state = nextState(toastStore.state)
    } else {
      toastStore.state = { ...toastStore.state, ...nextState }
    }
    
    toastStore.listeners.forEach(listener => listener(toastStore.state))
  },
  
  subscribe: (listener) => {
    toastStore.listeners.push(listener)
    return () => {
      toastStore.listeners = toastStore.listeners.filter(l => l !== listener)
    }
  },

  updateMobileView: () => {
    if (typeof window !== 'undefined') {
      const newIsMobileView = window.innerWidth < IS_MOBILE_THRESHOLD;
      if (newIsMobileView !== toastStore.state.isMobileView) {
        toastStore.setState(state => ({ ...state, isMobileView: newIsMobileView }));
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', toastStore.updateMobileView);
  toastStore.updateMobileView(); 
}


export const toast = ({ ...props }) => {
  const { isMobileView } = toastStore.getState();

  const nonEssentialToasts = [
    "Saldos Visíveis", 
    "Saldos Ocultos",
    "Modo de Personalização Ativado",
    "Card Adicionado",
    "Card Removido",
    "Projeto movido",
    "Projeto Excluído",
    "Projeto Arquivado",
    "Projeto Restaurado",
    "Coluna Adicionada",
    "Coluna Removida",
  ];

  if (props.title && nonEssentialToasts.includes(props.title)) {
    return { id: null, dismiss: () => {}, update: () => {} };
  }

  const id = generateId()

  const update = (props) =>
    toastStore.setState((state) => ({
      ...state,
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, ...props } : t
      ),
    }))

  const dismiss = () => toastStore.setState((state) => ({
    ...state,
    toasts: state.toasts.filter((t) => t.id !== id),
  }))

  toastStore.setState((state) => ({
    ...state,
    toasts: [
      { ...props, id, dismiss },
      ...state.toasts,
    ].slice(0, TOAST_LIMIT),
  }))

  return {
    id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = useState(toastStore.getState())
  
  useEffect(() => {
    const unsubscribe = toastStore.subscribe((state) => {
      setState(state)
    })
    
    return unsubscribe
  }, [])
  
  useEffect(() => {
    const timeouts = []

    state.toasts.forEach((toastInstance) => {
      if (toastInstance.duration === Infinity) {
        return
      }

      const timeout = setTimeout(() => {
        toastInstance.dismiss()
      }, toastInstance.duration || 5000)

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [state.toasts])

  return {
    toast,
    toasts: state.toasts,
    isMobileView: state.isMobileView,
  }
}