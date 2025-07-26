// hooks/useAuth.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/state/useAuthStore'

export function useAuth() {
  const { session, setSession, setLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session ?? null)
      setLoading(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    getSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession , setLoading])

  const login = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) router.push('/chat')
    return error
  }

  const signup = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (!error) router.push('/chat')
    return error
  }

  const signInWithProvider = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    router.push('/auth/login')
  }

  return { session, login, signup, logout , signInWithProvider}
}
