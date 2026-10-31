# TOUCHLINE MANAGER CAREER V2

기존 V1의 React + Vite 기반 감독 커리어 게임을 확장한 V2 프로젝트입니다.

## 실행

```bash
npm install
npm run dev
```

배포 빌드 및 테스트:

```bash
npm run build
npm test
```

## V1에서 유지한 기능

- 감독 출신 경로 및 전술 철학 선택
- 구단 감독직 제안, 계약 조건 및 부임
- 잉글랜드 7단계 리그 구조, 리그 일정·순위표·승격/강등
- FA컵, 카라바오컵
- 경기 전 포메이션·압박·수비 라인·템포·로테이션 설정
- 라이브 경기 구간 진행, 하프타임·실점·부상·퇴장 대응
- 감독 능력치 성장, 성장 상점, 구단 신뢰도 및 시즌 이벤트
- 로컬 자동 저장, Supabase 기반 선택형 온라인 리그

## V2 확장

- 라리가, 분데스리가, 세리에 A, 리그 1, 에레디비시, 프리메이라리가, 스코티시 프리미어십, 벨기에 프로 리그, 튀르키예 쉬페르리그의 구단 데이터베이스
- 유럽 주요 구단 대표 선수 데이터베이스
- 프리미어리그 주요 구단과 유럽 명문 구단의 실제 엠블럼 이미지 연결. 외부 이미지가 없거나 로딩에 실패하면 팀별 색상·약칭 방패 엠블럼으로 대체
- 경기 결과에 따라 매 경기 팬 닉네임과 반응을 무작위 생성
- 유럽 대항전 진출 시 다음 시즌 챔피언스리그·유로파리그·컨퍼런스리그 일정 생성
- 구단별 재임 시즌, 승·무·패 및 트로피 캐비닛을 포함한 은퇴 보고서

## 참고

- 선수·구단·대회 데이터는 게임용으로 구성한 데이터이며 실시간 스쿼드나 실제 경기 일정과 연동되지 않습니다.
- 구단 엠블럼 이미지는 football-data.org의 공개 crest 이미지 주소를 사용합니다. 네트워크/브라우저 정책에 따라 일부 이미지가 표시되지 않을 수 있으며, 이 경우 자동으로 약칭 엠블럼이 표시됩니다.
- 해외 리그 구단은 V2 데이터베이스에 포함되어 있으며, 현재 승격·강등과 상세 리그 시뮬레이션은 기존 잉글랜드 리그 구조를 중심으로 작동합니다. 유럽 대항전은 진출 시 경기 일정이 생성되는 커리어 연동 방식입니다.
- 온라인 모드는 Supabase 설정 시 공유 리그·순위·결과 피드를 제공하는 MVP입니다. 완전한 실시간 동기화 멀티플레이는 아닙니다.

## Supabase 설정

`.env.example`을 `.env`로 복사하고 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 입력한 뒤 `supabase/migrations/001_init.sql`을 실행하세요.

## V2 해외 리그 승격·강등
- 스페인, 독일, 이탈리아, 프랑스, 네덜란드, 포르투갈, 스코틀랜드, 벨기에, 튀르키예 9개 리그에 각각 1부와 2부 구단 구성을 추가했습니다.
- 매 시즌 종료 시 각 해외 리그의 1부 하위 2개 팀이 2부로 강등되고, 2부 상위 2개 팀이 1부로 승격됩니다.
- 승강 결과는 세이브 데이터의 `europeanWorld`에 저장되어 다음 시즌에도 유지되며, 컵대회 화면에서 최근 승격·강등 구단을 확인할 수 있습니다.
- 해외 리그의 AI 시즌 성적은 커리어 시즌 종료 시점에 자동 시뮬레이션됩니다.

