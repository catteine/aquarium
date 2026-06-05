@AGENTS.md

# 프로젝트 개요

아쿠아리움 게임 앱. 사용자가 직접 물고기를 그려서 추가하면, 어항 안에서 헤엄치는 인터랙티브 웹앱.

## 스택

- Next.js 16 (App Router) + TypeScript 5
- Tailwind CSS v4
- ESLint + Prettier
- 외부 게임 라이브러리 없음 — 순수 Canvas + requestAnimationFrame

## 디자인 컨셉

→ 상세 내용은 `DESIGN.md` 참고

- 흰색 배경, 스케치/드로잉 느낌 통일
- 어항 테두리: Canvas에 직접 그린 손그림 선 (roughLine 알고리즘)
- 물 색상 없음, 모래 바닥만 스케치로 표현
- UI: 심플한 흰색 툴바, indigo 포인트 컬러

## 파일 구조

```
app/
  page.tsx              # AquariumPage를 렌더링하는 Server Component
  layout.tsx            # 루트 레이아웃
  globals.css           # Tailwind import, 전역 스타일

components/aquarium/
  AquariumPage.tsx      # 'use client' 루트. fish ref, 게임루프, 모달 상태 관리
  AquariumCanvas.tsx    # <canvas> + ResizeObserver (forwardRef)
  DrawingModal.tsx      # 물고기 그리기 모달 (DrawingCanvas + FishToolbar 조합)
  DrawingCanvas.tsx     # 실제 드로잉 캔버스, useImperativeHandle로 getDataURL 노출
  FishToolbar.tsx       # 색상 팔레트, 브러시, 지우개, 초기화
  SettingsPanel.tsx     # ⚙ 버튼 + 드롭다운 (JSON 저장/불러오기)

lib/aquarium/
  types.ts              # Fish, StoredFish, DrawingTool, AquariumDims 타입
  fishPhysics.ts        # updateFish(), randomVelocity() — BORDER_PAD/SAND_HEIGHT 기준 바운스
  renderAquarium.ts     # drawFrame() + 스케치 decor 생성/캐싱 (BORDER_PAD, SAND_HEIGHT 상수 export)
  gameLoop.ts           # startGameLoop() → RAF 루프, cancel 함수 반환
  storage.ts            # LocalStorage 저장/로드, JSON export/import
```

## 주요 아키텍처 결정

- **Fish 상태**: `useRef<Fish[]>` — React 상태 아님. RAF 루프에서 직접 뮤테이션
- **스케치 배경**: 리사이즈 시 오프스크린 canvas에 한 번 생성 후 캐싱, 매 프레임 `drawImage`로 stamp
- **물고기 방향**: `Fish.facingRight: boolean` 저장, `(vx > 0) !== facingRight` 일 때 수평 flip
- **저장**: 물고기 추가/삭제 시 LocalStorage 자동 저장. `sprite: HTMLImageElement` → `dataURL: string`으로 직렬화

## 레이아웃 구조

```
bg-white, flex-col, h-screen
  상단: ⚙ 설정 버튼 (우측)
  중앙: 어항 canvas (max-width 900px, 16:9 비율)
  하단 툴바: [물고기 N마리] [전체삭제] [물고기추가 아이콘버튼]
```

## 개발 서버

```bash
npm run dev -- -p 3001   # 포트 3000은 다른 프로젝트(card-match)가 점유 중
```

## 주요 스크립트

```bash
npm run dev          # 개발 서버
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
```
