/**
 * Server Components（Docker内）からAPIを呼ぶ際のベースURL。
 * - Docker内: API_URL=http://backend（内部ネットワーク）
 * - ローカル開発: NEXT_PUBLIC_API_URL=http://localhost:8000
 */
export function getServerApiUrl(): string {
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
}