## V3 업데이트
- 승격 플레이오프 진출과 경질 판정을 분리해, 경질된 감독에게 플레이오프 진행 버튼이 남지 않도록 수정했습니다.
- 경질 시 이전 구단의 감독직을 상실하고 무직 상태로 전환되며 새 감독직 제안을 받습니다.
- 구단의 공격·중원·수비 전력과 경기 전 상대 예상 전력을 표시합니다.
- 선수단 전력이 경기 시뮬레이션에 반영됩니다.
- 이적시장에 포지션별 영입 선수를 추가하고 영입 비용과 전력 변화를 반영합니다.
- 선수단 평균 나이와 시즌별 선수 노화를 반영합니다. 젊은 선수는 성장하고 고령 선수는 기량이 하락하며, 스타 선수도 고령이 되면 은퇴할 수 있습니다.
- 감독 능력치의 게임 내 역할을 안내합니다.


## V4 구단 전력·이적시장 개편
- 구단별 고정 공격·중원·수비 평점과 전술 성향, 강점·약점, 전력 기반 예상 순위를 표시합니다.
- 경기 시뮬레이션은 우리 팀 포지션별 전력과 상대 팀의 공격·중원·수비 및 전술 성향을 반영해 득점·실점 양상을 계산합니다.
- 이적시장에는 베테랑 스타, 전성기 선수, 고잠재력 유망주가 등장합니다. 기준 가격은 능력치 1당 약 100억 원이며 나이·유형에 따라 조정됩니다.
- 베테랑은 즉시 전력과 사기 상승 효과가 크지만 30대 초반부터 빠르게 하락하고 36세 이후 스타 선수는 은퇴할 수 있습니다. 유망주는 잠재력에 따라 성장합니다.
- 시즌 종료 시 선수 나이와 능력치가 갱신되고 평균 나이에 따른 사기 효과도 반영됩니다.

참고: 선수단은 게임용 가상 선수 데이터이며, 구단별 전력·전술 프로필은 게임 밸런스를 위한 고정 시뮬레이션 데이터입니다. 실제 축구 데이터나 공식 예상 순위를 의미하지 않습니다.

## V5 선수단 사기 및 스타 선수 이적 요청
- 시즌 종료 시 핵심 선수/고능력 선수가 확률적으로 이적 요청을 합니다.
- 매각을 수락하면 이적료를 확보하지만 해당 선수의 포지션 전력이 하락합니다.
- 잔류를 강요하면 선수단 사기가 크게 하락하며, 사기는 경기력 계산에 반영됩니다.
- 사기 수치는 경기 결과와 선수 영입, 선수단 이슈에 따라 변동합니다.

## V6 구단 재정 시스템
- 구단 평판과 리그 단계에 따라 감독 연봉, 주급, 계약 보너스와 구단 이적 예산이 달라집니다.
- 이적 예산은 감독 개인 자금과 분리되어 선수 영입에만 사용됩니다.
- 스타 선수 매각 대금은 구단 이적 예산에 반영됩니다.
- 시즌 성적, 승격·강등에 따라 다음 시즌 연봉과 이적 예산이 조정됩니다.

## V8 시즌 개인상 시스템
- 시즌 종료 시 득점왕·도움왕을 발표합니다.
- 감독이 선수 개인의 활약을 치켜세우거나 팀 전체의 공헌을 강조할 수 있으며, 선택에 따라 선수단 사기가 달라집니다.
- 발롱도르는 1부 리그 상위 4위 팀의 높은 능력치 선수만 후보가 될 수 있습니다.
- 개인상 수상 기록과 감독의 반응을 커리어 기록에 저장합니다.

## V9 유럽대항전 리그 페이즈 개선
- 유럽대항전 참가팀 36개를 4개 포트로 나누고, 각 포트에서 2팀씩 총 8개 상대를 추첨합니다.
- 각 포트에서 홈 1경기·원정 1경기를 배정합니다.
- 컵대회 탭에서 포트 구성과 36개 팀 리그 페이즈 순위표를 확인할 수 있습니다.
- 순위표에 1~8위 16강 직행, 9~24위 플레이오프, 25~36위 탈락 기준을 표시합니다.

주의: V9에서는 포트 추첨과 리그 페이즈 순위표를 구현했습니다. 플레이오프 및 16강 이후의 실제 양다리 토너먼트 진행, 컵대회 전체 대진 트리와 탈락팀 중복 방지는 아직 완전한 경기 엔진으로 연결되지 않았습니다. 다음 버전에서 마무리할 부분입니다.

