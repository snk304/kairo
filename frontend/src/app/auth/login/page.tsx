'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLogin } from '@/hooks/useAuth'

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

type FormData = z.infer<typeof schema>

interface ValidationErrors {
  errors?: Record<string, string[]>
  message?: string
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? undefined
  const login = useLogin(redirect)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    login.mutate(data, {
      onError: (err) => {
        const axiosError = err as AxiosError<ValidationErrors>
        if (axiosError.response?.status === 422) {
          const fieldErrors = axiosError.response.data?.errors ?? {}
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof FormData, { message: messages[0] })
          })
        }
      },
    })
  }

  const isCredentialError =
    login.isError &&
    ((login.error as AxiosError)?.response?.status === 401 ||
      (login.error as AxiosError)?.response?.status === 422)

  const isGenericError =
    login.isError &&
    (login.error as AxiosError)?.response?.status !== 401 &&
    (login.error as AxiosError)?.response?.status !== 422

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
          <p className="mt-2 text-sm text-gray-500">
            アカウントをお持ちでない方は
            <Link href="/auth/register/jobseeker" className="text-blue-600 hover:text-blue-800 ml-1">
              新規登録
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
            <Input
              label="メールアドレス"
              type="email"
              autoComplete="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="パスワード"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-800">
                パスワードを忘れた方
              </Link>
            </div>

            {isCredentialError && (
              <p role="alert" className="text-sm text-red-600 text-center">
                メールアドレスまたはパスワードが正しくありません
              </p>
            )}
            {isGenericError && (
              <p role="alert" className="text-sm text-red-600 text-center">
                エラーが発生しました。もう一度お試しください。
              </p>
            )}

            <Button type="submit" isLoading={login.isPending} className="w-full">
              {login.isPending ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
