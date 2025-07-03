'use client'

import Image from 'next/image'
import { LoginForm } from '@/components/admin-panel/login-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { login } from '@/hooks/auth'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username')?.toString()
    const password = formData.get('password')?.toString()

    if (!username || !password) {
      setError('Заполните все поля')
      setLoading(false)
      return
    }

    try {
      await login(username, password)
      router.replace('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* левая половина с картинкой */}
      <div className="bg-muted relative block rounded-3xl">
        <Image
          src="/left.svg"
          alt="Фон"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale rounded-3xl"
        />
      </div>

      {/* правая половина с формой */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            {error && (
              <div className="mb-2 text-red-600 font-medium">
                {error}
              </div>
            )}
            <LoginForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
