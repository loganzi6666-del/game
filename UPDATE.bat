@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 동아시아 군웅할거 - 업데이트
echo ============================================
echo    동아시아 군웅할거  터미널 업데이트
echo ============================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
  echo [오류] Git이 설치되어 있지 않습니다.
  echo.
  echo        https://git-scm.com/download/win
  echo        에서 설치한 뒤 다시 실행하세요.
  echo.
  pause
  exit /b 1
)

if not exist ".git" (
  echo [오류] 이 폴더는 git으로 받은 폴더가 아닙니다.
  echo.
  echo        아래 명령으로 처음 한 번만 내려받으세요:
  echo.
  echo        git clone -b claude/east-asia-sangokushi https://github.com/loganzi6666-del/game.git GUNWOONG
  echo.
  echo        자세한 내용은 sangokushi\HOW_TO_UPDATE.md 를 보세요.
  echo.
  pause
  exit /b 1
)

echo [현재 버전]
git log --oneline -1
echo.
echo 최신 버전을 받아옵니다...
echo.
git pull --ff-only
if errorlevel 1 (
  echo.
  echo [알림] 그냥 합쳐지지 않았습니다. 게임 파일을 직접 고친 적이 있으면 생깁니다.
  echo        내 수정을 버리고 최신 버전으로 맞추려면 이 두 줄을 실행하세요:
  echo.
  echo        git reset --hard
  echo        git pull
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo    업데이트 완료
echo ============================================
echo [새 버전]
git log --oneline -1
echo.
echo 바뀐 내용: sangokushi\CHANGELOG.md
echo.
choice /c YN /n /m "지금 게임을 실행할까요?  [Y] 예  [N] 아니오 : "
if errorlevel 2 goto end
start "" "%~dp0sangokushi\index.html"
:end
exit /b 0
