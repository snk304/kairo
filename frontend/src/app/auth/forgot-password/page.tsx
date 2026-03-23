'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const forgot = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/auth/password/forgot', data),
    onSuccess: () => setSent(true),
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (sent) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-4xl">📧</p>
            <h1 className="mt-4 text-xl font-bold text-gray-900">メールを送信しました</h1>
            <p className="mt-2 text-sm text-gray-500">
              パスワードリセット用のリンクをメールで送信しました。
              メールをご確認ください。
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block text-sm text-blue-600 hover:text-blue-800"
            >
              ログインページへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">パスワードのリセット</h1>
          <p className="mt-2 text-sm text-gray-500">
            登録メールアドレスを入力してください。パスワードリセット用のリンクを送信します。
          </p>

          <form
            onSubmit={handleSubmit((data) => forgot.mutate(data))}
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

            <Button type="submit" isLoading={forgot.isPending} className="w-full">
              リセットメールを送信
            </Button>
          </form>

          <p className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-800">
              ログインに戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
