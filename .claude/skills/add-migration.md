# add-migration.md — マイグレーション追加手順

テーブルやカラムを追加するときはこの順番で進める。

## 手順

**1. マイグレーションファイルを作る**

```bash
# 新しいテーブル
php artisan make:migration create_scouts_table

# カラム追加
php artisan make:migration add_status_to_scouts_table
```

**2. マイグレーションを書く**

PKは必ずULIDを使う。

```php
$table->ulid('id')->primary();
```

FKも必ずULIDで定義する。

```php
$table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
```

**3. Modelを更新する**

- `$fillable` に新しいカラムを追加する
- 型キャストが必要なカラムは `$casts` に追加する
- リレーションが増えた場合はメソッドを追加する
- `HasUlids` トレイトが使われているか確認する

**4. マイグレーションを実行する**

```bash
php artisan migrate
```

**5. シーダーが必要なら更新する**

`database/seeders/` の該当シーダーを更新して再実行する。

```bash
php artisan db:seed --class=ScoutSeeder
```

**6. API Resourceの更新を確認する**

新しいカラムをレスポンスに含める場合はResourceクラスを更新する。
セキュリティルール（`.claude/rules/security.md`）を確認して
個人情報カラムが不用意に露出しないか確認する。
