import { useAuthStore } from '@/state/useAuthStore'
import { redirect } from 'next/navigation'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { session } = useAuthStore()

  if (!session) redirect('/auth/login')

  return <>{children}</>
}
