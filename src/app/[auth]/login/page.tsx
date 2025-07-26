// /app/(auth)/login/page.tsx
import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <AuthForm type="login" />
    </div>
  )
}
