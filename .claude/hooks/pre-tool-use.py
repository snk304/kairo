#!/usr/bin/env python3
"""
pre-tool-use hook — 危険なコマンドをブロックする
"""
import json, sys

BLOCK = [
    "migrate:fresh", "migrate:reset", "db:wipe",
    "down -v", "push --force", "reset --hard",
]

event = json.loads(sys.stdin.read())

if event.get("tool_name") == "Bash":
    cmd = event.get("tool_input", {}).get("command", "")
    for pattern in BLOCK:
        if pattern in cmd:
            print(f"🚫 ブロック: `{pattern}` を含むコマンドは実行できません。", file=sys.stderr)
            sys.exit(2)

# .envファイルへの直接書き込みを警告
if event.get("tool_name") in ("Write", "Edit", "MultiEdit"):
    path = event.get("tool_input", {}).get("file_path", "")
    if path.endswith(".env") and not path.endswith(".env.example"):
        print(f"⚠️  警告: .envを直接編集しています。.env.exampleを編集してください。", file=sys.stderr)

sys.exit(0)
