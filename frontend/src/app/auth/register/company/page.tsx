'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api/auth'

const schema = z
  .object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    password_confirmation: z.string().min(1, 'パスワード（確認）を入力してください'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'パスワードが一致しません',
    path: ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

interface ValidationErrors {
  errors?: Record<string, string[]>
  message?: string
}

export default function RegisterCompanyPage() {
  const router = useRouter()
  const register_ = useMutation({
    mutationFn: (data: FormData) => authApi.registerCompany(data),
    onSuccess: () => router.push('/auth/login?registered=1'),
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    register_.mutate(data, {
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

  const isGenericError =
    register_.isError &&
    (register_.error as AxiosError)?.response?.status !== 422

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">企業として登録</h1>
          <p className="mt-2 text-sm text-gray-500">
            求職者として登録する場合は
            <Link href="/auth/register/jobseeker" className="text-blue-600 hover:text-blue-800 ml-1">
              こちら
            </Link>
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 flex flex-col gap-4"
            noValidate
          >
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
              autoComplete="new-password"
              {...register('password')}
              error={errors.password?.message}
            />
            <Input
              label="パスワード（確認）"
              type="password"
              autoComplete="new-password"
              {...register('password_confirmation')}
              error={errors.password_confirmation?.message}
            />

            {isGenericError && (
              <p role="alert" className="text-sm text-red-600 text-center">
                エラーが発生しました。もう一度お試しください。
              </p>
            )}

            <Button type="submit" isLoading={register_.isPending} className="w-full">
              {register_.isPending ? '登録中...' : '企業登録する'}
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-gray-400">
            登録することで
            <Link href="/terms" className="underline">利用規約</Link>
            および
            <Link href="/privacy" className="underline">プライバシーポリシー</Link>
            に同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  )
}
