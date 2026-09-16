@echo off
chcp 65001 >nul 2>&1
setlocal
cd /d "%~dp0.."
echo.
echo  === 열강의 시대 1900 - 자동 업데이트 ===
echo.
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto NOGIT
echo  [1/3] 최신 내용을 받아옵니다...
git fetch origin claude/great-power-1900
if errorlevel 1 goto NETFAIL
echo  [2/3] 브랜치를 맞춥니다...
git checkout claude/great-power-1900 >nul 2>&1
echo  [3/3] 적용합니다...
git merge --ff-only origin/claude/great-power-1900
if errorlevel 1 goto CONFLICT
echo.
for /f "delims=" %%v in (.\great-power\VERSION) do echo  현재 버전: %%v
echo  업데이트 완료. 게임을 엽니다.
timeout /t 1 >nul
start "" "%~dp0index.html"
exit /b 0

:NOGIT
echo  ! 이 폴더가 git 저장소가 아닙니다.
echo    아래 명령으로 다시 내려받아 주세요:
echo.
echo    git clone -b claude/great-power-1900 https://github.com/loganzi6666-del/game.git
echo.
pause
exit /b 1

:NETFAIL
echo  ! 서버에 연결하지 못했습니다. 인터넷 연결을 확인하세요.
pause
exit /b 1

:CONFLICT
echo  ! 이 컴퓨터에서 고친 파일이 있어 자동 병합이 막혔습니다.
echo    내 수정을 버리고 최신 버전으로 맞추려면 아래를 실행하세요:
echo.
echo    git reset --hard origin/claude/great-power-1900
echo.
pause
exit /b 1
