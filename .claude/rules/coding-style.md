# coding-style.md — コーディングスタイル

## PHP（Laravel）

### コントローラーは薄く書く

```php
// ✅ 正しい
public function store(JobRequest $request, JobService $service)
{
    $job = $service->create($request->user(), $request->validated());
    return new JobResource($job);
}

// ❌ 間違い：コントローラーにロジックを書く
public function store(Request $request)
{
    $validated = $request->validate([...]);
    $company = CompanyProfile::where(...)->firstOrFail();
    $job = Job::create([...]);
    ...
}
```

### 必ずこのクラスを使う

| やること | 使うクラス |
|----------|-----------|
| バリデーション | FormRequest |
| レスポンス整形 | API Resource |
| 認可 | Policy |
| ビジネスロジック | Service |
| 複雑なクエリ | Eloquent scope |

### PKはULIDを使う

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
class Job extends Model { use HasUlids; }
```

---

## TypeScript（Next.js）

### `any` 型は使わない

```typescript
// ✅ 正しい
const job: Job = data

// ❌ 間違い
const job: any = data
```

### APIリクエストは必ず `lib/api/` に書く

```typescript
// ✅ 正しい
import { jobsApi } from '@/lib/api/jobs'
const { data } = await jobsApi.list(params)

// ❌ 間違い：コンポーネント内に直接書く
const res = await axios.get('/api/jobs')
```

### データ取得はTanStack Queryを使う

```typescript
const { data, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsApi.list(filters),
})
```