## V11 유럽대항전 순위 기반 토너먼트
- 리그 페이즈는 각 팀이 4개 포트에서 2팀씩 만나 총 8경기를 치릅니다.
- 감독 구단의 경기 결과와 같은 라운드의 AI 경기 결과가 36개 팀 순위표에 반영됩니다.
- 리그 페이즈 종료 후 9~16위와 17~24위가 순위에 따라 2경기 합산 플레이오프를 치릅니다.
- 1~8위는 16강에 직행하며 플레이오프 승자 8팀과 순위에 따라 대진합니다.
- 16강·8강·4강은 홈·원정 2경기 합산, 결승은 단판으로 진행됩니다.
- 컵대회 탭에서 순위표, 각 라운드 대진 및 결과를 확인하고 다음 라운드를 진행할 수 있습니다.


## V13 경기 연출 업데이트
- 경기 화면에 전환·득점·주요 장면 애니메이션과 대회별 마크를 추가했습니다.
- 빠른/보통/느린 템포가 경기 전개와 최종 통계에 반영됩니다.
- 경기 종료 후 점유율, 슈팅, xG, 패스 수, 패스 성공률, 코너킥 통계를 표시합니다.
- 모든 경기 종료 후 기자회견으로 자동 이동하며, 승리·무승부·패배 및 질문 유형에 따라 다른 답변을 제공합니다.
- 답변에 따라 선수단 사기와 구단 신뢰도가 변합니다.


## V14 전술·체력·선수 육성 업데이트

- 선발 운영에 따른 체력 소모를 완화했습니다. 부분·대규모 로테이션은 경기 후 체력 손실을 줄이고, 대규모 로테이션은 다음 경기의 피로도 계산에도 추가 이점을 줍니다.
- 포지션별 영입 선수 능력치는 해당 포지션의 기존 선수 능력치와 평균을 내서 적용합니다.
- 시즌 종료 때 유소년 5명이 생성되며, 이적시장 아카데미에서 원하는 선수를 선택해 1군으로 콜업할 수 있습니다. 감독의 유소년 육성 능력치는 높은 잠재력 유망주가 나올 확률과 생성 능력치에 반영됩니다.
- 유망주·전성기·베테랑 선수의 프로필 사진과 연령대 표시를 구분하고, 베테랑에는 수염 표시를 추가했습니다.
- 프리미어리그 및 주요 유럽 구단의 엠블럼 데이터 범위를 넓혔습니다. 엠블럼 이미지가 없는 구단은 구단명 약칭 배지를 표시합니다.
- 경기 종료 후 점유율, 슈팅·유효 슈팅, xG, 패스, 패스 성공률, 코너킥 통계를 먼저 확인하고 확인 버튼을 눌러야 기자회견이 시작됩니다.
- 은퇴 보고서 이후 새 감독으로 새 커리어를 시작할 수 있습니다.
- 경기 통계와 득점 확률은 공격·중원·수비 선수단 능력치, 포메이션, 압박 강도, 수비 라인, 공격 폭, 템포의 영향을 받습니다.

검증: `npm test`의 기본 플레이 흐름 및 V14 영입 평균·유소년 5명·로테이션 체력 보정·포지션 전력 테스트 통과.

## V15 경기 진행 및 이미지 수정

