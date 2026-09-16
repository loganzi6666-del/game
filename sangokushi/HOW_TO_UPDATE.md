# 東亞 群雄割據 — 터미널로 업데이트 받기

zip을 다시 받을 필요가 없습니다. 터미널에서 **`git pull` 한 줄**이면 최신 버전이 됩니다.
(윈도우는 폴더 안의 `UPDATE.bat` 더블클릭으로도 됩니다.)

브랜치 이름: **`claude/east-asia-sangokushi`**

---

## 1. 준비 (처음 한 번만)

### Windows
1. https://git-scm.com/download/win 에서 Git 설치 (전부 기본값으로 다음 → 다음)
2. 게임을 둘 폴더에서 마우스 오른쪽 클릭 → **Git Bash Here**
   (또는 시작 메뉴에서 `cmd` 실행 후 `cd 원하는폴더`)

### Mac
1. **터미널(Terminal)** 앱을 엽니다.
2. `git --version` 입력. 설치가 안 돼 있으면 설치 안내가 자동으로 뜹니다.

---

## 2. 처음 내려받기 (한 번만)

```bash
git clone -b claude/east-asia-sangokushi https://github.com/loganzi6666-del/game.git GUNWOONG
cd GUNWOONG
```

`GUNWOONG` 폴더가 생기고 그 안에 게임 파일이 전부 들어갑니다.
(폴더 이름은 원하는 대로 바꿔도 됩니다.)

---

## 3. 게임 실행

| 환경 | 방법 |
|---|---|
| Windows | 폴더의 **`START_EASTASIA.bat`** 더블클릭 |
| Mac | `sangokushi/index.html` 더블클릭 |
| 터미널 | `start sangokushi\index.html` (Win) · `open sangokushi/index.html` (Mac) |

Chrome 또는 Edge 권장. 서버는 필요 없습니다.

---

## 4. 업데이트 받기 (다음부터는 이것만)

### 방법 A — 스크립트 (쉬움)

| 환경 | 방법 |
|---|---|
| Windows | **`UPDATE.bat`** 더블클릭 → 현재 버전 표시 → 최신 버전 받기 → 바로 실행 여부 선택 |
| Mac / Linux | 터미널에서 `./update.sh` (처음 한 번은 `chmod +x update.sh`) |

### 방법 B — 터미널 직접

```bash
cd GUNWOONG
git pull
```

끝입니다. 브라우저에 게임을 열어둔 상태였다면
`Ctrl + F5` (Mac은 `Cmd + Shift + R`) 로 **강제 새로고침**하세요.
(그냥 새로고침하면 브라우저가 옛 파일을 캐시에서 꺼내 쓸 수 있습니다.)

---

## 5. 버전 확인

- 게임 **타이틀 화면 아래쪽**에 `v1.1.0 (2026-09-16)` 처럼 표시됩니다.
- 게임 안에서는 **`사서(史書)`** 버튼에서도 볼 수 있습니다.
- 터미널에서:
  ```bash
  git log --oneline -1
  ```
- 바뀐 내용은 `sangokushi/CHANGELOG.md` 에 정리돼 있습니다.

---

## 자주 겪는 상황

**Q. `git pull` 에서 충돌(conflict)이 났습니다.**
게임 파일을 직접 고친 적이 있으면 생깁니다. 내 수정을 버리고 최신으로 맞추려면:
```bash
git reset --hard
git pull
```

**Q. 세이브가 날아가나요?**
아닙니다. 세이브는 게임 파일이 아니라 **브라우저 안(localStorage)** 에 있습니다.
`git pull` 로 파일을 갈아끼워도 진행 상황은 그대로입니다.
단, **다른 브라우저**로 열거나 **폴더 위치를 옮기면** 브라우저가 다른 사이트로 보아
세이브가 안 보일 수 있습니다. 항상 같은 브라우저, 같은 경로에서 여세요.

**Q. `UPDATE.bat` 이 한글이 깨져 보입니다.**
동작에는 문제가 없습니다. 깔끔하게 보려면 `cmd` 에서 `chcp 65001` 을 한 번 실행한 뒤
`UPDATE.bat` 를 실행하세요.

**Q. 이 저장소에 게임이 두 개 있는데요?**
같은 저장소의 다른 브랜치에 `LIFE : RISE` 가 있습니다.
이 브랜치(`claude/east-asia-sangokushi`)에는 두 게임이 모두 들어 있습니다.
- 군웅할거 → `START_EASTASIA.bat` / `sangokushi/index.html`
- LIFE : RISE → `START_GAME.bat` / `index.html`

**Q. 폴더를 어디에 뒀는지 잊어버렸습니다.**
```bash
cd ~                 # Mac: 홈 폴더
cd %USERPROFILE%     # Windows: 홈 폴더
```
로 이동한 뒤 폴더를 찾으세요. 또는 `git` 이 설치된 상태에서:
```bash
dir /s /b GUNWOONG   # Windows
find ~ -name "sangokushi" -maxdepth 4   # Mac
```
