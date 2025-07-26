'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'

export default function AuthForm({ type }: { type: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, signup, signInWithProvider } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const fn = type === 'login' ? login : signup
    const err = await fn(email, password)
    if (err) setError(err.message)
  }

  const isLogin = type === 'login'

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Login to continue' : 'Sign up to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mb-4">
            <Button
              type="button"
              className="w-full flex items-center gap-2"
              variant="outline"
              onClick={() => signInWithProvider('google')}
            >
              <Image src="/Icon/google-logo.svg" alt="Google logo" width={18} height={18} />
              Continue with Google
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <Button type="submit" className="w-full">
                {isLogin ? 'Login' : 'Sign Up'}
              </Button>
              <div className="text-center text-sm">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link href="/login" className="underline underline-offset-4">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4">
        By continuing, you agree to our{' '}
        <Link href="#">Terms</Link> and <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  )
}
