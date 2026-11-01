export const seasonLabel='2026-27';
export const leagueData = [
 {tier:1,name:'프리미어리그',clubs:["아스널", "애스턴 빌라", "본머스", "브렌트퍼드", "브라이턴", "첼시", "코번트리 시티", "크리스털 팰리스", "에버턴", "풀럼", "헐 시티", "입스위치 타운", "리즈 유나이티드", "리버풀", "맨체스터 시티", "맨체스터 유나이티드", "뉴캐슬 유나이티드", "노팅엄 포레스트", "선덜랜드", "토트넘"]},
 {tier:2,name:'챔피언십',clubs:['레스터 시티','사우샘프턴','플리머스 아가일','노리치 시티','미들즈브러','웨스트 브로미치','셰필드 유나이티드','왓퍼드','코번트리 시티','브리스톨 시티','더비 카운티','스완지 시티','스토크 시티','퀸즈 파크 레인저스','밀월','프레스턴 노스 엔드','블랙번 로버스','카디프 시티','옥스퍼드 유나이티드','포츠머스','헐 시티','찰턴 애슬레틱','버밍엄 시티','셰필드 웬즈데이']},
 {tier:3,name:'리그 원',clubs:['렉섬','볼턴 원더러스','허더즈필드 타운','레딩','위건 애슬레틱','반즐리','블랙풀','링컨 시티','칼라일 유나이티드','피터버러 유나이티드','로더럼 유나이티드','맨스필드 타운','스톡포트 카운티','위컴 원더러스','레이턴 오리엔트','엑서터 시티','노샘프턴 타운','브리스톨 로버스','크롤리 타운','버턴 앨비언','케임브리지 유나이티드','슈루즈버리 타운','스티버니지','루턴 타운']},
 {tier:4,name:'리그 투',clubs:['브래드퍼드 시티','노츠 카운티','돈캐스터 로버스','윔블던','그림즈비 타운','질링엄','콜체스터 유나이티드','스윈던 타운','체스터필드','살퍼드 시티','플릿우드 타운','뉴포트 카운티','크루 알렉산드라','트랜미어 로버스','배로','애크링턴 스탠리','하로게이트 타운','모어캠','올덤 애슬레틱','브롬리','첼트넘 타운','바넷','포트 베일','체스터']},
 {tier:5,name:'내셔널리그',clubs:['요크 시티','올더숏 타운','로치데일','포리스트 그린 로버스','사우스엔드 유나이티드','하틀풀 유나이티드','게이츠헤드','탬워스','보스턴 유나이티드','솔리헐 무어스','이스트레이','올트링엄','메이든헤드 유나이티드','엡스플리트 유나이티드','웰드스톤','브레인트리 타운','서튼 유나이티드','다겐햄 앤 레드브리지','요빌 타운','워킹','파슬리 셀틱','스컨소프 유나이티드','브랙리 타운','워링턴 타운']},
 {tier:6,name:'내셔널리그 노스',clubs:['스카버러 애슬레틱','달링턴','킹스린 타운','블라이스 스파르탄스','사우스 실즈','스페니무어 타운','커즌 애슈턴','마린','벅스턴','래드클리프','매클스필드','휘트비 타운','리밍턴','헤리퍼드','알프레턴 타운','게인즈버러 트리니티','스태퍼드 레인저스','애서턴 콜리에리스','랜캐스터 시티','하이드 유나이티드','워킹턴','매틀록 타운','워링턴 라이랜즈','밤버 브리지']},
 {tier:7,name:'내셔널리그 사우스',clubs:['첼름스퍼드 시티','토키 유나이티드','웨이머스','슬라우 타운','도버 애슬레틱','톤브리지 엔젤스','메이드스톤 유나이티드','치펜햄 타운','바스 시티','세인트 앨번스 시티','햄프턴 앤 리치먼드','헨던','하번트 앤 워털루빌','이스트본 버러','웰링 유나이티드','엔필드 타운','도체스터 타운','풀 타운','판버러','웨스턴 슈퍼메어','트루로 시티','체셤 유나이티드','윙게이트 앤 핀칠리','보그너 리지스 타운']}
];
export const leagueForTier=t=>leagueData.find(x=>x.tier===t);
export const clubTier=club=>leagueData.find(l=>l.clubs.includes(club))?.tier ?? 5;
export const allClubs=leagueData.flatMap(l=>l.clubs.map(name=>({name,tier:l.tier,league:l.name})));
export function shuffled(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
export function roundRobin(teams){let list=[...teams];if(list.length%2)list.push('BYE');const n=list.length, rounds=[];for(let r=0;r<n-1;r++){const games=[];for(let i=0;i<n/2;i++){const a=list[i],b=list[n-1-i];if(a!=='BYE'&&b!=='BYE')games.push({home:r%2===0?a:b,away:r%2===0?b:a});}rounds.push(games);list=[list[0],list[n-1],...list.slice(1,n-1)];}return [...rounds,...rounds.map(r=>r.map(g=>({home:g.away,away:g.home})))];}
// 2026-27 시즌 경기일: A매치 기간과 연말 휴식기를 비워 실제 유럽 리그의 흐름에 가깝게 배치한다.
function domesticMatchdayOffsets(clubs,roundCount){
 const has=(name)=>clubs.includes(name);
 // 7월 1일을 day 0으로 계산. 리그별 개막 시점을 반영한다.
 const start=has('바이에른 뮌헨')?58:has('레알 마드리드')?44:(has('인터 밀란')||has('파리 생제르맹'))?53:45;
 const blocked=[
  [85,90],   // 9월 말~10월 초 A매치 기간의 경기 주말 1회 휴식
  [134,139], // 11월 A매치 기간의 경기 주말 1회 휴식
  [183,188], // 연말·연초 겨울 휴식기 주말 1회 휴식
  [267,272]  // 3월 A매치 기간의 경기 주말 1회 휴식
 ];
 const dates=[];let day=start;
 while(dates.length<roundCount&&day<380){
  if(!blocked.some(([a,b])=>day>=a&&day<=b))dates.push(day);
  day+=7;
 }
 return dates;
}
export function createSeasonFromClubs(clubs,club,season=1,tag='F'){
 const teams=shuffled(clubs.filter(x=>x!==club).concat(club));
 const rr=roundRobin(teams), offsets=domesticMatchdayOffsets(clubs,rr.length);
 const leagueFixtures=rr.flatMap((round,i)=>round.filter(g=>g.home===club||g.away===club).map(g=>({id:`${tag}${season}-${i}-${g.home}`,type:'리그',round:i+1,day:offsets[i],home:g.home===club,opponent:g.home===club?g.away:g.home,played:false,active:true})));
 return leagueFixtures.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
}
export function createSeason(tier,club,season=1){
 const l=leagueForTier(tier), fixtures=createSeasonFromClubs(l.clubs,club,season,`L${tier}-`);
 if(tier<=7)fixtures.push({id:'FA1',type:'FA컵',round:1,day:150,home:Math.random()>.5,opponent:shuffled(l.clubs.filter(x=>x!==club))[0],played:false,active:true});
 if(tier<=4)fixtures.push({id:'CC1',type:'카라바오컵',round:1,day:72,home:Math.random()>.5,opponent:shuffled(l.clubs.filter(x=>x!==club))[0],played:false,active:true});
 return fixtures.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
}

// 해외 주요 리그 국내 컵대회 일정. 잉글랜드(PL)의 FA컵·카라바오컵은 기존 구조를 유지한다.
export function createForeignDomesticCupFixtures(leagueName,club,season=1,clubs=[]){
 const pool=(clubs||[]).filter(x=>x!==club);
 const pick=(source=pool,exclude=club)=>shuffled(source.filter(x=>x!==exclude))[0]||source.find(x=>x!==exclude)||'상대 팀';
 const fixture=(id,type,round,day,opponent,home=true,participants)=>({id:`${id}-${season}`,type,round,day,opponent,home,participants,played:false,active:true});
 const fixtures=[];const status={};
 const configs={
  '라리가':{main:'코파 델 레이',day:135,super:'수페르코파 데 에스파냐',superMode:'four',superDay:190},
  '분데스리가':{main:'DFB-포칼',day:45,super:'DFL-슈퍼컵',superMode:'two',superDay:45},
  '세리에 A':{main:'코파 이탈리아',day:95,super:'수페르코파 이탈리아나',superMode:'four',superDay:190},
  '리그 1':{main:'쿠프 드 프랑스',day:100,super:'트로페 데 샹피옹',superMode:'two',superDay:10},
  '에레디비시':{main:'KNVB 베커르',day:110,super:'요한 크라위프 스할',superMode:'two',superDay:10},
  '프리메이라리가':{main:'타사 드 포르투갈',day:100,super:'수페르타사 칸디두 드 올리베이라',superMode:'two',superDay:10},
  '스코티시 프리미어십':{main:'스코티시 컵',day:140,secondary:'스코티시 리그 컵',secondaryDay:45},
  '프로 리그':{main:'벨기에 컵',day:110,super:'벨기에 슈퍼컵',superMode:'two',superDay:10},
  '쉬페르리그':{main:'튀르키예 쿠파스',day:110,super:'튀르키예 슈퍼컵',superMode:'two',superDay:10}
 };
 const config=configs[leagueName];if(!config)return {fixtures,status};
 status[config.main]='진행 중';fixtures.push(fixture(`${config.main}-R1`,config.main,'1라운드',config.day,pick(),Math.random()>.5));
 if(config.secondary){status[config.secondary]='진행 중';fixtures.push(fixture(`${config.secondary}-R1`,config.secondary,'그룹 스테이지',config.secondaryDay,pick(),Math.random()>.5));}
 if(config.super){
  const superTeams=(clubs||[]).slice(0,config.superMode==='four'?4:2);
  if(superTeams.includes(club)){
   status[config.super]='진행 중';
   if(config.superMode==='four'){
    const opponent=pick(superTeams,club);
    fixtures.push(fixture(`${config.super}-SEMI`,config.super,'준결승',config.superDay,opponent,Math.random()>.5,superTeams));
   }else{
    fixtures.push(fixture(`${config.super}-FINAL`,config.super,'결승',config.superDay,pick(superTeams,club),Math.random()>.5,superTeams));
   }
  }else status[config.super]='불참';
 }
 return {fixtures,status};
}

export function freshTable(tier,club){const names=leagueForTier(tier).clubs.filter(name=>name!==club);return [...names,club].map(name=>({name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));}
export function freshTableFromClubs(clubs){return clubs.map(name=>({name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));}


// V2: 유럽 주요 리그 데이터와 클럽별 대표 선수
export const europeanLeagues = [
 {country:'스페인',name:'라리가',clubs:["레알 마드리드", "바르셀로나", "아틀레티코 마드리드", "아틀레틱 클루브", "레알 소시에다드", "비야레알", "레알 베티스", "세비야", "발렌시아", "셀타 비고", "오사수나", "헤타페", "알라베스", "엘체", "레반테", "에스파뇰", "말라가", "라싱 산탄데르", "데포르티보 라코루냐", "라요 바예카노"]},
 {country:'독일',name:'분데스리가',clubs:["바이에른 뮌헨", "보루시아 도르트문트", "RB 라이프치히", "바이어 레버쿠젠", "슈투트가르트", "아인트라흐트 프랑크푸르트", "프라이부르크", "호펜하임", "마인츠", "아우크스부르크", "우니온 베를린", "묀헨글라트바흐", "함부르크", "쾰른", "베르더 브레멘", "샬케 04", "엘버스베르크", "파더보른"]},
 {country:'이탈리아',name:'세리에 A',clubs:["인터 밀란", "AC 밀란", "유벤투스", "나폴리", "AS 로마", "아탈란타", "볼로냐", "피오렌티나", "라치오", "토리노", "코모", "제노아", "칼리아리", "파르마", "사수올로", "우디네세", "레체", "프로시노네", "몬차", "베네치아"]},
 {country:'프랑스',name:'리그 1',clubs:["파리 생제르맹", "마르세유", "AS 모나코", "릴", "리옹", "랑스", "스트라스부르", "렌", "니스", "브레스트", "툴루즈", "파리 FC", "로리앙", "오세르", "트루아", "르망", "앙제", "르아브르"]},
 {country:'네덜란드',name:'에레디비시',clubs:['아약스','PSV 에인트호번','페예노르트','AZ 알크마르','트벤테','위트레흐트','고 어헤드 이글스','헤렌벤','스파르타 로테르담','네이메헌','흐로닝언','즈볼러','헤라클레스','포르투나 시타르트','빌럼 II','브레다','텔스타','엑셀시오르']},
 {country:'포르투갈',name:'프리메이라리가',clubs:['벤피카','포르투','스포르팅 CP','브라가','비토리아 기마랑이스','모레이렌스','파말리캉','카사 피아','히우 아브','보아비스타','길 비센트','산타 클라라','에스토릴','아로카','나시오날','AVS']},
 {country:'스코틀랜드',name:'스코티시 프리미어십',clubs:['셀틱','레인저스','하츠','애버딘','던디 유나이티드','하이버니언','마더웰','세인트 미렌','킬마녹','로스 카운티','던디 FC','리빙스턴']},
 {country:'벨기에',name:'프로 리그',clubs:['클럽 브뤼헤','안더레흐트','위니옹 생질루아즈','헹크','앤트워프','헨트','브뤼헤','메헬렌','샤를루아','스탕다르 리에주','베스테를로','신트트라위던']},
 {country:'튀르키예',name:'쉬페르리그',clubs:['갈라타사라이','페네르바흐체','베식타시','트라브존스포르','바샥셰히르','아다나 데미르스포르','삼순스포르','안탈리아스포르','카심파샤','리제스포르','괴즈테페','코니아스포르']}
];
export const allEuropeanClubs=europeanLeagues.flatMap(l=>l.clubs.map(name=>({...l,name})));
export const starPlayers={
 "아스널":"부카요 사카",
 "애스턴 빌라":"존 맥긴",
 "본머스":"에바니우송",
 "브렌트퍼드":"이고르 티아고",
 "브라이턴":"미토마 카오루",
 "첼시":"콜 파머",
 "코번트리 시티":"하지 라이트",
 "크리스털 팰리스":"아담 워튼",
 "에버턴":"조던 픽퍼드",
 "풀럼":"알렉스 이워비",
 "헐 시티":"모하메드 벨루미",
 "입스위치 타운":"훌리오 엔시소",
 "리즈 유나이티드":"에단 암파두",
 "리버풀":"플로리안 비르츠",
 "맨체스터 시티":"엘링 홀란",
 "맨체스터 유나이티드":"브루노 페르난데스",
 "뉴캐슬 유나이티드":"요안 위사",
 "노팅엄 포레스트":"모건 깁스화이트",
 "선덜랜드":"그라니트 자카",
 "토트넘":"사비 시몬스",
 "레알 마드리드":"킬리안 음바페",
 "바르셀로나":"라민 야말",
 "아틀레티코 마드리드":"훌리안 알바레스",
 "아틀레틱 클루브":"니코 윌리엄스",
 "레알 소시에다드":"미켈 오야르사발",
 "비야레알":"알렉스 바에나",
 "레알 베티스":"이스코",
 "세비야":"유수프 포파나",
 "발렌시아":"호세 가야",
 "셀타 비고":"이아고 아스파스",
 "오사수나":"안테 부디미르",
 "헤타페":"마우로 아람바리",
 "알라베스":"안토니오 블랑코",
 "엘체":"라파 미르",
 "레반테":"이반 로메로",
 "에스파뇰":"하비 푸아도",
 "말라가":"다니 로렌소",
 "라싱 산탄데르":"이니고 비센테",
 "데포르티보 라코루냐":"루카스 페레스",
 "라요 바예카노":"이시 팔라손",
 "인터 밀란":"라우타로 마르티네스",
 "AC 밀란":"하파엘 레앙",
 "유벤투스":"케난 일디즈",
 "나폴리":"스콧 맥토미니",
 "AS 로마":"파울로 디발라",
 "아탈란타":"샤를 더케텔라러",
 "볼로냐":"리카르도 오르솔리니",
 "피오렌티나":"모이세 킨",
 "라치오":"마티아 자카니",
 "토리노":"두반 사파타",
 "코모":"니코 파스",
 "제노아":"루슬란 말리노우스키",
 "칼리아리":"세바스티아노 에스포지토",
 "파르마":"아드리안 베르나베",
 "사수올로":"도메니코 베라르디",
 "우디네세":"로렌초 루카",
 "레체":"니콜라 크르스토비치",
 "프로시노네":"안토니오 라이몬도",
 "몬차":"구스타보 바렐라",
 "베네치아":"요엘 포흐얀팔로",
 "바이에른 뮌헨":"해리 케인",
 "보루시아 도르트문트":"세루 기라시",
 "RB 라이프치히":"얀 디오만데",
 "바이어 레버쿠젠":"파트리크 시크",
 "슈투트가르트":"데니스 운다브",
 "아인트라흐트 프랑크푸르트":"위고 에키티케",
 "프라이부르크":"빈첸초 그리포",
 "호펜하임":"안드레이 크라마리치",
 "마인츠":"나디엠 아미리",
 "아우크스부르크":"알렉시 클로드모리스",
 "우니온 베를린":"로베르트 스코프",
 "묀헨글라트바흐":"알라산 플레아",
 "함부르크":"파비오 비에이라",
 "쾰른":"린톤 마이나",
 "베르더 브레멘":"마르빈 두크슈",
 "샬케 04":"케난 카라만",
 "엘버스베르크":"파울 바너",
 "파더보른":"스벤 미헬",
 "파리 생제르맹":"우스만 뎀벨레",
 "마르세유":"메이슨 그린우드",
 "AS 모나코":"마그네스 아클리우슈",
 "릴":"에돈 제그로바",
 "리옹":"라얀 셰르키",
 "랑스":"플로리안 소토카",
 "스트라스부르":"엠마누엘 에메가",
 "렌":"아민 구이리",
 "니스":"테렘 모피",
 "브레스트":"뤼도빅 아조르크",
 "툴루즈":"얀 보호",
 "파리 FC":"일란 케발",
 "로리앙":"로랑 아베르겔",
 "오세르":"라신 시나요코",
 "트루아":"마마 발데",
 "르망":"마마두 사마사",
 "앙제":"히마드 압델리",
 "르아브르":"압둘라예 투레"
};
export const starPlayerPositions={"아스널": "RW", "애스턴 빌라": "CM", "본머스": "ST", "브렌트퍼드": "ST", "브라이턴": "LW", "첼시": "AM", "코번트리 시티": "ST", "크리스털 팰리스": "CM", "에버턴": "GK", "풀럼": "AM", "헐 시티": "RW", "입스위치 타운": "AM", "리즈 유나이티드": "DM", "리버풀": "AM", "맨체스터 시티": "ST", "맨체스터 유나이티드": "AM", "뉴캐슬 유나이티드": "ST", "노팅엄 포레스트": "AM", "선덜랜드": "CM", "토트넘": "AM", "레알 마드리드": "ST", "바르셀로나": "RW", "아틀레티코 마드리드": "ST", "아틀레틱 클루브": "LW", "레알 소시에다드": "FW", "비야레알": "AM", "레알 베티스": "AM", "세비야": "CM", "발렌시아": "LB", "셀타 비고": "FW", "오사수나": "ST", "헤타페": "CM", "알라베스": "DM", "엘체": "ST", "레반테": "ST", "에스파뇰": "FW", "말라가": "AM", "라싱 산탄데르": "AM", "데포르티보 라코루냐": "FW", "라요 바예카노": "AM", "인터 밀란": "ST", "AC 밀란": "LW", "유벤투스": "LW", "나폴리": "CM", "AS 로마": "AM", "아탈란타": "AM", "볼로냐": "RW", "피오렌티나": "ST", "라치오": "LW", "토리노": "ST", "코모": "AM", "제노아": "AM", "칼리아리": "FW", "파르마": "CM", "사수올로": "RW", "우디네세": "ST", "레체": "ST", "프로시노네": "ST", "몬차": "ST", "베네치아": "ST", "바이에른 뮌헨": "ST", "보루시아 도르트문트": "ST", "RB 라이프치히": "LW", "바이어 레버쿠젠": "ST", "슈투트가르트": "ST", "아인트라흐트 프랑크푸르트": "ST", "프라이부르크": "LW", "호펜하임": "FW", "마인츠": "AM", "아우크스부르크": "AM", "우니온 베를린": "LW", "묀헨글라트바흐": "FW", "함부르크": "AM", "쾰른": "LW", "베르더 브레멘": "ST", "샬케 04": "FW", "엘버스베르크": "AM", "파더보른": "ST", "파리 생제르맹": "RW", "마르세유": "RW", "AS 모나코": "AM", "릴": "RW", "리옹": "AM", "랑스": "FW", "스트라스부르": "ST", "렌": "FW", "니스": "ST", "브레스트": "ST", "툴루즈": "FW", "파리 FC": "AM", "로리앙": "CM", "오세르": "FW", "트루아": "FW", "르망": "GK", "앙제": "CM", "르아브르": "CM"};
export const badgeColors=['#c8102e','#034694','#6cabdd','#d71920','#fdb913','#0057b8','#1b458f','#7a263a','#e03a3e','#111111','#00804a','#f5c400'];

// 해외 리그 2부 리그 데이터: 각 국가별 승격·강등을 독립적으로 시뮬레이션한다.
export const europeanSecondDivisions = {
 '라리가':['알메리아','그라나다','레알 바야돌리드','에이바르','레알 사라고사','스포르팅 히혼','라싱 산탄데르','레반테 B','카스테욘','부르고스','엘덴세','미란데스','우에스카','테네리페','코르도바','데포르티보 라 코루냐','말라가','카디스'],
 '분데스리가':['샬케 04','헤르타 베를린','하노버 96','카이저슬라우테른','뒤셀도르프','뉘른베르크','파더보른','카를스루에','엘버스베르크','그로이터 퓌르트','마그데부르크','브라운슈바이크','프로이센 뮌스터','울름','레겐스부르크','다름슈타트','한자 로스토크','아르미니아 빌레펠트'],
 '세리에 A':['삼프도리아','팔레르모','스페치아','바리','브레시아','레지아나','모데나','카탄차로','체세나','수드티롤','시타델라','만토바','살레르니타나','크레모네세 B','엔텔라','페스카라','아벨리노','유베 스타비아'],
 '리그 1':['생테티엔','보르도','생테티엔 B','로리앙 B','갱강','캉','파리 FC','앙시','아미앵','그르노블','바스티아','됭케르크','레드 스타','클레르몽','로데즈','포','트루아','라발'],
 '에레디비시':['ADO 덴하흐','로다 JC','캄뷔르','도르드레흐트','덴 보스','헬몬트 스포르트','마스트리흐트','에먼','FC 아인트호벤','VVV 펜로','오스','용 아약스','용 PSV','용 위트레흐트','용 AZ','용 알메러','텔스타 B','엑셀시오르 B'],
 '프리메이라리가':['마리티무','톤델라','아카데미쿠 비제우','페나피엘','레이숑이스','페헤이라','올리베이렌스','페이렌스','마프라','토렌스','포르티모넨스','차베스','아카데미쿠 코임브라','펠게이라스','비젤라','파렌스'],
 '스코티시 프리미어십':['파틱 시슬','던펌린 애슬레틱','레이스 로버스','에어 유나이티드','퀸즈 파크','그리녹 모턴','아브로스','던디 유나이티드 B','인버네스','해밀턴','앨로아 애슬레틱','퀸 오브 더 사우스'],
 '프로 리그':['베이르스홋','OH 뢰번','세라잉','RFC 리에주','로멜 SK','비르스호트','패트로 아이스던','딘제','로케런','데인즈','코르트레이크','바슬란트 베베런'],
 '쉬페르리그':['이스탄불스포르','괴즈테페 B','코카엘리스포르','에르주룸스포르','반디르마스포르','볼루스포르','코룸 FK','움라니예스포르','케치외렌귀추','마니사 FK','사카리아스포르','아다나스포르','산리우르파스포르','앙카라귀쥐','겐츨레르비를리이','에로크스포르']
};

export function createEuropeanWorld(){
 return Object.fromEntries(europeanLeagues.map(l=>[l.name,{country:l.country,top:[...l.clubs],second:[...(europeanSecondDivisions[l.name]||[])],lastMovement:[],season:1}]));
}

export function simulateEuropeanWorld(world,season){
 const next={};
 for(const [leagueName,entry] of Object.entries(world||createEuropeanWorld())){
  const topRank=[...entry.top].map(name=>({name,score:Math.random()*100})).sort((a,b)=>b.score-a.score);
  const secondRank=[...entry.second].map(name=>({name,score:Math.random()*100})).sort((a,b)=>b.score-a.score);
  const promoted=secondRank.slice(0,2).map(x=>x.name);
  const relegated=topRank.slice(-2).map(x=>x.name);
  const movement=[...promoted.map(name=>({club:name,direction:'승격',from:2,to:1})),...relegated.map(name=>({club:name,direction:'강등',from:1,to:2}))];
  next[leagueName]={...entry,top:[...topRank.slice(0,-2).map(x=>x.name),...promoted],second:[...secondRank.slice(2).map(x=>x.name),...relegated],lastMovement:movement,season};
 }
 return next;
}
