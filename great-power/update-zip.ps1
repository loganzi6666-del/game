# 열강의 시대 1900 — ZIP 업데이트 (git 저장소가 아닐 때 쓰인다)
param([Parameter(Mandatory=$true)][string]$Dest)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$url = 'https://github.com/loganzi6666-del/game/archive/refs/heads/claude/great-power-1900.zip'
$tmp = Join-Path $env:TEMP ('gp1900_' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp | Out-Null
$zip = Join-Path $tmp 'gp.zip'

try {
  Write-Host ' [1/3] 최신본을 내려받습니다...'
  $pb = $ProgressPreference; $ProgressPreference = 'SilentlyContinue'
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  $ProgressPreference = $pb

  Write-Host ' [2/3] 압축을 풉니다...'
  Expand-Archive -Path $zip -DestinationPath $tmp -Force

  $root = Get-ChildItem -Path $tmp -Directory | Select-Object -First 1
  $src  = Join-Path $root.FullName 'great-power'
  if (-not (Test-Path $src)) { throw 'ZIP 안에서 great-power 폴더를 찾지 못했습니다.' }

  Write-Host ' [3/3] 덮어씁니다...'
  Copy-Item -Path (Join-Path $src '*') -Destination $Dest -Recurse -Force

  $ver = Join-Path $Dest 'VERSION'
  if (Test-Path $ver) { Write-Host (' 현재 버전: ' + (Get-Content $ver -Raw).Trim()) }
  Write-Host ' 업데이트 완료.'
  exit 0
}
catch {
  Write-Host ''
  Write-Host (' ! 실패: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host '   브라우저에서 직접 받아도 됩니다:'
  Write-Host '   https://github.com/loganzi6666-del/game/tree/claude/great-power-1900'
  exit 1
}
finally {
  if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
}
