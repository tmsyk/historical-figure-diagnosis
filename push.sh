#!/bin/bash

# コミットメッセージが引数として渡されていない場合はエラー終了
if [ -z "$1" ]; then
  echo "❌ エラー: コミットメッセージを入力してください。"
  echo "使用法: ./push.sh \"コミットメッセージ\""
  exit 1
fi

echo "🚀 変更をステージング中 (git add .)..."
git add .

echo "📦 コミット中 (git commit)..."
git commit -m "$1"

echo "⬆️ GitHubへプッシュ中 (git push)..."
git push

echo "✅ 完了しました！"
