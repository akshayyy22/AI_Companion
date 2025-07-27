import { create } from 'zustand'
import { personas, getDefaultPersona, type ExtendedPersona } from '@/config/personas'

type PersonaState = {
  selectedPersona: ExtendedPersona
  setSelectedPersona: (persona: ExtendedPersona) => void
  setSelectedPersonaById: (id: string) => void
  availablePersonas: ExtendedPersona[]
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  selectedPersona: getDefaultPersona(),
  availablePersonas: personas,
  setSelectedPersona: (persona) => set({ selectedPersona: persona }),
  setSelectedPersonaById: (id) => {
    const persona = personas.find(p => p.id === id)
    if (persona) {
      set({ selectedPersona: persona })
    }
  },
})) 