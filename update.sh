#!/bin/sh
# 東亞 群雄割據 — 터미널 업데이트 (Mac / Linux)
cd "$(dirname "$0")" || exit 1

echo "============================================"
echo "   동아시아 군웅할거  터미널 업데이트"
echo "============================================"
echo

if ! command -v git > /dev/null 2>&1; then
  echo "[오류] Git이 설치되어 있지 않습니다."
  echo "       터미널에서 'git --version' 을 실행하면 설치 안내가 뜹니다."
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "[오류] 이 폴더는 git으로 받은 폴더가 아닙니다."
  echo
  echo "       처음 한 번만 아래 명령으로 내려받으세요:"
  echo "       git clone -b claude/east-asia-sangokushi https://github.com/loganzi6666-del/game.git GUNWOONG"
  echo
  echo "       자세한 내용: sangokushi/HOW_TO_UPDATE.md"
  exit 1
fi

echo "[현재 버전]"
git log --oneline -1
echo
echo "최신 버전을 받아옵니다..."
echo

if ! git pull --ff-only; then
  echo
  echo "[알림] 그냥 합쳐지지 않았습니다. 게임 파일을 직접 고친 적이 있으면 생깁니다."
  echo "       내 수정을 버리고 최신 버전으로 맞추려면:"
  echo "         git reset --hard && git pull"
  exit 1
fi

echo
echo "============================================"
echo "   업데이트 완료"
echo "============================================"
echo "[새 버전]"
git log --oneline -1
echo
echo "바뀐 내용: sangokushi/CHANGELOG.md"
echo

printf "지금 게임을 실행할까요? [y/N] "
read -r ans
case "$ans" in
  [Yy]*)
    if command -v open > /dev/null 2>&1; then open sangokushi/index.html
    elif command -v xdg-open > /dev/null 2>&1; then xdg-open sangokushi/index.html
    else echo "sangokushi/index.html 를 브라우저로 열어주세요."; fi ;;
esac
