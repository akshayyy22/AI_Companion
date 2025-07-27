import { usePersonaStore } from "@/state/personaStore"
import { personas, type ExtendedPersona } from "@/config/personas"

export function usePersona() {
  const { selectedPersona, setSelectedPersona, setSelectedPersonaById, availablePersonas } = usePersonaStore()

  const getPersonaById = (id: string): ExtendedPersona | undefined => {
    return personas.find(persona => persona.id === id)
  }

  const getPersonasByCategory = (category: string): ExtendedPersona[] => {
    const categoryMap: Record<string, string[]> = {
      "support": ["bestfriend", "therapist", "coach"],
      "learning": ["mentor", "teacher", "scientist"],
      "creative": ["creative", "comedian"],
      "analytical": ["analyst", "philosopher"],
    }
    
    const categoryIds = categoryMap[category] || []
    return personas.filter(persona => categoryIds.includes(persona.id))
  }

  return {
    selectedPersona,
    setSelectedPersona,
    setSelectedPersonaById,
    availablePersonas,
    getPersonaById,
    getPersonasByCategory,
  }
}
