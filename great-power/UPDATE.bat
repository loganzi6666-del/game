@echo off
chcp 65001 >nul 2>&1
setlocal
echo.
echo  === 열강의 시대 1900 - 자동 업데이트 ===
echo.
pushd "%~dp0.."
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto ZIPMODE
where git >nul 2>&1
if errorlevel 1 goto ZIPMODE
echo  [1/3] 최신 내용을 받아옵니다...
git fetch origin claude/great-power-1900
if errorlevel 1 goto NETFAIL
echo  [2/3] 브랜치를 맞춥니다...
git checkout claude/great-power-1900 >nul 2>&1
echo  [3/3] 적용합니다...
git merge --ff-only origin/claude/great-power-1900
if errorlevel 1 goto CONFLICT
popd
goto DONE

:ZIPMODE
popd
echo  git 저장소가 아니거나 git이 없습니다. ZIP으로 최신본을 받습니다.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-zip.ps1" -Dest "%~dp0."
if errorlevel 1 goto ZIPFAIL
goto DONE

:DONE
echo.
if exist "%~dp0VERSION" for /f "usebackq delims=" %%v in ("%~dp0VERSION") do echo  현재 버전: %%v
echo  게임을 엽니다.
timeout /t 1 >nul
start "" "%~dp0index.html"
exit /b 0

:NETFAIL
popd
echo  ! 서버에 연결하지 못했습니다. 인터넷 연결을 확인하세요.
pause
exit /b 1

:CONFLICT
popd
echo  ! 이 컴퓨터에서 고친 파일이 있어 자동 병합이 막혔습니다.
echo    내 수정을 버리고 최신 버전으로 맞추려면 아래를 실행하세요:
echo.
echo    git reset --hard origin/claude/great-power-1900
echo.
pause
exit /b 1

:ZIPFAIL
echo.
echo  ! ZIP 업데이트에 실패했습니다.
pause
exit /b 1
