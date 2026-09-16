#!/usr/bin/env bash
# 열강의 시대 1900 — 자동 업데이트 (macOS / Linux)
set -u
BRANCH="claude/great-power-1900"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE/.." || exit 1

echo
echo " === 열강의 시대 1900 — 자동 업데이트 ==="
echo

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo " ! 이 폴더가 git 저장소가 아닙니다. 아래로 다시 내려받으세요:"
  echo "   git clone -b $BRANCH https://github.com/loganzi6666-del/game.git"
  exit 1
fi

echo " [1/3] 최신 내용을 받아옵니다..."
git fetch origin "$BRANCH" || { echo " ! 서버에 연결하지 못했습니다."; exit 1; }

echo " [2/3] 브랜치를 맞춥니다..."
git checkout "$BRANCH" >/dev/null 2>&1

echo " [3/3] 적용합니다..."
if ! git merge --ff-only "origin/$BRANCH"; then
  echo
  echo " ! 이 컴퓨터에서 고친 파일이 있어 자동 병합이 막혔습니다."
  echo "   내 수정을 버리고 최신으로 맞추려면:"
  echo "   git reset --hard origin/$BRANCH"
  exit 1
fi

echo
echo " 현재 버전: $(cat great-power/VERSION 2>/dev/null || echo '알 수 없음')"
echo " 업데이트 완료. 게임을 엽니다."

INDEX="$HERE/index.html"
if   command -v open    >/dev/null 2>&1; then open "$INDEX"
elif command -v xdg-open>/dev/null 2>&1; then xdg-open "$INDEX"
else echo " 브라우저로 직접 열어주세요: $INDEX"; fi
