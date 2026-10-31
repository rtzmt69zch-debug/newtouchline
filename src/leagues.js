export const seasonLabel='2026-27';
export const leagueData = [
 {tier:1,name:'프리미어리그',clubs:['아스널','애스턴 빌라','본머스','브렌트퍼드','브라이턴','첼시','코번트리 시티','크리스털 팰리스','에버턴','풀럼','헐 시티','입스위치 타운','리즈 유나이티드','리버풀','맨체스터 시티','맨체스터 유나이티드','뉴캐슬 유나이티드','노팅엄 포레스트','선덜랜드','토트넘']},
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
export function createSeasonFromClubs(clubs,club,season=1,tag='F'){
 const teams=shuffled(clubs.filter(x=>x!==club).concat(club));
 const rr=roundRobin(teams), leagueFixtures=rr.flatMap((round,i)=>round.filter(g=>g.home===club||g.away===club).map(g=>({id:`${tag}${season}-${i}-${g.home}`,type:'리그',round:i+1,day:7*(i+1),home:g.home===club,opponent:g.home===club?g.away:g.home,played:false,active:true})));
 return leagueFixtures.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
}
export function createSeason(tier,club,season=1){
 const l=leagueForTier(tier), fixtures=createSeasonFromClubs(l.clubs,club,season,`L${tier}-`);
 if(tier<=7)fixtures.push({id:'FA1',type:'FA컵',round:1,day:45,home:Math.random()>.5,opponent:shuffled(l.clubs.filter(x=>x!==club))[0],played:false,active:true});
 if(tier<=4)fixtures.push({id:'CC1',type:'카라바오컵',round:1,day:30,home:Math.random()>.5,opponent:shuffled(l.clubs.filter(x=>x!==club))[0],played:false,active:true});
 return fixtures.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
}
export function freshTable(tier,club){const names=leagueForTier(tier).clubs.filter(name=>name!==club);return [...names,club].map(name=>({name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));}
export function freshTableFromClubs(clubs){return clubs.map(name=>({name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));}


// V2: 유럽 주요 리그 데이터와 클럽별 대표 선수
export const europeanLeagues = [
 {country:'스페인',name:'라리가',clubs:['레알 마드리드','바르셀로나','아틀레티코 마드리드','아틀레틱 클루브','레알 소시에다드','비야레알','레알 베티스','세비야','발렌시아','지로나','셀타 비고','오사수나','헤타페','마요르카','라요 바예카노','에스파뇰','레반테','엘체','알라베스','레알 오비에도']},
 {country:'독일',name:'분데스리가',clubs:['바이에른 뮌헨','보루시아 도르트문트','바이어 레버쿠젠','RB 라이프치히','아인트라흐트 프랑크푸르트','슈투트가르트','프라이부르크','호펜하임','볼프스부르크','마인츠','묀헨글라트바흐','베르더 브레멘','아우크스부르크','우니온 베를린','쾰른','함부르크','장크트파울리','하이덴하임']},
 {country:'이탈리아',name:'세리에 A',clubs:['인터 밀란','AC 밀란','유벤투스','나폴리','AS 로마','라치오','아탈란타','피오렌티나','볼로냐','토리노','우디네세','제노아','칼리아리','파르마','코모','레체','베로나','사수올로','피사','크레모네세']},
 {country:'프랑스',name:'리그 1',clubs:['파리 생제르맹','마르세유','모나코','릴','리옹','니스','랑스','렌','스트라스부르','툴루즈','낭트','몽펠리에','브레스트','로리앙','르아브르','오세르','메스','앙제']},
 {country:'네덜란드',name:'에레디비시',clubs:['아약스','PSV 에인트호번','페예노르트','AZ 알크마르','트벤테','위트레흐트','고 어헤드 이글스','헤렌벤','스파르타 로테르담','네이메헌','흐로닝언','즈볼러','헤라클레스','포르투나 시타르트','빌럼 II','브레다','텔스타','엑셀시오르']},
 {country:'포르투갈',name:'프리메이라리가',clubs:['벤피카','포르투','스포르팅 CP','브라가','비토리아 기마랑이스','모레이렌스','파말리캉','카사 피아','히우 아브','보아비스타','길 비센트','산타 클라라','에스토릴','아로카','나시오날','AVS']},
 {country:'스코틀랜드',name:'스코티시 프리미어십',clubs:['셀틱','레인저스','하츠','애버딘','던디 유나이티드','하이버니언','마더웰','세인트 미렌','킬마녹','로스 카운티','던디 FC','리빙스턴']},
 {country:'벨기에',name:'프로 리그',clubs:['클럽 브뤼헤','안더레흐트','위니옹 생질루아즈','헹크','앤트워프','헨트','브뤼헤','메헬렌','샤를루아','스탕다르 리에주','베스테를로','신트트라위던']},
 {country:'튀르키예',name:'쉬페르리그',clubs:['갈라타사라이','페네르바흐체','베식타시','트라브존스포르','바샥셰히르','아다나 데미르스포르','삼순스포르','안탈리아스포르','카심파샤','리제스포르','괴즈테페','코니아스포르']}
];
export const allEuropeanClubs=europeanLeagues.flatMap(l=>l.clubs.map(name=>({...l,name})));
export const starPlayers={
 '리버풀':'플로리안 비르츠','아스널':'부카요 사카','맨체스터 시티':'엘링 홀란','첼시':'모이세스 카이세도','맨체스터 유나이티드':'브루노 페르난데스','토트넘':'산드로 토날리','뉴캐슬 유나이티드':'루이스 홀','애스턴 빌라':'올리 왓킨스','브라이턴':'미토마 가오루','레알 마드리드':'킬리안 음바페','바르셀로나':'라민 야말','아틀레티코 마드리드':'앙투안 그리즈만','바이에른 뮌헨':'해리 케인','보루시아 도르트문트':'율리안 브란트','바이어 레버쿠젠':'플로리안 비르츠','인터 밀란':'라우타로 마르티네스','AC 밀란':'하파엘 레앙','유벤투스':'두샨 블라호비치','나폴리':'로멜루 루카쿠','파리 생제르맹':'우스만 뎀벨레','마르세유':'메이슨 그린우드','아약스':'요렐 하토','PSV 에인트호번':'루크 더용','페예노르트':'산티아고 히메네스','벤피카':'앙헬 디 마리아','포르투':'사무 오모로디온','스포르팅 CP':'빅토르 요케레스','셀틱':'칼럼 맥그리거','레인저스':'제임스 태버니어','갈라타사라이':'빅터 오시멘','페네르바흐체':'에딘 제코'
};
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
