# add-api-endpoint.md — APIエンドポイント追加手順

新しいAPIエンドポイントを追加するときはこの順番で実装する。

## 手順

**1. ルートを追加する（`routes/api.php`）**

```php
Route::post('scouts', [ScoutController::class, 'store']);
```

**2. FormRequestを作る**

```bash
php artisan make:request ScoutRequest
```

`authorize()` でロールチェック、`rules()` でバリデーションを書く。

**3. API Resourceを作る**

```bash
php artisan make:resource ScoutResource
```

レスポンスに含めるフィールドを明示的に定義する。

**4. Policyを作る（リソース操作の場合）**

```bash
php artisan make:policy ScoutPolicy --model=Scout
```

**5. Serviceクラスにロジックを書く**

`app/Services/ScoutService.php` にビジネスロジックを実装する。

**6. Controllerを作る**

```bash
php artisan make:controller ScoutController
```

薄く書く。バリデーションはRequest、ロジックはServiceに任せる。

**7. テストを書く**

```bash
# tests/Feature/Scout/ScoutTest.php を作成
./vendor/bin/pest tests/Feature/Scout/ScoutTest.php
```

最低限テストすること：
- 正常系（期待するレスポンスが返る）
- 認可エラー（権限のないロールが403になる）
- 他人のリソースを操作できないこと

**8. 動作確認**

```bash
php artisan route:list --path=api/scouts
```