- 실시간 경기의 `momentum` 초기값을 0으로 설정했습니다. 기존에는 값이 정의되지 않아 득점 확률 계산이 `NaN`이 되고, 양 팀 모두 득점 판정이 발생하지 않는 문제가 있었습니다.
- 경기 구간별 득점 확률을 재조정해 평균 득점이 더 자연스럽게 나오도록 했습니다. 공격·중원·수비 전력 차이, 빠른/느린 템포, 압박 강도, 수비 라인이 계속 득점 확률에 영향을 줍니다.
- 경기 종료 후 경기 탭에서 점유율, 슈팅, 유효 슈팅, xG, 패스, 패스 성공률, 코너킥과 전술 전력을 먼저 확인하고, 확인 버튼을 눌러야 기자회견으로 이동합니다.
- 경기 결과에 통계 및 인터뷰 질문 데이터를 함께 저장하고, 구버전 저장 데이터에서 질문이 비어 있는 경우에도 기본 기자회견이 생성되도록 했습니다.
- 외부 이미지 서버에 의존하지 않도록 선수(유망주/전성기/베테랑)와 기자 프로필 SVG를 `public/players`에 포함했습니다. 기존 저장 선수의 외부 이미지가 실패하면 연령대별 로컬 이미지로 대체됩니다.
- `npm test`에 득점 빈도, 경기 통계/기자회견 데이터, 경기 종료 화면 연결, 로컬 이미지 파일 검증을 추가했습니다.


## Player portrait assets (V17)
- Youth: supplied user reference image, recolored to a black kit.
- Prime: taller, grown-up version in the matching cartoon style and black kit.
- Veteran: grown-up version with a beard and matching black kit.
- The three age-stage portraits are bundled locally under `public/players/` and referenced by PNG paths; reporter portraits remain unchanged.


### 기자회견 기자 이미지 (V19)
- `public/players/reporter-1.png`: 사용자가 제공한 파란 옷 기자 이미지 원본
- `public/players/reporter-2.png`: 같은 그림체의 빨간 옷 장발 여성 기자
- `public/players/reporter-3.png`: 같은 그림체의 검정 옷 대머리 기자

## Version 21 hotfix (2026-10-31)

- Raised live-match scoring probabilities modestly and added a 0-0 frequency regression check.
- Fixed transfer-market player portrait URLs to use the bundled `.png` assets (the previous `.svg` paths did not exist).
- Persisted the post-match workflow stage in the career save so the full-time statistics and press-conference sequence can be restored after a reload.
- Made the full-time statistics screen read the saved match report as a fallback when transient React state is unavailable.

## V24 이적시장 개선

- 이적시장 선수는 시즌·구단·리그 단계에 따라 결정되는 별도 선수 풀로 생성되며, 같은 시즌 화면을 다시 열어도 명단이 바뀌지 않습니다.
- 새 시즌에는 이름, 포지션별 플레이 유형, 나이, 현재 능력치, 잠재력, 세부 능력치, 이적료가 다른 선수 풀이 생성됩니다.
- 침투형 스트라이커, 타깃형 공격수, 스피드형 윙어, 딥라잉 플레이메이커, 볼 위닝 미드필더, 빌드업 센터백 등 포지션별 플레이 스타일과 세부 능력치를 표시합니다.
- 선수 ID를 세이브에 기록하고 영입한 선수는 해당 시즌 이적시장 목록에서 제거합니다. 영입 함수를 직접 다시 호출해도 같은 선수를 중복 영입할 수 없습니다.
- 이적시장 선수의 세부 능력치와 플레이 스타일은 카드에 표시됩니다.


## V27 additions

- Champions League playoff ties now resolve level aggregates with a penalty shootout; seeded playoff and round-of-16 brackets are generated from league-phase ranks without duplicate entrants. The playoff seed table is also available in the main standings tab.
- Boards can offer a contract extension during the season after sustained overperformance or after a strong season finish.
- New careers include manager nationality selection. The offer pool favors the manager's nationality league when available; other nationalities receive a spread of overseas offers based on manager ability.
- Spain, Germany, Italy, France, Netherlands, Portugal, Scotland, Belgium and Türkiye can now be selected as playable managerial careers with double round-robin schedules, league tables, club ratings, squad-age estimates, nicknames and supporter reactions.

## V30 · 2026-27 European access and offer details
- Adds 2025-26 season European qualification mappings for all nine modeled overseas leagues.
- European league-phase draws now seed qualified clubs from all modeled leagues, not only the manager's domestic league.
- Overseas job offers display the club's European competition (or '없음') and accepting an offer creates the corresponding European league-phase fixtures.
- Regression tests count domestic and European fixtures separately and verify qualification retention after appointment.
