# Starbound Sprint

HTML5 Canvas + Vanilla JavaScript ES Modules로 만든 오리지널 에셋 기반 고전 2D 플랫폼 데모입니다. 특정 상용 게임의 캐릭터, 스프라이트, 음악, 스테이지 레이아웃을 복제하지 않고 **가속/관성/가변 점프/충돌/카메라/적 상호작용** 중심의 플레이 감각을 구현합니다.

## 실행

빌드 및 npm 의존성은 없습니다. ES Modules와 JSON `fetch()`를 사용하므로 저장소 루트에서 정적 HTTP 서버만 실행합니다.

```bash
python3 -m http.server 8080
```

브라우저에서 `http://localhost:8080`을 엽니다.

## Smoke test

브라우저/DOM이 필요 없는 핵심 level parsing 및 tile collision 검증은 다음으로 실행할 수 있습니다.

```bash
node tests/smoke.mjs
```

## 조작

- 이동: `←/→` 또는 `A/D`
- 점프: `Z` 또는 `Space` — 짧게 누르면 낮게, 길게 누르면 높게 점프
- 달리기: `X` 또는 `Shift`
- 일시정지: `P` 또는 `Esc`
- 재시작: `R`
- 디버그 오버레이: `F2`
- Gamepad: 왼쪽 스틱/D-pad, A 점프, X/RB 달리기, Start 일시정지
- 터치 기기: 화면 하단 가상 버튼

## 구조

```text
index.html
styles/
  reset.css
  game.css
  ui.css
src/
  main.js
  core/       Game, fixed timestep loop, input, events, assets, audio, pooling, scene/storage
  data/       constants and gameplay tuning
  engine/     Entity, World, spatial hash, collision system
  gameplay/   Player/controller, enemies, items, blocks, score, particles, factory
  world/      level parsing, tile map, camera, spawn activation
  rendering/  world renderer and debug renderer
  ui/         HUD and overlays
  utils/
assets/
  levels/demo.json
```

## 아키텍처

`GameLoop`은 60 Hz fixed timestep으로 simulation과 rendering을 분리하고 interpolation alpha를 Renderer에 전달합니다. `World.update()`에 시스템 순서를 명시해 입력 → 컨트롤 → AI → 물리/타일 충돌 → entity interaction → sequence → spawn/deactivate → camera → effect 순서를 유지합니다.

Tile collision은 X/Y축을 분리한 AABB resolution을 사용합니다. 최대 낙하 속도를 타일 크기/고정 tick에 안전한 범위로 제한해 일반 이동에서 불필요한 swept-AABB 비용을 피합니다. Entity broad phase에는 uniform spatial hash를 사용합니다.

플레이어 수치는 `src/data/playerConfig.js`에 분리되어 있으며 walk/run 가속, 감속, 공중 제어, skid, 상승/하강 gravity, jump cut, coyote time, jump buffer를 독립 튜닝할 수 있습니다.

렌더러는 camera viewport에 포함되는 tile column만 순회합니다. 임시 particle은 `ObjectPool`에서 재사용하고, HUD DOM은 값이 바뀔 때만 갱신합니다.

## 새 Level 추가

1. `assets/levels/demo.json` 형식을 복사해 새 JSON을 만듭니다.
2. `width`, `height`, `tileSize`, `terrain`, `blocks`, `entities`, `spawn`, `goal`을 데이터로 정의합니다.
3. `src/core/Config.js`의 `levelUrl`을 새 파일로 변경합니다.

`terrain`은 직사각형 범위를 압축해서 기록하며 LevelLoader가 `Uint8Array` TileMap으로 확장합니다. 스테이지별 JavaScript 코드는 필요하지 않습니다.

## 새 Enemy 추가

1. `src/data/enemyConfig.js`에 밸런스 수치를 추가합니다.
2. 필요하면 `Enemy`의 작은 AI strategy/state를 확장합니다.
3. `EntityFactory.register(type, creator)`로 생성 함수를 등록합니다.
4. Level JSON의 `entities`에 해당 `type`을 배치합니다.

LevelLoader는 구체 Enemy 클래스를 직접 생성하지 않습니다.

## 새 Item / Power-up 추가

- Item: `EntityFactory`에 type creator를 등록하고 `World.collectItem()`에 공통 interaction을 연결합니다.
- Power-up: Player 자체에 아이템별 spawn 규칙을 넣지 말고, 아이템 interaction에서 Player의 public capability를 호출하는 방식으로 추가합니다.
- Item block의 `payload.type`으로 스폰할 종류를 데이터에서 선택합니다.

## Asset 교체

현재 캐릭터/타일/SFX는 Canvas procedural drawing과 Web Audio oscillator로 구성되어 외부 저작권 asset이 없습니다. 이미지를 도입하려면 `AssetManager.loadImage()`로 캐시하고 Renderer의 표현 계층만 교체하십시오. Gameplay/physics 코드는 asset에 의존하지 않습니다.

## Debug

`F2`로 FPS, frame time, entity count, camera, player position/velocity/state/grounded와 player collider를 표시합니다.

개발 콘솔에서 선택적으로 다음을 사용할 수 있습니다.

```js
DEBUG_GAME.restart()
DEBUG_GAME.invincible()
DEBUG_GAME.teleport(500, 120)
DEBUG_GAME.loadLevel()
```

## 구현된 주요 시스템

- 60 Hz fixed timestep + render interpolation
- walk/run acceleration, inertia, skid
- variable jump height, jump cut, coyote time, jump buffer
- X/Y 분리 tile collision + one-way platform + hazards
- item/breakable block head-hit interaction
- walker / shell-state / flying enemy
- previous-bottom 기반 stomp 판정, shell kick 및 연쇄 처치
- collectible, power state, collider-safe size growth, damage/invulnerability
- death/respawn/lives, checkpoint, timer, score, goal/stage clear
- camera dead zone/look-ahead/bounds/catch-up
- viewport tile culling, camera-range simulation activation
- spatial hash broad phase
- particle object pool
- action-based keyboard/gamepad/touch input
- scene/title/pause/game-over/clear
- EventBus 기반 score/HUD decoupling
- Web Audio SFX, LocalStorage high score/settings scaffold
- F2 debug overlay

## 성능/메모리 메모

Simulation hot path에서는 typed array input state, typed tile map, 재사용 collision record, spatial-hash bucket reuse 및 particle pool을 사용합니다. Debug 모드가 꺼져 있으면 디버그 문자열/추가 draw 비용도 발생하지 않습니다. Restart 시 기존 World의 score subscriptions과 pool active objects를 정리한 뒤 새 World를 구성해 listener/entity 중복 누적을 막습니다.
