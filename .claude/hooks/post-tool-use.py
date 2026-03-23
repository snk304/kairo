#!/usr/bin/env python3
"""
post-tool-use hook — ファイル保存後に自動でLint・フォーマットを実行する
ClaudeCodeのコンテキストを消費せずに品質を保つ
"""
import json, subprocess, sys, os

event = json.loads(sys.stdin.read())

if event.get("tool_name") not in ("Write", "Edit", "MultiEdit"):
    sys.exit(0)

path = event.get("tool_input", {}).get("file_path", "")
root = os.getcwd()

# PHPファイル → PHP-CS-Fixer
if path.endswith(".php") and "backend/" in path:
    fixer = os.path.join(root, "backend/vendor/bin/php-cs-fixer")
    if os.path.exists(fixer):
        subprocess.run([fixer, "fix", path, "--quiet"], capture_output=True)

# TS・TSXファイル → Prettier → ESLint
if path.endswith((".ts", ".tsx")) and "frontend/" in path:
    fe = os.path.join(root, "frontend")
    prettier = os.path.join(fe, "node_modules/.bin/prettier")
    eslint   = os.path.join(fe, "node_modules/.bin/eslint")
    if os.path.exists(prettier):
        subprocess.run([prettier, "--write", path, "--log-level=silent"], capture_output=True)
    if os.path.exists(eslint):
        subprocess.run([eslint, "--fix", path, "--quiet"], capture_output=True)

sys.exit(0)
