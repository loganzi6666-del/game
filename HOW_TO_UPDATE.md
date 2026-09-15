# LIFE : RISE — 터미널로 업데이트 받기

이제 새 버전이 나올 때마다 zip 파일을 다시 받을 필요가 없습니다.
터미널에서 `git pull` 한 줄이면 최신 버전이 됩니다.

브랜치 이름: `claude/serene-faraday-emc2vf`

---

## 1. 준비 (처음 한 번만)

### Windows
1. https://git-scm.com/download/win 에서 Git을 설치합니다. (전부 기본값으로 다음 → 다음)
2. 게임을 받을 폴더에서 마우스 오른쪽 클릭 → **Git Bash Here**
   (또는 시작 메뉴에서 `cmd` 를 열고 `cd 원하는폴더` 로 이동)

### Mac
1. 터미널(Terminal) 앱을 엽니다.
2. `git --version` 을 입력합니다. 설치가 안 돼 있으면 설치 안내가 자동으로 뜹니다.

---

## 2. 처음 내려받기 (한 번만)

```bash
git clone -b claude/serene-faraday-emc2vf https://github.com/loganzi6666-del/game.git LIFE_RISE
cd LIFE_RISE
```

`LIFE_RISE` 폴더가 생기고 그 안에 게임 파일이 전부 들어갑니다.

## 3. 게임 실행

- **Windows**: 폴더 안의 `START_GAME.bat` 더블클릭, 또는 `index.html` 더블클릭
- **Mac**: `index.html` 더블클릭
- 터미널에서 바로 열려면:
  ```bash
  start index.html    # Windows
  open index.html     # Mac
  ```

Chrome 또는 Edge를 권장합니다. 서버는 필요 없습니다.

## 4. 업데이트 받기 (다음부터는 이것만)

```bash
cd LIFE_RISE
git pull
```

끝입니다. 새 버전이 바로 반영됩니다.
브라우저에서 게임을 열어둔 상태였다면 `Ctrl + F5` (Mac은 `Cmd + Shift + R`) 로 새로고침하세요.

---

## 자주 겪는 상황

**Q. `git pull` 을 했더니 충돌(conflict)이 났습니다.**
게임 파일을 직접 고친 적이 있으면 생깁니다. 내 수정을 버리고 최신 버전으로 맞추려면:
```bash
git reset --hard
git pull
```

**Q. 세이브 데이터가 날아가나요?**
아닙니다. 세이브는 게임 파일이 아니라 **브라우저 안(localStorage)** 에 저장됩니다.
`git pull` 로 파일을 갈아끼워도 진행 상황은 그대로 남습니다.
다만 **다른 브라우저**로 열거나 **폴더 위치를 옮기면** 브라우저가 다른 사이트로 인식해
세이브가 안 보일 수 있습니다. 항상 같은 브라우저, 같은 경로에서 여세요.

**Q. 어느 버전인지 확인하고 싶습니다.**
게임 화면 왼쪽 위 `COMMAND CENTER · V0.9.9` 표시를 보거나, 터미널에서:
```bash
git log --oneline -1
```

**Q. 폴더를 어디에 뒀는지 잊어버렸습니다.**
```bash
cd ~          # Mac: 홈 폴더로
cd %USERPROFILE%   # Windows: 홈 폴더로
```
로 이동한 뒤 `LIFE_RISE` 폴더를 찾으세요.
