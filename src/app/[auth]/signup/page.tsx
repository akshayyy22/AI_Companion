// /app/(auth)/signup/page.tsx
import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <AuthForm type="signup" />
    </div>
  )
}
