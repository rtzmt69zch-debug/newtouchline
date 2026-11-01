import {allClubs,leagueData,clubTier,leagueForTier,createSeason,createSeasonFromClubs,freshTable,freshTableFromClubs,shuffled,allEuropeanClubs,europeanLeagues,createEuropeanWorld,simulateEuropeanWorld,createForeignDomesticCupFixtures} from './leagues.js';
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const fanNames=['Kop1892','안필드의밤','전술보는콥','레즈의심장','YNWA_RED','콥의하루','메인스탠드','축구는전술','붉은파도','머지사이드콥','풀타임콥','이스탄불의기억','더콥','축잘알콥','리버풀은낭만','원정석콥','풋볼헤드','압박중독','콥의분노','레전드의길','하프스페이스','전술연구소','주말의콥','안필드수호자','레즈1892','콥스타임','축구읽는밤','풋볼매니아','붉은심장','KOP_END'];
const fanLines={win:['이게 우리가 원하던 경기력이지!','압박 타이밍이 완벽했다. 감독 전술 적중','오늘은 경기 내내 주도권을 잡았네','이 팀 진짜 달라졌다. 다음 경기도 기대','교체 카드가 신의 한 수였음','이런 경기력이면 유럽도 노려볼 만하다','선수들 표정부터 달라졌어','오늘 MOM은 감독이다','깔끔한 승리. 군더더기가 없었다','상대가 뭘 해보지도 못했네'],draw:['이길 수 있었는데 마지막이 아쉽다','승점 1점은 챙겼지만 결정력이 문제','경기력은 괜찮았는데 마무리가 아쉽네','교체 타이밍이 조금 늦었던 듯','다음 경기에서 만회하자','상대 수비가 생각보다 단단했음','무패 흐름은 이어갔으니 다행','후반 운영을 다시 봐야 할 듯'],lose:['이 경기력으로 어떻게 버티냐','전술 수정이 필요해 보인다','수비 집중력이 너무 아쉬웠다','이대로면 감독 자리도 위험하겠는데','다음 경기엔 확실히 달라져야 한다','공격 전개가 너무 단조로웠음','선수 교체가 결과를 바꾸지 못했다','오늘은 상대가 한 수 위였다']};
const clubFanNames={
 '맨체스터 유나이티드':['OT의붉은악마','글로리글로리','퍼거슨의아이들','레드데빌1892','올드트래퍼드콥','맨유는맨유','붉은악마MUTV'],
 '맨체스터 시티':['푸른달의시민','시티즌블루','블루문라이징','에티하드직관러','시티zens','하늘색심장'],
 '리버풀':['Kop1892','안필드의밤','이스탄불의기억','YNWA_RED','콥의심장','더콥','레즈1892'],
 '아스널':['구너의북런던','COYG_구너','에미레이츠의밤','무패의추억','구너하트'],
 '첼시':['블루스포에버','스탬퍼드블루','첼시의푸른심장','킹스로드블루'],
 '토트넘':['릴리화이트','COYS_북런던','토트넘홋스퍼콕','화이트하트레인'],
 '뉴캐슬 유나이티드':['툰아미','세인트제임스의밤','흑백줄무늬','조르디의심장'],
 '에버턴':['구디슨의푸른벽','Toffees1878','블루스의자존심']
};
function makeFanReactions(win,draw,club=''){const themed=clubFanNames[club]||[];const pool=shuffled([...themed,...fanNames]);const lines=shuffled(fanLines[win?'win':draw?'draw':'lose']);return pool.slice(0,5).map((name,i)=>[name,lines[i%lines.length]]);}
const EURO_LEAGUE_MATCHDAYS=[[9,8],[10,13],[10,20],[11,3],[11,24],[12,8],[1,19],[1,27]];
function euroDayOffset(seasonStartYear,month,day){const calendarYear=month>=7?seasonStartYear:seasonStartYear+1;return Math.round((Date.UTC(calendarYear,month-1,day)-Date.UTC(seasonStartYear,6,1))/86400000);}
function europeanDraw(competition,season,club,seededTeams=[]){
 const countryOf=name=>premierLeague2025_26[name]?'잉글랜드':(allEuropeanClubs.find(x=>x.name===name)?.country||'기타');
 const clubCountry=countryOf(club);
 const seeded=[...new Set([club,...seededTeams].filter(Boolean))];
 const pool=shuffled([...new Set(allEuropeanClubs.map(x=>x.name).filter(n=>!seeded.includes(n)))]);
 const participants=[...seeded,...pool].slice(0,36).sort((a,b)=>{const score=name=>{const r=clubRatings(name,1);return (r.공격+r.중원+r.수비)/3;};return score(b)-score(a)||a.localeCompare(b);});
 const pots=Array.from({length:4},(_,i)=>participants.slice(i*9,(i+1)*9));
 const opponents=[];const countryCounts={};
 for(let potIndex=0;potIndex<4;potIndex++){
  const candidates=shuffled(pots[potIndex].filter(name=>name!==club));const selected=[];
  for(const candidate of candidates){const country=countryOf(candidate);if(country===clubCountry||(countryCounts[country]||0)>=2||selected.some(x=>x.country===country))continue;selected.push({name:candidate,country});if(selected.length===2)break;}
  if(selected.length<2){for(const candidate of candidates){if(selected.some(x=>x.name===candidate))continue;const country=countryOf(candidate);if(country===clubCountry||(countryCounts[country]||0)>=2)continue;selected.push({name:candidate,country});if(selected.length===2)break;}}
  if(selected.length<2){for(const candidate of candidates){if(selected.some(x=>x.name===candidate))continue;const country=countryOf(candidate);selected.push({name:candidate,country});if(selected.length===2)break;}}
  selected.forEach((o,i)=>{countryCounts[o.country]=(countryCounts[o.country]||0)+1;opponents.push({name:o.name,pot:potIndex+1,home:i===0});});
 }
 const seasonYear=2026+Math.max(0,(Number(season)||1)-1);const fixtures=opponents.map((o,i)=>({id:`EU-${season}-${i}`,type:competition,round:'리그 페이즈',matchday:i+1,day:euroDayOffset(seasonYear,...EURO_LEAGUE_MATCHDAYS[i]),home:o.home,opponent:o.name,pot:o.pot,played:false,active:true}));
 const table=participants.map((name,i)=>({name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,pot:Math.min(4,Math.floor(participants.indexOf(name)/9)+1),ai:name!==club}));
 return {fixtures,table,pots:pots.map((teams,i)=>({pot:i+1,teams})),club,competition,season,stage:'리그 페이즈',playoff:null,knockoutHistory:[]};
}
function europeanFixtures(competition,season,club){return europeanDraw(competition,season,club).fixtures;}

// Compact Korean won formatter: use numeric Korean units (e.g. 1000억, not 천억)
// and keep at most two significant digits so transfer fees and budgets stay readable.
export const money=value=>{
 const raw=Number(value);
 if(!Number.isFinite(raw))return '0원';
 const sign=raw<0?'-':'';
 const n=Math.abs(raw);
 if(n<10000)return sign+new Intl.NumberFormat('ko-KR',{maximumFractionDigits:0}).format(Math.round(n))+'원';
 const units=[{size:1e12,label:'조'},{size:1e8,label:'억'},{size:1e4,label:'만'}];
 let unit=units.find(x=>n>=x.size)||units[units.length-1];
 let scaled=Number((n/unit.size).toPrecision(2));
 // Promote after rounding at a unit boundary (e.g. 9999억 -> 1조).
 if(scaled>=10000){const index=units.indexOf(unit);if(index>0){unit=units[index-1];scaled=Number((n/unit.size).toPrecision(2));}}
 const formatted=Number.isInteger(scaled)?String(scaled):scaled.toFixed(1).replace(/\.0$/,'');
 return `${sign}${formatted}${unit.label}`;
};
const routeProfiles={legend:{name:'전설적인 선수 출신',base:67,boost:{전술:4,선수관리:7,경기분석:3,동기부여:9,유소년육성:1,위기관리:5}},youth:{name:'유소년 지도자 출신',base:54,boost:{전술:2,선수관리:4,경기분석:2,동기부여:3,유소년육성:12,위기관리:2}},license:{name:'자격증부터 시작',base:47,boost:{전술:3,선수관리:2,경기분석:6,동기부여:2,유소년육성:3,위기관리:2}},unknown:{name:'무명 감독',base:38,boost:{전술:1,선수관리:1,경기분석:2,동기부여:1,유소년육성:2,위기관리:1}}};
const tiersSalary=[0,7800000000,3600000000,1800000000,1000000000,500000000,250000000,180000000];
function salaryFor(tier,rep,club=''){const prestige=clubPrestige[club]??Math.max(30,72-(tier-1)*6);const finance=clamp(.62+prestige/170,.72,1.2);return Math.round(tiersSalary[tier]*(.75+rep/200)*finance);}
export function clubFinances(club,tier=1,rep=clubPrestige[club]??60){const prestige=clubPrestige[club]??Math.max(30,72-(tier-1)*6);const scale=clamp(.45+prestige/120,.65,1.35);const base=[0,500000000000,180000000000,80000000000,42000000000,22000000000,12000000000,8000000000][tier]||500000000;return {prestige,scale,transferBudget:Math.round(base*scale),wageLevel:clamp(Math.round(45+prestige*.55),40,100)};}

function expectations(tier,rep){if(tier===1)return {league:rep>76?'우승 경쟁':rep>63?'챔피언스리그 진출':'상위 8위',fa:'8강 진출',carabao:'4강 진출'};if(tier===2)return {league:rep>65?'자동 승격':rep>48?'플레이오프 진출':'상위 10위',fa:'4라운드 진출',carabao:'3라운드 진출'};return {league:rep>60?'자동 승격':rep>45?'플레이오프 진출':'상위권',fa:'가능한 라운드까지 진출',carabao:'참가 구단만 적용'};}
export const managerNationalities=['대한민국','잉글랜드','스페인','독일','이탈리아','프랑스','네덜란드','포르투갈','스코틀랜드','벨기에','튀르키예','브라질','아르헨티나','일본','미국','기타'];
function foreignOfferPool(route,nationality){
 const base=routeProfiles[route].base;const eligible=europeanLeagues.filter(l=>l.country===nationality);let targets=[];
 if(eligible.length){const home=eligible[0];const homeClubs=shuffled(home.clubs).slice(0,2);targets.push(...homeClubs.map(club=>({league:home,club,local:true})));}
 else targets=shuffled(europeanLeagues).slice(0,2).map(league=>({league,club:shuffled(league.clubs)[0],local:false}));
 return targets.map(({league,club,local},i)=>{const rep=clamp(base+Math.floor(Math.random()*20)-10+(local?8:0),22,94);const salary=Math.round((tiersSalary[1]||7800000000)*(.48+rep/180)*(local?1.08:1));const finance=clubFinances(club,1,rep);return {id:`foreign-${Date.now()}-${i}-${club}`,club,tier:1,league:league.name,leagueName:league.name,country:league.country,isForeign:true,leagueClubs:league.clubs,rep,salary,weekly:Math.round(salary/52),years:2+(Math.random()>.55?1:0),budget:Math.round(finance.transferBudget*.8),financeScale:finance.scale,wageLevel:finance.wageLevel,europeanCompetition:europeanCompetitionForClub(club,league.name),expectations:{league:rep>78?'우승 경쟁':rep>60?'유럽 대항전 진출':'상위권',fa:'해당 없음',carabao:'해당 없음'},signingBonus:Math.round(salary*.22)};});
}
export function makeOffers(route,philosophy,nationality='대한민국'){const p=routeProfiles[route],base=p.base;let pool;
 if(route==='legend')pool=[1,1,2,2,3,3,4];else if(route==='youth')pool=[2,3,3,4,4,5,5];else if(route==='license')pool=[3,4,4,5,5,6,6];else pool=[4,5,5,6,6,7,7];
 const chosen=shuffled(pool).slice(0,3).map((tier,i)=>{const l=leagueForTier(tier),club=shuffled(l.clubs)[0],rep=clamp(base+Math.floor(Math.random()*18)-8,25,90),salary=salaryFor(tier,rep,club),finance=clubFinances(club,tier,rep);return {id:`offer-${Date.now()}-${i}-${club}`,club,tier,league:l.name,country:'잉글랜드',isForeign:false,leagueClubs:l.clubs,rep,salary,weekly:Math.round(salary/52),years:2+(Math.random()>.6?1:0),budget:finance.transferBudget,financeScale:finance.scale,wageLevel:finance.wageLevel,expectations:expectations(tier,rep),europeanCompetition:tier===1?europeanCompetitionForClub(club,'프리미어리그'):'없음',signingBonus:Math.round(salary*(.2+Math.random()*.25))};});
 const foreign=foreignOfferPool(route,nationality).slice(0,2);return [...chosen.sort((a,b)=>b.rep-a.rep),...foreign.sort((a,b)=>b.rep-a.rep)];
}
const clubPrestige={'리버풀':92,'맨체스터 시티':96,'맨체스터 유나이티드':90,'아스널':88,'첼시':86,'토트넘':82,'뉴캐슬 유나이티드':82,'에버턴':75,'번리':58,'레알 마드리드':97,'바르셀로나':94,'바이에른 뮌헨':96,'보루시아 도르트문트':88,'인터 밀란':93,'AC 밀란':88,'유벤투스':90,'파리 생제르맹':96,'아약스':85};
const hashClub=name=>[...String(name)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
export const managerLeagueClubs=gm=>gm?.leagueClubs?.length?gm.leagueClubs:(leagueForTier(gm?.tier||1)?.clubs||[]);
export const managerLeagueName=gm=>gm?.leagueName||leagueForTier(gm?.tier||1)?.name||'리그';
export function foreignClubProfile(club,leagueName='해외 리그'){const nicknames={'레알 마드리드':'백색 군단','바르셀로나':'블라우그라나','바이에른 뮌헨':'바이에른의 거인','보루시아 도르트문트':'노란 벽','인터 밀란':'네라주리','AC 밀란':'로쏘네리','유벤투스':'비안코네리','파리 생제르맹':'파리지앵','아약스':'신의 아들들','갈라타사라이':'라이온스','벤피카':'독수리 군단','포르투':'드래곤즈','셀틱':'더 후프스','레인저스':'더 거스'};const nickname=nicknames[club]||`${club}의 서포터즈`;const p=clubProfile(club,1);const age=23+(hashClub(club)%9);return {...p,nickname,averageAge:age,league:leagueName,fanReactions:[`[${nickname}] 오늘 경기력은 구단의 자부심 그 자체다!`,`[${nickname}] 전술이 통했다. 감독을 믿고 가자.`,`[${nickname}] 다음 경기에서도 이 흐름을 이어가야 한다.`]};}
export function clubRatings(club,tier=1){const base=clubPrestige[club]??Math.max(28,76-(tier-1)*7),h=hashClub(club);return {공격:clamp(base+((h%13)-6),20,99),중원:clamp(base+(((h>>>4)%13)-6),20,99),수비:clamp(base+(((h>>>8)%13)-6),20,99)};}
export function clubProfile(club,tier=1){const r=clubRatings(club,tier),styles=[['강한 전방 압박','수비 뒷공간 노출'],['점유율 중심 빌드업','빠른 역습에 취약'],['빠른 측면 공격','중앙 수비가 약점'],['낮은 수비 블록','공격 전개 속도 부족'],['균형 잡힌 운영','뚜렷한 약점 없음']];const idx=hashClub(club)%styles.length;return {...r,expectedRank:Math.max(1,Math.min(20,Math.round(11-(r.공격+r.중원+r.수비-180)/9))),strength:styles[idx][0],weakness:styles[idx][1],style:['압박형','점유형','측면형','수비형','균형형'][idx]};}

// Optional opening-world event: Manchester City is moved to tier 5 and the strongest
// promotion candidates from tiers 2-5 each move up one division.
const originalEnglishLeagueClubs = leagueData.map(l=>({tier:l.tier,clubs:[...l.clubs]}));
let manCitySanctionPlan = null;
export function previewManCitySanction(){
 // Always preview against the untouched starting divisions, even if a previous
 // career in this browser already applied the alternative-history scenario.
 const promoted=[2,3,4,5].map(tier=>{
  const league=leagueForTier(tier);
  const original=originalEnglishLeagueClubs.find(x=>x.tier===tier);
  const candidates=original?.clubs||league.clubs;
  const ranked=candidates.map(name=>{const p=clubProfile(name,tier);const rating=(p.공격+p.중원+p.수비)/3;const odds=clamp(Math.round(28+(rating-40)*1.15+(25-p.expectedRank)*.65),8,96);return {name,tier,league:league.name,rating:Math.round(rating),odds};}).sort((a,b)=>b.odds-a.odds||b.rating-a.rating||a.name.localeCompare(b.name,'ko'));
  return ranked[0];
 });
 return {manCity:{name:'맨체스터 시티',from:1,to:5},promoted};
}
export function restoreOriginalLeagueStructure(){
 originalEnglishLeagueClubs.forEach(snapshot=>{const league=leagueForTier(snapshot.tier);league.clubs.splice(0,league.clubs.length,...snapshot.clubs);});
 allClubs.splice(0,allClubs.length,...leagueData.flatMap(l=>l.clubs.map(name=>({name,tier:l.tier,league:l.name}))));
 manCitySanctionPlan=null;
 return true;
}
export function applyManCitySanction(){
 if(manCitySanctionPlan&&clubTier('맨체스터 시티')===5)return manCitySanctionPlan;
 restoreOriginalLeagueStructure();
 const plan=previewManCitySanction();
 const city=leagueForTier(1),fifth=leagueForTier(5);
 city.clubs.splice(city.clubs.indexOf('맨체스터 시티'),1);
 plan.promoted.forEach(item=>{const from=leagueForTier(item.tier),to=leagueForTier(item.tier-1);const i=from.clubs.indexOf(item.name);if(i>=0)from.clubs.splice(i,1);to.clubs.push(item.name);});
 fifth.clubs.push('맨체스터 시티');
 allClubs.splice(0,allClubs.length,...leagueData.flatMap(l=>l.clubs.map(name=>({name,tier:l.tier,league:l.name}))));
 manCitySanctionPlan=plan;
 return plan;
}

function makeForeignFanReactions(club,win,draw){const p=foreignClubProfile(club);const lines=win?['오늘 경기력은 구단의 자부심 그 자체다!','감독의 선택이 완벽하게 맞아떨어졌다.','이 흐름이라면 유럽 무대도 기대할 만하다.']:draw?['승점은 챙겼지만 결정적인 기회를 놓쳤다.','전술은 나쁘지 않았지만 마무리가 아쉽다.','다음 경기에서는 반드시 승리해야 한다.']:['이런 경기력으로는 팬들의 기대를 채울 수 없다.','감독의 전술 수정이 시급하다.','선수단 집중력이 너무 부족했다.'];return lines.map((line,i)=>[`${p.nickname} · 팬${i+1}`,line]);}
function squadPortrait(age,position='공격'){const role=position==='중원'?'midfielder':position==='수비'?'defender':position==='골키퍼'?'goalkeeper':'attacker';const stage=age>=32?'veteran':age<=20?'youth':'prime';return {appearance:stage,portrait:age>=32?'🧔🏻':age<=20?'🧑🏻‍🎓':'⚽',portraitUrl:`/players/${role}-${stage}.png`};}
function makeSquad(club,tier){const r=clubRatings(club,tier);const forwardAge=24+Math.floor(Math.random()*10),midAge=23+Math.floor(Math.random()*11),defenceAge=24+Math.floor(Math.random()*10),keeperAge=25+Math.floor(Math.random()*10);return [{name:'주전 공격수',position:'공격',rating:r.공격,age:forwardAge,star:true,...squadPortrait(forwardAge,'공격')},{name:'주전 미드필더',position:'중원',rating:r.중원,age:midAge,...squadPortrait(midAge,'중원')},{name:'주전 수비수',position:'수비',rating:r.수비,age:defenceAge,...squadPortrait(defenceAge,'수비')},{name:'주전 골키퍼',position:'골키퍼',rating:clamp(r.수비+Math.round((Math.random()-.5)*8),35,99),age:keeperAge,...squadPortrait(keeperAge,'골키퍼')}];}
export function averageSquadAge(squad=[]){return squad.length?squad.reduce((a,p)=>a+p.age,0)/squad.length:26;}
export function positionAverageAges(squad=[]){return Object.fromEntries(['공격','중원','수비','골키퍼'].map(position=>{const players=squad.filter(p=>p.position===position);return [position,players.length?Number((players.reduce((sum,p)=>sum+Number(p.age||26),0)/players.length).toFixed(1)):null];}));}

// Season calendar: season 1 begins on 1 July 2026; subsequent seasons advance one year.
export function seasonDate(gm={},day=gm.lastDay||0){const startYear=Number(gm.seasonStartYear)||2026+Math.max(0,(gm.season||1)-1);const date=new Date(Date.UTC(startYear,6,1+Math.max(0,Number(day)||0)));return {year:date.getUTCFullYear(),month:date.getUTCMonth()+1,day:date.getUTCDate(),iso:date.toISOString().slice(0,10),label:`${date.getUTCFullYear()}년 ${date.getUTCMonth()+1}월 ${date.getUTCDate()}일`};}
export function transferWindowStatus(gm={}){const d=seasonDate(gm);const md=d.month*100+d.day;const summer=md>=701&&md<=831,winter=md>=101&&md<=131;const open=summer||winter;const next=md>=901?`${d.year+1}년 1월 1일`:`${d.year}년 7월 1일`;return {open,period:summer?'여름 이적시장':winter?'겨울 이적시장':'이적시장 폐쇄',date:d,nextOpen:open?null:next,closeDate:summer?`${d.year}년 8월 31일`:winter?`${d.year}년 1월 31일`:null};}
export function ageAdjustedRatings(squad=[],fallback={공격:50,중원:50,수비:50,골키퍼:50}){const result={};for(const pos of ['공격','중원','수비','골키퍼']){const players=squad.filter(p=>p.position===pos);const weighted=players.reduce((sum,p)=>sum+(Number(p.rating)||50)*(p.squadRole==='주전'?1:p.squadRole==='부분 로테이션'?.45:.18),0);const weights=players.reduce((sum,p)=>sum+(p.squadRole==='주전'?1:p.squadRole==='부분 로테이션'?.45:.18),0);const base=players.length?weighted/Math.max(.01,weights):Number(fallback[pos]||50);const avg=players.length?players.reduce((a,p)=>a+Number(p.age||26),0)/players.length:26;const modifier=avg<23?Math.min(3.5,(23-avg)*.7):avg>30?-Math.min(5,(avg-30)*.8):0;result[pos]=clamp(base+modifier,20,99);result[`${pos}나이보정`]=Number(modifier.toFixed(1));result[`${pos}평균나이`]=Number(avg.toFixed(1));}return result;}
export function resultMoraleChange(squad=[],win=false,draw=false){const avg=averageSquadAge(squad);const base=win?5:draw?0:-5;const volatility=avg<23?1.65:avg>30?.45:1;return Math.round(base*volatility);}
function marketRandom(seed){let state=(seed>>>0)||1;return ()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};}
const marketNames=['알렉스 모레노','마테오 리치','노아 윌리엄스','루카 페트로비치','에단 클라크','아드리안 실바','카이 하산','다니엘 로시','밀란 코바치','레오 산토스','이삭 베넷','토마스 워커','제이든 콜린스','엘리엇 노박','아담 페레이라','준호 김','민재 박','라파엘 코스타','빅토르 라르손','사무엘 밀러','가브리엘 소자','엔조 마르티네스','야콥 닐센','오스카 브라운'];
const marketArchetypes={
 '공격':[
  {type:'침투형 스트라이커',style:'뒷공간 침투',bias:{pace:13,finishing:10,passing:-2,defending:-7,physical:1}},
  {type:'타깃형 공격수',style:'포스트 플레이',bias:{pace:-5,finishing:5,passing:1,defending:-5,physical:14}},
  {type:'스피드형 윙어',style:'측면 돌파',bias:{pace:16,finishing:2,passing:3,defending:-8,physical:-2}},
  {type:'테크니션 포워드',style:'좁은 공간 연계',bias:{pace:2,finishing:6,passing:10,defending:-5,physical:-3}}
 ],
 '중원':[
  {type:'딥라잉 플레이메이커',style:'후방 전개',bias:{pace:-2,finishing:-4,passing:15,defending:5,physical:0}},
  {type:'박스투박스 미드필더',style:'왕복 활동량',bias:{pace:5,finishing:3,passing:3,defending:6,physical:9}},
  {type:'볼 위닝 미드필더',style:'강한 압박과 탈취',bias:{pace:1,finishing:-7,passing:1,defending:15,physical:10}},
  {type:'공격형 플레이메이커',style:'킬러 패스',bias:{pace:2,finishing:5,passing:16,defending:-6,physical:-3}}
 ],
 '수비':[
  {type:'빌드업 센터백',style:'후방 빌드업',bias:{pace:-1,finishing:-8,passing:12,defending:10,physical:5}},
  {type:'스피드형 수비수',style:'커버와 뒷공간 대응',bias:{pace:15,finishing:-9,passing:0,defending:8,physical:2}},
  {type:'파이터형 수비수',style:'대인 수비',bias:{pace:-3,finishing:-10,passing:-3,defending:15,physical:14}},
  {type:'공격형 풀백',style:'오버래핑',bias:{pace:10,finishing:-3,passing:8,defending:3,physical:3}}
 ],
 '골키퍼':[
  {type:'선방형 골키퍼',style:'반사 신경과 슈팅 방어',bias:{pace:-8,finishing:-18,passing:1,defending:18,physical:8}},
  {type:'스위퍼 키퍼',style:'뒷공간 커버와 빌드업',bias:{pace:2,finishing:-18,passing:12,defending:12,physical:5}},
  {type:'공중볼 장악형',style:'크로스 처리와 제공권',bias:{pace:-5,finishing:-18,passing:2,defending:14,physical:15}}
 ]
};
export function transferCandidates(gm={}){
 const season=Number(gm.season)||1,clubSeed=hashClub(gm.club||'커리어'),tier=Number(gm.tier)||3;
 const rand=marketRandom((season*7919+clubSeed*31+tier*101)>>>0);
 const usedIds=new Set(gm.transferMarketPurchased||[]);
 const usedNames=new Set((gm.squad||[]).map(p=>p.name).filter(Boolean));
 const positions=['공격','중원','수비','골키퍼'];
 const shuffledNames=[...marketNames].sort(()=>rand()-.5);
 const roster=[];
 for(let i=0;i<12;i++){
  const position=positions[i%4],archetypes=marketArchetypes[position],archetype=archetypes[Math.floor(rand()*archetypes.length)];
  const ageRoll=rand();
  const age=i===0?19:ageRoll<.28?18+Math.floor(rand()*4):ageRoll<.78?23+Math.floor(rand()*7):30+Math.floor(rand()*7);
  const tierBaseline=clamp(78-(tier-1)*5,43,84);
  const rating=clamp(Math.round(tierBaseline+(rand()-.5)*25+(age<=21?-5:age>=34?-3:2)),38,91);
  const potential=clamp(Math.max(rating,rating+(age<=21?8+Math.floor(rand()*11):age<=24?3+Math.floor(rand()*9):age>=32?-1+Math.floor(rand()*4):Math.floor(rand()*7))),rating,96);
  const name=shuffledNames[i];
  const attributes=Object.fromEntries(['pace','finishing','passing','defending','physical'].map(key=>[key,clamp(Math.round(rating+archetype.bias[key]+(rand()-.5)*14),20,99)]));
  const id=`market-${season}-${clubSeed}-${i}`;
  const ageFactor=age>=32?.48:age<=20?1.12:age<=24?1.04:.94;
  const potentialFactor=1+Math.max(0,potential-rating)*.018;
  const tierFactor=1+(7-tier)*.045;
  const fee=Math.round(Math.max(350000000,(rating-34)**2*105000000*ageFactor*potentialFactor*tierFactor));
  const appearance=age>=32?'veteran':age<=20?'youth':'prime';
  roster.push({id,marketId:id,name,position,rating,age,potential,type:archetype.type,style:archetype.style,attributes,fee,moraleBoost:age>=32?10:age<=20?3:5,appearance,portrait:age>=32?'🧔🏻':age<=20?'🧑🏻‍🎓':position==='공격'?'⚽':position==='중원'?'🎯':position==='골키퍼'?'🧤':'🛡️',portraitUrl:`/players/${position==='중원'?'midfielder':position==='수비'?'defender':position==='골키퍼'?'goalkeeper':'attacker'}-${appearance}.png`});
 }
 const citySanctionEnabled=gm.citySanctionMarketEnabled===true||gm.leagueReform?.manCityRelegated===true;
 const citySanctionStars=citySanctionEnabled&&season===1?[
  {id:'city-sanction-haaland',marketId:'city-sanction-haaland',name:'엘링 홀란드',position:'공격',rating:98,age:26,potential:99,type:'월드클래스 스트라이커',style:'압도적인 피지컬과 침투',attributes:{pace:98,finishing:99,passing:92,defending:90,physical:99},fee:450000000000,moraleBoost:8,appearance:'prime',portrait:'⚽',portraitUrl:'/players/city-haaland.png',shirtNumber:9,citySanctionPlayer:true},
  {id:'city-sanction-doku',marketId:'city-sanction-doku',name:'제레미 도쿠',position:'공격',rating:95,age:24,potential:98,type:'월드클래스 윙어',style:'폭발적인 드리블과 가속',attributes:{pace:99,finishing:92,passing:94,defending:90,physical:93},fee:280000000000,moraleBoost:7,appearance:'prime',portrait:'⚽',portraitUrl:'/players/city-doku.png',shirtNumber:11,citySanctionPlayer:true},
  {id:'city-sanction-elliot-anderson',marketId:'city-sanction-elliot-anderson',name:'엘리엇 앤더슨',position:'중원',rating:94,age:24,potential:98,type:'월드클래스 미드필더',style:'왕복 활동량과 전진 패스',attributes:{pace:93,finishing:90,passing:97,defending:94,physical:95},fee:220000000000,moraleBoost:7,appearance:'prime',portrait:'🎯',portraitUrl:'/players/city-elliot-anderson.png',shirtNumber:5,citySanctionPlayer:true},
  {id:'city-sanction-gvardiol',marketId:'city-sanction-gvardiol',name:'요슈코 그바르디올',position:'수비',rating:96,age:24,potential:99,type:'월드클래스 수비수',style:'강력한 대인 수비와 빌드업',attributes:{pace:96,finishing:90,passing:95,defending:99,physical:97},fee:340000000000,moraleBoost:7,appearance:'prime',portrait:'🛡️',portraitUrl:'/players/city-gvardiol.png',shirtNumber:24,citySanctionPlayer:true},
  {id:'city-sanction-donnarumma',marketId:'city-sanction-donnarumma',name:'잔루이지 돈나룸마',position:'골키퍼',rating:96,age:27,potential:99,type:'월드클래스 골키퍼',style:'압도적인 선방과 제공권',attributes:{pace:90,finishing:90,passing:93,defending:99,physical:98},fee:300000000000,moraleBoost:8,appearance:'prime',portrait:'🧤',portraitUrl:'/players/city-donnarumma.png',shirtNumber:1,citySanctionPlayer:true}
 ].filter(p=>!usedIds.has(p.id)&&!usedNames.has(p.name)):[];
 return [...citySanctionStars,...roster.filter(p=>!usedIds.has(p.id)&&!usedNames.has(p.name))];
}
export function assignSquadRoles(squad=[]){const unique=[];const seenPlayers=new Set();for(const player of squad){const name=String(player.name||'').trim().toLocaleLowerCase();const position=String(player.position||'').trim();const identity=name?`${name}|${position}`:String(player.marketId||player.id||'');if(!identity||seenPlayers.has(identity))continue;seenPlayers.add(identity);unique.push({...player});}for(const position of ['공격','중원','수비','골키퍼']){const group=unique.filter(p=>p.position===position).sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0)||String(a.name).localeCompare(String(b.name)));group.forEach((p,index)=>{p.squadRole=index===0?'주전':index===1?'부분 로테이션':'대규모 로테이션';});}return unique;}
export function signPlayer(gm,player){const window=transferWindowStatus(gm);if(!window.open)return {error:`이적시장이 닫혀 있습니다. 다음 이적시장은 ${window.nextOpen}에 열립니다.`};const purchased=new Set(gm.transferMarketPurchased||[]);const playerId=player.marketId||player.id;if(playerId&&purchased.has(playerId))return {error:'이미 영입한 선수입니다. 중복 영입은 불가능합니다.'};if(playerId&&!transferCandidates(gm).some(p=>p.id===playerId))return {error:'현재 이적시장에 등록된 선수가 아닙니다.'};const available=gm.transferBudget??gm.cash;if(available<player.fee)return {error:'구단 이적 예산이 부족합니다.'};const existing=gm.squad||makeSquad(gm.club,gm.tier);const squad=assignSquadRoles([...existing,player]);const signedIndex=squad.findIndex(p=>(p.marketId||p.id)===playerId);if(signedIndex>=0)squad[signedIndex]={...squad[signedIndex],id:`signed-${playerId||Date.now()}`,marketId:playerId,star:player.age>=32,marketRating:player.rating,potential:player.potential||player.rating+5};const ranked=assignSquadRoles(squad);const teamRatings=Object.fromEntries(['공격','중원','수비','골키퍼'].map(pos=>[pos,ranked.filter(p=>p.position===pos).reduce((a,p)=>a+p.rating,0)/Math.max(1,ranked.filter(p=>p.position===pos).length)]));return {gm:{...gm,squad:ranked,teamRatings,cash:gm.cash,transferBudget:available-player.fee,morale:clamp(gm.morale+(player.moraleBoost||3)),transferMarketPurchased:[...purchased,...(playerId?[playerId]:[])],transferLog:[...(gm.transferLog||[]),player.name],transferFanReaction:[`${gm.club} 팬: ${player.name} 영입이라니 기대된다!`,`${player.type} 자원이 팀 전술에 새로운 선택지를 줄 것으로 기대된다.`]}};}

const youthFirstNames=['레오','노아','루카','에단','마테오','아담','제이든','엘리엇','카이','다니엘','민재','준호','이삭','토마스'];
const youthLastNames=['모건','베넷','실바','로시','김','박','워커','콜린스','페레이라','노박','산토스','리드','하산','밀러'];
export function generateYouthProspects(gm={}){
 const youthSkill=Number(gm.stats?.유소년육성||40);const highChance=Math.max(.08,Math.min(.72,.06+youthSkill*.0065));const usedNames=new Set((gm.squad||[]).map(p=>p.name));
 return Array.from({length:5},(_,i)=>{const elite=Math.random()<highChance;const potential=clamp(Math.round((elite?78:61)+Math.random()*(elite?21:19)+(youthSkill-50)*.22),55,99);const rating=clamp(Math.round(43+Math.random()*17+(youthSkill-50)*.18),35,74);const age=16+Math.floor(Math.random()*3);const position=['공격','중원','수비','골키퍼'][Math.floor(Math.random()*4)];let name='';for(let attempt=0;attempt<80;attempt++){const candidate=`${youthFirstNames[Math.floor(Math.random()*youthFirstNames.length)]} ${youthLastNames[Math.floor(Math.random()*youthLastNames.length)]}`;if(!usedNames.has(candidate)){name=candidate;usedNames.add(candidate);break;}}if(!name)name=`유망주 ${gm.season||1}-${i+1}`;return {id:`youth-${gm.season||1}-${Date.now()}-${i}`,name,position,age,rating,potential,type:'유소년',appearance:'youth',fee:0,portrait:'🧑🏻‍🎓',portraitUrl:`/players/${position==='중원'?'midfielder':position==='수비'?'defender':position==='골키퍼'?'goalkeeper':'attacker'}-youth.png`};});
}
export function callUpYouth(gm,playerId){const youth=(gm.youthPool||[]).find(p=>p.id===playerId);if(!youth)return {error:'콜업할 유망주를 찾을 수 없습니다.'};const squad=[...(gm.squad||makeSquad(gm.club,gm.tier))];const weakest=squad.filter(p=>p.position===youth.position).sort((a,b)=>a.rating-b.rating)[0];const promoted={...youth,type:'1군 유망주',potential:youth.potential,star:false,morale:70};const nextSquad=assignSquadRoles([...squad,promoted]);const teamRatings=Object.fromEntries(['공격','중원','수비','골키퍼'].map(pos=>[pos,nextSquad.filter(p=>p.position===pos).reduce((a,p)=>a+p.rating,0)/Math.max(1,nextSquad.filter(p=>p.position===pos).length)]));return {gm:{...gm,squad:nextSquad,teamRatings,youthPool:(gm.youthPool||[]).filter(p=>p.id!==playerId),youthCallups:[...(gm.youthCallups||[]),promoted.name],morale:clamp((gm.morale||75)+2)}};}
export function resolveStarTransfer(gm,choice){const offer=gm.pendingStarTransfer;if(!offer)return gm;const squad=[...(gm.squad||[])];const player=squad.find(p=>p.id===offer.playerId)||squad.find(p=>p.name===offer.playerName);if(choice==='sell'&&player){const updated=squad.filter(p=>p!==player);const teamRatings=Object.fromEntries(['공격','중원','수비','골키퍼'].map(pos=>[pos,updated.filter(p=>p.position===pos).reduce((a,p)=>a+p.rating,0)/Math.max(1,updated.filter(p=>p.position===pos).length)]));return {...gm,squad:updated,teamRatings,cash:gm.cash,transferBudget:(gm.transferBudget??gm.cash)+offer.fee,morale:clamp(gm.morale+3),pendingStarTransfer:null,transferLog:[...(gm.transferLog||[]),`${player.name} 매각`],news:[`${player.name}이(가) ${money(offer.fee)}에 이적했습니다.`,...(gm.news||[])]};}return {...gm,morale:clamp(gm.morale-18),pendingStarTransfer:null,news:[`${offer.playerName}의 이적 요청을 거절했습니다. 선수단 사기가 하락했습니다.`,...(gm.news||[])]};}

export function createManager(route,philosophy,nationality='대한민국'){const prof=routeProfiles[route],offers=makeOffers(route,philosophy,nationality);return {route,philosophy,nationality,tacticUnderstanding:{게겐프레싱:35,점유율축구:35,역습:35},seasonStartYear:2026,age:36,peakAge:48,stats:Object.fromEntries(Object.entries(prof.boost).map(([k,v])=>[k,clamp(prof.base+v)])),offers,club:null,tier:null,salary:0,cash:0,contractYears:0,wageAnchorDay:null,wagePaidWeeks:0,lastWagePayment:null,totalWagesReceived:0,expectations:null,season:1,played:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,fitness:92,morale:75,security:85,streak:0,trophies:0,awards:0,growth:1,items:[],license:1,fixtures:[],table:[],history:[],seasonHistory:[],clubHistory:[],careerW:0,careerD:0,careerL:0,careerTrophies:[],fa:'진행 중',carabao:'진행 중',europe:'없음',lastDay:0,status:'제안 대기',event:null,news:[],europeanWorld:createEuropeanWorld(),europeanMovementHistory:[],europeanCompetition:null};}
export const premierLeague2025_26={
 '아스널':{rank:1,points:85,competition:'챔피언스리그'},'맨체스터 시티':{rank:2,points:78,competition:'챔피언스리그'},'맨체스터 유나이티드':{rank:3,points:71,competition:'챔피언스리그'},'애스턴 빌라':{rank:4,points:65,competition:'챔피언스리그'},'리버풀':{rank:5,points:60,competition:'챔피언스리그'},'본머스':{rank:6,points:57,competition:'유로파리그'},'선덜랜드':{rank:7,points:54,competition:'유로파리그'},'브라이턴':{rank:8,points:53,competition:'컨퍼런스리그'},'브렌트퍼드':{rank:9,points:53,competition:'없음'},'첼시':{rank:10,points:52,competition:'없음'},'풀럼':{rank:11,points:52,competition:'없음'},'뉴캐슬 유나이티드':{rank:12,points:49,competition:'없음'},'에버턴':{rank:13,points:49,competition:'없음'},'리즈 유나이티드':{rank:14,points:47,competition:'없음'},'크리스털 팰리스':{rank:15,points:45,competition:'유로파리그'},'노팅엄 포레스트':{rank:16,points:44,competition:'없음'},'토트넘':{rank:17,points:41,competition:'없음'},'웨스트햄':{rank:18,points:39,competition:'없음'},'번리':{rank:19,points:22,competition:'없음'},'울버햄튼':{rank:20,points:20,competition:'없음'}
};
// 2025-26 시즌 최종 순위를 바탕으로 2026-27 유럽대항전 진출 구단을 구성한다.
// 각 리그의 국내 컵 우승/UEFA 재배분은 해당 국가의 접근 명단에 반영한 초기 게임 데이터다.
export const europeanAccess2026_27={
 '라리가':{챔피언스리그:['바르셀로나','레알 마드리드','비야레알','아틀레티코 마드리드'],유로파리그:['셀타 비고','레알 소시에다드'],컨퍼런스리그:['헤타페']},
 '분데스리가':{챔피언스리그:['바이에른 뮌헨','보루시아 도르트문트','RB 라이프치히','슈투트가르트'],유로파리그:['호펜하임','바이어 레버쿠젠'],컨퍼런스리그:['프라이부르크']},
 '세리에 A':{챔피언스리그:['인터 밀란','나폴리','AS 로마','코모'],유로파리그:['AC 밀란','유벤투스'],컨퍼런스리그:['아탈란타']},
 '리그 1':{챔피언스리그:['파리 생제르맹','랑스','릴','리옹'],유로파리그:['마르세유','렌'],컨퍼런스리그:['모나코']},
 '에레디비시':{챔피언스리그:['PSV 에인트호번','페예노르트','네이메헌'],유로파리그:['트벤테','AZ 알크마르'],컨퍼런스리그:['아약스','위트레흐트']},
 '스코티시 프리미어십':{챔피언스리그:['셀틱','하츠'],유로파리그:['레인저스'],컨퍼런스리그:['마더웰']},
 '프리메이라리가':{챔피언스리그:['포르투','스포르팅 CP'],유로파리그:['벤피카'],컨퍼런스리그:['브라가']},
 '프로 리그':{챔피언스리그:['위니옹 생질루아즈','클럽 브뤼헤'],유로파리그:['헹크'],컨퍼런스리그:['앤트워프']},
 '쉬페르리그':{챔피언스리그:['갈라타사라이','페네르바흐체'],유로파리그:['트라브존스포르','베식타시'],컨퍼런스리그:['바샥셰히르']}
};
const premierEuropeEntrants=competition=>Object.entries(premierLeague2025_26).filter(([,v])=>v.competition===competition).map(([club])=>club);
const allEuropeanEntrants=competition=>[...premierEuropeEntrants(competition),...Object.values(europeanAccess2026_27).flatMap(entry=>entry[competition]||[])];
export function europeanCompetitionForClub(club,leagueName){
 const premier=premierLeague2025_26[club];if(premier)return premier.competition;
 const entry=europeanAccess2026_27[leagueName];if(!entry)return '없음';
 return Object.entries(entry).find(([,clubs])=>clubs.includes(club))?.[0]||'없음';
}
function initialEuropeanCompetition(club,season,leagueName='프리미어리그'){
 const competition=europeanCompetitionForClub(club,leagueName);if(!competition||competition==='없음')return null;
 const seeded=allEuropeanEntrants(competition);
 return europeanDraw(competition,season,club,seeded);
}
export function acceptOffer(gm,id){
 const offer=gm.offers.find(x=>x.id===id);if(!offer)return gm;
 const history=[...(gm.clubHistory||[])];if(!history.length||history[history.length-1].club!==offer.club)history.push({club:offer.club,seasons:0,trophies:0,w:0,d:0,l:0});
 const clubs=offer.leagueClubs||leagueForTier(offer.tier).clubs;const squad=assignSquadRoles(makeSquad(offer.club,offer.tier));
 const europeanCompetition=initialEuropeanCompetition(offer.club,gm.season||1,offer.isForeign?offer.league:'프리미어리그');
 const domesticFixtures=offer.isForeign?createSeasonFromClubs(clubs,offer.club,gm.season||1,'INT-'):createSeason(offer.tier,offer.club,gm.season||1);const foreignCups=offer.isForeign?createForeignDomesticCupFixtures(offer.league,offer.club,gm.season||1,clubs):{fixtures:[],status:{}};
 return {...gm,seasonStartYear:gm.seasonStartYear||2026,...offer,club:offer.club,tier:offer.tier,leagueName:offer.leagueName||offer.league,leagueClubs:clubs,salary:offer.salary,cash:gm.cash+offer.signingBonus,transferBudget:offer.budget,contractYears:offer.years,wageAnchorDay:null,wagePaidWeeks:0,lastWagePayment:null,totalWagesReceived:0,expectations:offer.expectations,offers:[],fixtures:[...domesticFixtures,...foreignCups.fixtures,...(europeanCompetition?.fixtures||[])].sort((a,b)=>a.day-b.day),domesticCups:foreignCups.status,table:offer.isForeign?freshTableFromClubs(clubs):freshTable(offer.tier,offer.club),fa:offer.isForeign?'불참':'진행 중',carabao:offer.isForeign?'불참':offer.tier<=4?'진행 중':'불참',europe:offer.europeanCompetition||'없음',pendingPlayoff:null,event:null,status:'재직',clubHistory:history,careerTrophies:gm.careerTrophies||[],squad,teamRatings:{...clubRatings(offer.club,offer.tier),골키퍼:clubRatings(offer.club,offer.tier).수비},transferLog:[],faEliminated:[],carabaoEliminated:[],foreignFanProfile:offer.isForeign?foreignClubProfile(offer.club,offer.league):null,europeanCompetition,playerSeasonStats:{goals:0,assists:0}};
}
export function nextFixture(gm){return gm?.fixtures?.find(f=>!f.played&&f.active)||null;}
function updateRow(table,name,gf,ga){return table.map(r=>r.name===name?{...r,p:r.p+1,w:r.w+(gf>ga?1:0),d:r.d+(gf===ga?1:0),l:r.l+(gf<ga?1:0),gf:r.gf+gf,ga:r.ga+ga,pts:r.pts+(gf>ga?3:gf===ga?1:0)}:r);}
function simulateRatedFixture(a,b,tier=1){const pa=clubProfile(a,tier),pb=clubProfile(b,tier);const powerA=(pa.공격+pa.중원+pa.수비)/3,powerB=(pb.공격+pb.중원+pb.수비)/3;const edge=(powerA-powerB)/18;const homeAdvantage=.16;const ga=clamp(Math.round(1.25+edge*.48+homeAdvantage+(Math.random()-.5)*2.8),0,5);const gb=clamp(Math.round(1.25-edge*.48+(Math.random()-.5)*2.8),0,5);return [ga,gb];}
function updateRoundTable(table,club,opponent,gf,ga,tier=1){let next=updateRow(table,club,gf,ga);next=updateRow(next,opponent,ga,gf);const others=shuffled(next.filter(r=>r.name!==club&&r.name!==opponent).map(r=>r.name));for(let i=0;i+1<others.length;i+=2){const a=others[i],b=others[i+1],[x,y]=simulateRatedFixture(a,b,tier);next=updateRow(next,a,x,y);next=updateRow(next,b,y,x);}return next;}
function opponentBaseFallback(tier){return [0,65,56,48,42,35,29,27][tier]||40;}
export function playNext(gm,opts){const f=nextFixture(gm);if(!f) return {gm,error:'진행할 경기가 없습니다.'};const gap=f.day-gm.lastDay,rot=opts.rotation||'주전 기용';const rotationPenalty=rot==='대규모 로테이션'?-1.4:rot==='부분 로테이션'?-0.5:0;const tacticKey=gm.philosophy==='게겐프레싱'?'게겐프레싱':gm.philosophy==='점유율 축구'?'점유율축구':'역습';const tacticBonus=((gm.tacticUnderstanding||{})[tacticKey]||35)/20+((gm.philosophy==='게겐프레싱'&&opts.press==='높은 압박')||(gm.philosophy==='점유율 축구'&&opts.tempo==='느린 템포')||(gm.philosophy==='역습 축구'&&opts.line==='낮은 수비라인')?2:0);const fatigue=Math.max(0,88-gm.fitness-(rot==='대규모 로테이션'?5:rot==='부분 로테이션'?2:0))*(gap<=3?.075:.035);const squad=gm.squad||makeSquad(gm.club,gm.tier);const own=getTeamRatings({...gm,squad},rot);const teamPower=(own.공격+own.중원+own.수비+own.골키퍼)/4;const agePenalty=0;const strength=(gm.stats.전술+gm.stats.경기분석+gm.stats.선수관리)/3+gm.morale*.12+tacticBonus+rotationPenalty-fatigue+(teamPower-60)*.48-agePenalty;const opponentProfile=clubProfile(f.opponent,gm.tier);const opponentStyleBonus=opponentProfile.style==='압박형'?0.12:opponentProfile.style==='수비형'?-0.08:0;const attackEdge=((own.공격||teamPower)-(opponentProfile.수비||opponentBaseFallback(gm.tier)))/15;const midfieldEdge=((own.중원||teamPower)-(opponentProfile.중원||55))/25;const defenceEdge=(((own.수비||teamPower)*.72+(own.골키퍼||teamPower)*.28)-(opponentProfile.공격||55))/17;const opponentBase=(opponentProfile.공격+opponentProfile.중원+opponentProfile.수비)/3;const relative=(strength-opponentBase)/13+midfieldEdge*.45+(f.home?.55:-.55);const chanceFor=1.15+relative*.38+attackEdge*.42;const chanceAgainst=1.05-relative*.3-defenceEdge*.4+opponentStyleBonus;let gf=clamp(Math.round(chanceFor+(Math.random()-.5)*2.6),0,5),ga=clamp(Math.round(chanceAgainst+(Math.random()-.5)*2.4),0,5);const win=gf>ga,draw=gf===ga;let fixtures=gm.fixtures.map(x=>x.id===f.id?{...x,played:true,score:`${gf}-${ga}`} :x);let fa=gm.fa,carabao=gm.carabao,trophies=gm.trophies;
 if(f.type==='FA컵'||f.type==='카라바오컵'){const isFA=f.type==='FA컵';const stateKey=isFA?'fa':'carabao';const eliminatedKey=isFA?'faEliminated':'carabaoEliminated';const eliminated=[...(gm[eliminatedKey]||[])];if(!win){if(!eliminated.includes(gm.club))eliminated.push(gm.club);if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);if(isFA)fa='탈락';else carabao='탈락';}else if(f.tieId&&f.leg===1){fixtures.push({...f,id:`${f.tieId}-L2`,leg:2,day:f.day+14,home:!f.home,played:false,score:null});}else if(f.tieId&&f.leg===2){const first=gm.fixtures.find(x=>x.tieId===f.tieId&&x.leg===1);const [a,b]=(first?.score||'0-0').split('-').map(Number);const aggregate=(a+gf)-(b+ga);if(aggregate<=0){if(!eliminated.includes(gm.club))eliminated.push(gm.club);if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);if(isFA)fa='탈락';else carabao='탈락';}else{if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);const finalRound=isFA?6:5;if(f.round===finalRound){if(isFA)fa='우승';else carabao='우승';trophies++;}else{const pool=allClubs.filter(x=>x.name!==gm.club&&!eliminated.includes(x.name)&&x.name!==f.opponent&&x.tier<=(isFA?7:4));const opponent=shuffled(pool)[0]?.name;if(opponent)fixtures.push({id:`${isFA?'FA':'CC'}-${gm.season}-${f.round+1}`,type:f.type,round:f.round+1,day:f.day+28,home:Math.random()>.5,opponent,played:false,active:true});}}}else{if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);const finalRound=isFA?6:5;if(f.round===finalRound){if(isFA)fa='우승';else carabao='우승';trophies++;}else{const pool=allClubs.filter(x=>x.name!==gm.club&&!eliminated.includes(x.name)&&x.name!==f.opponent&&x.tier<=(isFA?7:4));const opponent=shuffled(pool)[0]?.name;if(opponent){const twoLeg=!isFA&&f.round===3;const tieId=twoLeg?`CC-${gm.season}-SF-${f.round+1}`:null;fixtures.push({id:tieId?`${tieId}-L1`:`${isFA?'FA':'CC'}-${gm.season}-${f.round+1}`,tieId,leg:twoLeg?1:undefined,type:f.type,round:f.round+1,day:f.day+28,home:twoLeg?true:Math.random()>.5,opponent,played:false,active:true});if(twoLeg)fixtures.push({id:`${tieId}-L2`,tieId,leg:2,type:f.type,round:f.round+1,day:f.day+42,home:false,opponent,played:false,active:true});}}}gm={...gm,[eliminatedKey]:eliminated};}
 let table=gm.table;if(f.type==='리그'){table=updateRoundTable(table,gm.club,f.opponent,gf,ga,gm.tier||1);}
 const crisisSkill=Number(gm.stats?.위기관리||40);const defeatPenalty=Math.max(-6,-6+Math.max(0,crisisSkill-40)*.09);const security=clamp(gm.security+(win?3:draw?0:defeatPenalty)+(f.type==='리그'?0:win?2:-2));const matchDate=seasonDate(gm,f.day);const previousDate=seasonDate(gm,gm.lastDay||0);let monthlyAwards=[...(gm.monthlyAwards||[])];let monthlyStats={...(gm.monthlyStats||{month:matchDate.month,w:0,d:0,l:0,goals:0,conceded:0,matches:0})};if(matchDate.month!==monthlyStats.month&&monthlyStats.matches>0){const score=monthlyStats.w*3+monthlyStats.d;const winner=score>=7?gm.club:(leagueForTier(gm.tier)?.clubs.filter(c=>c!==gm.club)||[])[0]||gm.club;monthlyAwards.push({month:monthlyStats.month,winner,record:`${monthlyStats.w}승 ${monthlyStats.d}무 ${monthlyStats.l}패`,goals:monthlyStats.goals,conceded:monthlyStats.conceded});monthlyStats={month:matchDate.month,w:0,d:0,l:0,goals:0,conceded:0,matches:0};}if(f.type==='리그'){monthlyStats.matches++;monthlyStats.w+=win?1:0;monthlyStats.d+=draw?1:0;monthlyStats.l+=(!win&&!draw)?1:0;monthlyStats.goals+=gf;monthlyStats.conceded+=ga;}const wageAnchorDay=gm.wageAnchorDay==null?f.day:gm.wageAnchorDay;const wagePaidWeeks=gm.wagePaidWeeks||0;const dueWageWeeks=Math.max(0,Math.floor((f.day-wageAnchorDay)/7)-wagePaidWeeks);const weeklyWage=Math.round((gm.salary||0)/52);const wagePayment=dueWageWeeks*weeklyWage;const wagePaidThrough=wagePaidWeeks+dueWageWeeks;const result={...gm,fixtures:fixtures.sort((a,b)=>a.day-b.day),table,played:gm.played+(f.type==='리그'?1:0),w:gm.w+(f.type==='리그'&&win?1:0),d:gm.d+(f.type==='리그'&&draw?1:0),l:gm.l+(f.type==='리그'&&!win&&!draw?1:0),gf:gm.gf+(f.type==='리그'?gf:0),ga:gm.ga+(f.type==='리그'?ga:0),pts:gm.pts+(f.type==='리그'?(win?3:draw?1:0):0),fitness:clamp(gm.fitness+Math.min(9,Math.max(0,f.day-gm.lastDay-2)*.55)+(rot==='주전 기용'?-4:rot==='부분 로테이션'?1:4),30,100),morale:clamp(gm.morale+resultMoraleChange(gm.squad||[],win,draw)),security,streak:win?0:gm.streak+1,fa,carabao,trophies,lastDay:f.day,wageAnchorDay,wagePaidWeeks:wagePaidThrough,lastWagePayment:wagePayment>0?{amount:wagePayment,weeks:dueWageWeeks,day:f.day,date:seasonDate(gm,f.day).label}:gm.lastWagePayment,totalWagesReceived:(gm.totalWagesReceived||0)+wagePayment,cash:(gm.cash||0)+wagePayment,lastResult:{fixture:f,gf,ga,win,draw,rotation:rot,fanReactions:gm.foreignFanProfile?makeForeignFanReactions(gm.club,win,draw):makeFanReactions(win,draw,gm.club)},history:[...gm.history.slice(-19),{type:f.type,opponent:f.opponent,score:`${gf}-${ga}${m.shootout?` (승부차기 ${m.shootout.home}-${m.shootout.away})`:''}`,result:win?'승리':draw?'무승부':'패배'}],news:[`${gm.club} ${gf}-${ga} ${f.opponent}`,`${win?'승리':draw?'무승부':'패배'} · ${f.type} ${f.round}라운드`],interview:!win&&!draw&&(['맨체스터 유나이티드','에버턴','맨체스터 시티','첼시','아스널'].includes(f.opponent)||(f.type==='FA컵'&&f.round===6)||(f.type==='카라바오컵'&&f.round===5))?{opponent:f.opponent,competition:f.type}:null};
 if(f.type==='리그'){const month=Math.floor((f.day-1)/30)+1;let monthlyStats={...(gm.monthlyStats||{})};let monthlyAwards=[...(gm.monthlyAwards||[])];const prevMonth=monthlyStats.month;if(prevMonth&&prevMonth!==month){const own=monthlyStats;const ownScore=own.w*5+own.d*2+own.gf*.45-own.ga*.65;const rivals=managerLeagueClubs(gm).filter(n=>n!==gm.club).map((name,i)=>{const pr=clubProfile(name,gm.tier);const seed=(hashClub(name)+gm.season*31+prevMonth*17)%100;const p=Math.max(3,Math.min(5,Math.round(own.p||4)));const w=Math.max(0,Math.min(p,Math.round((seed/100)*p*(.45+pr.expectedRank/20))));const d=Math.min(p-w,Math.floor((seed%4)/2));const l=p-w-d;const gf=Math.max(1,Math.round((pr.공격/24)*p/2));const ga=Math.max(0,Math.round((pr.수비/28)*p/2));return {club:name,w,d,l,gf,ga,score:w*5+d*2+gf*.45-ga*.65};}).sort((a,b)=>b.score-a.score);const winner=[{club:gm.club,w:own.w,d:own.d,l:own.l,gf:own.gf,ga:own.ga,score:ownScore},...rivals].sort((a,b)=>b.score-a.score)[0];monthlyAwards.push({season:gm.season,month:prevMonth,winner:winner.club,record:`${winner.w}승 ${winner.d}무 ${winner.l}패`,goals:winner.gf,conceded:winner.ga,score:Math.round(winner.score*10)/10});monthlyStats={month,p:0,w:0,d:0,l:0,gf:0,ga:0};}else if(!prevMonth)monthlyStats={month,p:0,w:0,d:0,l:0,gf:0,ga:0};monthlyStats={...monthlyStats,month,p:monthlyStats.p+1,w:monthlyStats.w+(win?1:0),d:monthlyStats.d+(draw?1:0),l:monthlyStats.l+(!win&&!draw?1:0),gf:monthlyStats.gf+gf,ga:monthlyStats.ga+ga};result.monthlyStats=monthlyStats;result.monthlyAwards=monthlyAwards;}
 if(f.type==='리그'&&result.played>=8&&!gm.renewalOffer&&gm.renewalOfferedSeason!==gm.season){const ppg=result.pts/Math.max(1,result.played);const target=String(gm.expectations?.league||'').includes('우승')?2.05:String(gm.expectations?.league||'').includes('챔피언스')?1.75:1.45;if(ppg>=target&&result.security>=55){result.renewalOffer={source:'midseason',years:3,salary:Math.round(result.salary*1.18),bonus:Math.round(result.salary*.25),message:'시즌 성과가 구단의 기대를 뛰어넘고 있습니다. 이사회가 장기 재계약을 제안했습니다.'};result.renewalOfferedSeason=gm.season;}}
 return {gm:result,result:result.lastResult};}
function simulateAI(table,club,total){return table.map(row=>{if(row.name===club)return row;const played=total;const wins=Math.floor(Math.random()*(played+1)),draws=Math.floor(Math.random()*(played-wins+1)),losses=played-wins-draws;const gf=Math.floor(Math.random()*played*2.2),ga=Math.floor(Math.random()*played*2.2);return {...row,p:played,w:wins,d:draws,l:losses,gf,ga,pts:wins*3+draws};});}

export function resolveAwardReaction(gm,choice){const award=gm.pendingAwards;if(!award)return gm;const earned=award.winners.filter(x=>x.club===gm.club);const winnerNames=new Set(earned.map(x=>x.name));const boost=choice==='팀을 치켜세운다'?2:choice==='팀이 더 중요하다고 말한다'?earned.length*4+3:-2;const updatedSquad=(gm.squad||[]).map(p=>({...p,morale:clamp((p.morale??70)+(choice==='팀을 치켜세운다'&&winnerNames.has(p.name)?12:choice==='팀이 더 중요하다고 말한다'?4:0))}));return {...gm,morale:clamp((gm.morale??75)+boost),squad:updatedSquad,pendingAwards:null,awardHistory:[...(gm.awardHistory||[]),{season:gm.season-1,winners:award.winners,reaction:choice}],news:[`${choice==='팀을 치켜세운다'?'개인 수상자의 활약을 집중 조명했습니다.':choice==='팀이 더 중요하다고 말한다'?'감독은 팀 전체의 공헌을 강조했습니다.':'수상에 담담한 반응을 보였습니다.'}`,...(gm.news||[])]};}
export function recordPlayerMatchStats(squad,goals,matchContext={}){const win=!!matchContext.win,draw=!!matchContext.draw;const allPlayers=assignSquadRoles((squad||[]).map(p=>({...p,seasonGoals:p.seasonGoals||0,seasonAssists:p.seasonAssists||0,seasonAppearances:p.seasonAppearances||0,seasonRatingTotal:p.seasonRatingTotal||0})));const selected=new Set(matchContext.selectedXI||[]);const players=matchContext.selectedXI?.length?allPlayers.filter(p=>selected.has(p.id||p.name)):allPlayers;for(const player of players){player.seasonAppearances++;const roleBonus=player.squadRole==='주전'?.25:player.squadRole==='부분 로테이션'?0:-.2;const resultBonus=win?.45:draw?.1:-.35;const positionalBonus=player.position==='골키퍼'?(matchContext.ga===0?.35:-.05):0;const rating=clamp(6.35+resultBonus+roleBonus+positionalBonus+(Math.random()-.5)*.9,5,9.8);player.seasonRatingTotal+=rating;player.seasonAverageRating=Number((player.seasonRatingTotal/player.seasonAppearances).toFixed(2));}for(let i=0;i<goals;i++){const pick=Math.random();const preferred=pick<.72?'공격':pick<.96?'중원':'수비';let scorers=players.filter(p=>p.position===preferred);if(!scorers.length)scorers=players.filter(p=>p.position==='공격'||p.position==='중원');if(!scorers.length)continue;const scorer=scorers[Math.floor(Math.random()*scorers.length)];scorer.seasonGoals++;scorer.seasonRatingTotal+=.3;scorer.seasonAverageRating=Number((scorer.seasonRatingTotal/Math.max(1,scorer.seasonAppearances)).toFixed(2));const helpers=players.filter(p=>p.id!==scorer.id&&p.name!==scorer.name&&p.position!=='골키퍼');if(helpers.length&&Math.random()<.68){const weighted=helpers.flatMap(p=>Array(p.position==='중원'?3:p.position==='공격'?2:1).fill(p));const helper=weighted[Math.floor(Math.random()*weighted.length)];helper.seasonAssists++;helper.seasonRatingTotal+=.18;helper.seasonAverageRating=Number((helper.seasonRatingTotal/Math.max(1,helper.seasonAppearances)).toFixed(2));}}return allPlayers;}
function createSeasonAwards(gm,pos){const squad=assignSquadRoles((gm.squad||[]).map(p=>({...p,seasonGoals:p.seasonGoals||0,seasonAssists:p.seasonAssists||0,seasonAverageRating:Number(p.seasonAverageRating||0)})));const winners=[];const ownGoals=squad.slice().sort((a,b)=>b.seasonGoals-a.seasonGoals)[0];const ownAssists=squad.slice().sort((a,b)=>b.seasonAssists-a.seasonAssists)[0];if(ownGoals&&ownGoals.seasonGoals>=25)winners.push({award:'득점왕',name:ownGoals.name,club:gm.club,stat:`${ownGoals.seasonGoals}골`});if(ownAssists&&ownAssists.seasonAssists>=13)winners.push({award:'도움왕',name:ownAssists.name,club:gm.club,stat:`${ownAssists.seasonAssists}도움`});const comp=gm.europeanCompetition;const championsLeague=comp?.competition==='챔피언스리그';const uclWinner=championsLeague&&comp?.stage==='대회 종료'&&comp?.final?.winner===gm.club;const uclRunnerUp=championsLeague&&comp?.stage==='대회 종료'&&comp?.final?.winner&&comp.final.winner!==gm.club&&(comp.final.home===gm.club||comp.final.away===gm.club);const leagueChampion=pos===1,leagueRunnerUp=pos===2;const starters=squad.filter(p=>p.squadRole==='주전'&&(p.seasonAppearances||0)>=Math.max(10,Math.round((gm.played||38)*.35)));const ranked=starters.map(p=>({...p,awardRating:Number(p.seasonAverageRating||((p.seasonRatingTotal||0)/Math.max(1,p.seasonAppearances||0)))})).sort((a,b)=>b.awardRating-a.awardRating||(b.seasonGoals+b.seasonAssists)-(a.seasonGoals+a.seasonAssists));const top=ranked[0];const doubleChampion=leagueChampion&&uclWinner;const nearDouble=(leagueChampion&&uclRunnerUp)||(leagueRunnerUp&&uclWinner);const ballonEligible=gm.tier===1&&top&&((doubleChampion&&top.awardRating>=7.0)||(nearDouble&&top.awardRating>=8.0));if(ballonEligible)winners.push({award:'발롱도르',name:top.name,club:gm.club,stat:`평점 ${top.awardRating.toFixed(2)} · ${top.seasonGoals}골 ${top.seasonAssists}도움`});return {squad,winners,ownAwards:winners.filter(x=>x.club===gm.club)};}
function simulateForeignTable(gm,total){return (gm.table||[]).map(row=>{if(row.name===gm.club)return {...row,p:total,w:gm.w,d:gm.d,l:gm.l,gf:gm.gf,ga:gm.ga,pts:gm.pts};const profile=foreignClubProfile(row.name,gm.leagueName);const strength=(profile.공격+profile.중원+profile.수비)/3;const winRate=clamp(.2+(strength-45)/105,.14,.68);const draws=Math.round(total*(.18+((hashClub(row.name)%7)/100)));const wins=Math.round(total*winRate);const losses=Math.max(0,total-wins-draws);const gf=Math.round(total*(.75+strength/100*.85));const ga=Math.round(total*(1.65-strength/100*.8));return {...row,p:total,w:wins,d:draws,l:losses,gf,ga,pts:wins*3+draws};});}
function closeForeignSeason(gm){
 const total=Math.max(0,((gm.leagueClubs||[]).length||20)-1)*2;if(gm.played<total)return {error:`리그 경기가 ${total}경기 끝나야 시즌을 마감할 수 있습니다.`};if((gm.fixtures||[]).some(f=>!f.played&&f.active&&[...Object.keys(foreignCupRounds),'수페르코파 데 에스파냐','DFL-슈퍼컵','수페르코파 이탈리아나','트로페 데 샹피옹','요한 크라위프 스할','수페르타사 칸디두 드 올리베이라','벨기에 슈퍼컵','튀르키예 슈퍼컵'].includes(f.type)&&(gm.domesticCups||{})[f.type]==='진행 중'))return {error:'진행 중인 국내 컵대회 일정을 모두 마쳐야 시즌을 종료할 수 있습니다.'};
 const table=simulateForeignTable(gm,total).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));const pos=table.findIndex(x=>x.name===gm.club)+1;const overperform=pos<=Math.max(4,Math.ceil(table.length*.25))||gm.trophies>0;const renewalOffer=overperform?{source:'season',years:3,salary:Math.round(gm.salary*(pos===1?1.35:1.2)),bonus:Math.round(gm.salary*.35),message:`${gm.leagueName} ${pos}위 성과에 만족한 구단이 재계약을 제안했습니다.`}:null;
 const aged=(gm.squad||[]).map(p=>({...p,age:p.age+1,rating:clamp(p.rating+(p.age<24?1:p.age>=34?-3:0),35,99)}));const nextSeason=gm.season+1;const fixtures=createSeasonFromClubs(gm.leagueClubs,gm.club,nextSeason,'INT-');const foreignCups=createForeignDomesticCupFixtures(gm.leagueName,gm.club,nextSeason,gm.leagueClubs);fixtures.push(...foreignCups.fixtures);const record={season:gm.season,position:pos,points:gm.pts,movement:'해외 리그 시즌 종료',europe:'없음',league:gm.leagueName};const growth=Object.fromEntries(Object.entries(gm.stats).map(([k,v])=>[k,clamp(v+gm.growth+(Math.random()>.5?1:0),0,99)]));
 return {record,gm:{...gm,season:nextSeason,seasonStartYear:(gm.seasonStartYear||2026)+1,played:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,table:freshTableFromClubs(gm.leagueClubs),fixtures,domesticCups:foreignCups.status,history:[...(gm.history||[])],seasonHistory:[...(gm.seasonHistory||[]),record],salary:renewalOffer?gm.salary:Math.round(gm.salary*(pos<=4?1.08:1)),contractYears:Math.max(0,(gm.contractYears||0)-1),renewalOffer,renewalOfferedSeason:gm.season,stats:growth,squad:aged,trophies:(gm.trophies||0)+(pos===1?1:0),careerTrophies:pos===1?[...(gm.careerTrophies||[]),{name:`${gm.leagueName} 우승`,season:gm.season,club:gm.club,emoji:'🏆'}]:(gm.careerTrophies||[]),clubHistory:(gm.clubHistory||[]).map((c,i)=>i===(gm.clubHistory||[]).length-1?{...c,seasons:(c.seasons||0)+1,trophies:(c.trophies||0)+(pos===1?1:0)}:c),teamRatings:{공격:aged.find(p=>p.position==='공격')?.rating||50,중원:aged.find(p=>p.position==='중원')?.rating||50,수비:aged.find(p=>p.position==='수비')?.rating||50,골키퍼:aged.find(p=>p.position==='골키퍼')?.rating||50},morale:clamp((gm.morale||70)+(pos<=4?8:-4)),security:clamp((gm.security||70)+(pos<=4?12:-8)),lastDay:0,wageAnchorDay:null,wagePaidWeeks:0,lastWagePayment:null,event:null,status:'재직'}};
}
export function resolveRenewalOffer(gm,choice){if(!gm.renewalOffer)return gm;if(choice==='accept'){const offer=gm.renewalOffer;return {...gm,contractYears:offer.years,salary:offer.salary,cash:(gm.cash||0)+offer.bonus,renewalOffer:null,renewalOfferedSeason:gm.season,security:clamp((gm.security||70)+8),news:[`구단과 ${offer.years}년 재계약을 체결했습니다.`,...(gm.news||[])]};}return {...gm,renewalOffer:null,renewalOfferedSeason:gm.season,security:clamp((gm.security||70)-3),news:['감독이 재계약 제안을 보류했습니다.',...(gm.news||[])]};}
export function closeSeason(gm){if(gm.isForeign)return closeForeignSeason(gm);const europeanWorld=simulateEuropeanWorld(gm.europeanWorld||createEuropeanWorld(),gm.season);const europeanMovementHistory=[...(gm.europeanMovementHistory||[]),{season:gm.season,leagues:Object.entries(europeanWorld).map(([league,m])=>({league,promoted:m.lastMovement.filter(x=>x.direction==='승격').map(x=>x.club),relegated:m.lastMovement.filter(x=>x.direction==='강등').map(x=>x.club)}))}];const total=gm.tier===1?38:46;if(gm.played<total)return {error:`리그 경기가 ${total}경기 끝나야 시즌을 마감할 수 있습니다.`};if(gm.fixtures.some(f=>!f.played&&f.active&&f.type!=='리그'&&((f.type==='FA컵'&&gm.fa==='진행 중')||(f.type==='카라바오컵'&&gm.carabao==='진행 중'))))return {error:'진행 중인 컵대회 일정도 모두 마쳐야 시즌을 종료할 수 있습니다.'};let table=gm.table.map(x=>x.name===gm.club?{...x,p:gm.played,w:gm.w,d:gm.d,l:gm.l,gf:gm.gf,ga:gm.ga,pts:gm.pts}:x).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));const pos=table.findIndex(x=>x.name===gm.club)+1;let tier=gm.tier,movement='잔류';if(tier===1&&pos>=18){tier=2;movement='강등';}else if(tier===2&&pos<=2){tier=1;movement='자동 승격';}else if(tier===3&&pos<=2){tier=2;movement='자동 승격';}else if(tier===4&&pos<=3){tier=3;movement='자동 승격';}else if(tier===5&&pos===1){tier=4;movement='자동 승격';}else if((tier===6||tier===7)&&pos===1){tier=5;movement='지역리그 우승 승격';}else if(tier===2&&pos>=22){tier=3;movement='강등';}else if(tier===3&&pos>=21){tier=4;movement='강등';}else if(tier===4&&pos>=23){tier=5;movement='강등';}else if(tier===5&&pos>=21){tier=Math.random()<.5?6:7;movement='강등';}
 let europe='없음';if(gm.tier===1){if(pos<=5)europe='챔피언스리그';else if(pos<=7)europe='유로파리그';else if(pos===8)europe='컨퍼런스리그';if(gm.fa==='우승'&&pos>7)europe='유로파리그';if(gm.carabao==='우승'&&pos>8&&europe==='없음')europe='컨퍼런스리그';}
 const originalTier=gm.tier;const failed=gm.security<18||(pos>=18&&gm.tier===1&&gm.streak>=5);const playoff=!failed&&((originalTier===2||originalTier===3)?(pos>=3&&pos<=6):originalTier===4?(pos>=4&&pos<=7):(originalTier>=5&&pos>=2&&pos<=7));if(playoff)movement='승격 플레이오프 진출';const event=gm.contractYears<=1?'계약 만료 및 재계약 협상':shuffled(['핵심 선수와 갈등','유망주 발굴','주장단 교체','전술 변화 제안','상위 구단의 관심','훈련 시설 개선','선수단 부상 위기'])[0];const nextClub=gm.club;const clubHistory=(gm.clubHistory||[]).map((c,i)=>i===(gm.clubHistory||[]).length-1?{...c,seasons:c.seasons+1,trophies:c.trophies+(pos===1?1:0)}:c);const careerTrophies=[...(gm.careerTrophies||[])];if(pos===1)careerTrophies.push({name:leagueForTier(gm.tier).name+' 우승',season:gm.season,club:gm.club,emoji:'🏆'});if(gm.fa==='우승')careerTrophies.push({name:'FA컵',season:gm.season,club:gm.club,emoji:'🏆'});if(gm.carabao==='우승')careerTrophies.push({name:'카라바오컵',season:gm.season,club:gm.club,emoji:'🏆'});const awardResult=createSeasonAwards(gm,pos);const agedSquad=awardResult.squad.map(p=>({...p,age:p.age+1,rating:clamp(p.rating+(p.age<21?Math.min(3,1+Math.floor(((p.potential||p.rating+5)-p.rating)/12)):p.age<24?1:p.age>=34?-4:p.age>=31?-2:0),35,99)})).filter(p=>!(p.star&&p.age>=36));const squadAfter=agedSquad.length?agedSquad:makeSquad(nextClub,tier);const avgAge=averageSquadAge(squadAfter);const starCandidate=squadAfter.find(p=>p.star||p.rating>=84);const pendingStarTransfer=starCandidate&&Math.random()<.42?{playerId:starCandidate.id||null,playerName:starCandidate.name,position:starCandidate.position,fee:Math.round(Math.max(1200000000,(starCandidate.rating-45)*6500000000)*(starCandidate.age>=32?.48:starCandidate.age>=29?.72:1.0)),rating:starCandidate.rating,age:starCandidate.age}:null;const growth=Object.fromEntries(Object.entries(gm.stats).map(([k,v])=>[k,clamp(v+gm.growth+(Math.random()>.5?1:0)-(gm.age>gm.peakAge?1:0),0,99)]));const managerScore=gm.w*5+gm.d*2+gm.gf*.35-gm.ga*.55+(Math.max(0,12-pos)*3)+(gm.fa==='우승'?12:0)+(gm.carabao==='우승'?8:0);const seasonManagerAward={season:gm.season,winner:(pos<=3||gm.fa==='우승'||gm.carabao==='우승')?gm.club:(leagueForTier(gm.tier).clubs.filter(n=>n!==gm.club).sort((a,b)=>clubProfile(b,gm.tier).expectedRank-clubProfile(a,gm.tier).expectedRank)[0]||'타 구단'),position:pos,record:`${gm.w}승 ${gm.d}무 ${gm.l}패`,goals:gm.gf,conceded:gm.ga,points:gm.pts,score:Math.round(managerScore*10)/10};const record={season:gm.season,position:pos,points:gm.pts,movement,europe,fa:gm.fa,carabao:gm.carabao,managerAward:seasonManagerAward};const performanceFactor=pos===1?1.28:pos<=4?1.16:pos<=7?1.08:pos>=18?.78:1;const newSalary=Math.round(gm.salary*(movement.includes('승격')?1.3:movement==='강등'?.8:performanceFactor));const europeanCompetition=europe!=='없음'?europeanDraw(europe,gm.season+1,nextClub):null;const finance=clubFinances(nextClub,tier);const nextTransferBudget=Math.round((gm.transferBudget??finance.transferBudget)*(.72+finance.scale*.28)*(pos===1?1.25:pos<=7?1.1:pos>=18?.75:1));const seasonRenewal=(!failed&&!gm.renewalOffer&&(pos<=Math.max(4,Math.ceil(table.length*.2))||movement.includes('승격')||gm.fa==='우승'||gm.carabao==='우승'))?{source:'season',years:3,salary:Math.round(newSalary*1.2),bonus:Math.round(newSalary*.3),message:`시즌 ${pos}위와 구단 목표 달성에 만족한 이사회가 재계약을 제안했습니다.`}:null;return {gm:{...gm,youthPool:generateYouthProspects({...gm,season:gm.season+1}),club:nextClub,tier,age:gm.age+1,trophies:gm.trophies+(pos===1?1:0),awards:gm.awards+(pos===1?1:0),stats:growth,salary:newSalary,transferBudget:nextTransferBudget,cash:gm.cash+(gm.fa==='우승'?newSalary*.5:0)+(gm.carabao==='우승'?newSalary*.3:0),season:gm.season+1,seasonStartYear:(gm.seasonStartYear||2026)+1,contractYears:Math.max(0,gm.contractYears-1),renewalOffer:seasonRenewal,renewalOfferedSeason:seasonRenewal?gm.season:gm.renewalOfferedSeason,played:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,fitness:88,morale:75,security:failed?0:clamp(gm.security+12),streak:0,fixtures:[...createSeason(tier,nextClub,gm.season+1),...(europeanCompetition?europeanCompetition.fixtures:[])].sort((a,b)=>a.day-b.day),table:freshTable(tier,nextClub),fa:'진행 중',carabao:tier<=4?'진행 중':'불참',europe,seasonHistory:[...gm.seasonHistory,record],managerAwards:[...(gm.managerAwards||[]),seasonManagerAward],monthlyAwards:gm.monthlyAwards||[],monthlyStats:{month:7,w:0,d:0,l:0,goals:0,conceded:0,matches:0},clubHistory,careerTrophies,squad:assignSquadRoles(squadAfter.map(p=>({...p,seasonGoals:0,seasonAssists:0,seasonAppearances:0,seasonRatingTotal:0,seasonAverageRating:0}))),pendingAwards:awardResult.ownAwards.length?{winners:awardResult.winners}:null,pendingStarTransfer,teamRatings:{공격:squadAfter.find(p=>p.position==='공격')?.rating||50,중원:squadAfter.find(p=>p.position==='중원')?.rating||50,수비:squadAfter.find(p=>p.position==='수비')?.rating||50,골키퍼:squadAfter.find(p=>p.position==='골키퍼')?.rating||50},morale:clamp((gm.morale??75)+(avgAge<23?0:avgAge>30?0:0)+(awardResult.ownAwards.length?3:0)),europeanWorld,europeanMovementHistory,europeanCompetition,status:failed?'무직':'재직',event,offers:failed?getOffersAfterSeason({...gm,season:gm.season+1}):[],club:failed?null:nextClub,tier:failed?null:tier,pendingPlayoff:playoff?{fromTier:originalTier,toTier:originalTier>=6?5:originalTier-1,position:pos}:null,lastDay:0,wageAnchorDay:null,wagePaidWeeks:0,lastWagePayment:null},record};}

export function resolvePlayoff(gm){if(!gm.pendingPlayoff)return gm;const chance=Math.max(.25,Math.min(.82,.48+(gm.stats.전술+gm.stats.경기분석-100)/250+(gm.morale-70)/300));const win=Math.random()<chance;const tier=win?gm.pendingPlayoff.toTier:gm.tier;const movement=win?'플레이오프 승격 성공':'플레이오프 탈락';return {...gm,tier,fixtures:createSeason(tier,gm.club,gm.season),table:freshTable(tier,gm.club),status:'재직',pendingPlayoff:null,seasonHistory:[...gm.seasonHistory,{season:gm.season-1,position:gm.pendingPlayoff.position,points:gm.pts,movement,europe:gm.europe,fa:gm.fa,carabao:gm.carabao}]};}
export const shopItems=[
 {name:'게겐프레싱 전술 마스터클래스',tactic:'게겐프레싱',price:450000000,desc:'전방 압박과 즉각적인 볼 탈취 이해도 +4'},
 {name:'점유율 축구 전술 마스터클래스',tactic:'점유율축구',price:450000000,desc:'빌드업과 경기 통제 이해도 +4'},
 {name:'역습 축구 전술 마스터클래스',tactic:'역습',price:450000000,desc:'수비 블록과 빠른 전환 이해도 +4'},
 {name:'선수단 관리 전문 과정',stat:'선수관리',amount:2,price:400000000,desc:'선수 관리 능력 +2 · 경기 체력 관리와 부상 예방 능력 향상'},
 {name:'상대 분석 데이터랩',stat:'경기분석',amount:2,price:400000000,desc:'경기 분석 능력 +2 · 상대 전력 분석을 통한 경기 준비 보너스'},
 {name:'팀 토크 리더십 워크숍',stat:'동기부여',amount:2,price:400000000,desc:'동기부여 능력 +2 · 선수단 사기와 경기 중 독려 효과 향상'},
 {name:'엘리트 유소년 아카데미 연수',stat:'유소년육성',amount:2,price:400000000,desc:'유소년 육성 능력 +2 · 높은 잠재력을 지닌 유망주 발굴 확률 상승'},
 {name:'위기 대응 시뮬레이션',stat:'위기관리',amount:2,price:400000000,desc:'위기관리 능력 +2 · 연패와 경기 중 돌발 상황에서 팀 안정성 향상'}
];
export function buyItem(gm,item){
 const week=Math.floor((gm.lastDay||0)/7);
 if(gm.shopPurchaseWeek===week)return {error:'성장 상점 상품은 일주일에 한 번만 구매할 수 있습니다.'};
 if(gm.cash<item.price)return {error:'자금이 부족합니다.'};
 const next={...gm,cash:gm.cash-item.price,items:[...(gm.items||[]),item.name],shopPurchaseWeek:week};
 if(item.tactic){
  const tacticUnderstanding={게겐프레싱:35,점유율축구:35,역습:35,...(gm.tacticUnderstanding||{})};
  tacticUnderstanding[item.tactic]=clamp((tacticUnderstanding[item.tactic]||35)+4,0,100);
  next.tacticUnderstanding=tacticUnderstanding;
 }
 if(item.stat){
  next.stats={...(gm.stats||{})};
  next.stats[item.stat]=clamp((next.stats[item.stat]||40)+(item.amount||2),0,100);
 }
 return {gm:next};
}
export function resolveInterview(gm,choice){if(!gm.interview)return gm;let security=gm.security,morale=gm.morale;const effects={'선수단을 감싼다':[-1,8],'선수들의 투지를 칭찬한다':[2,7],'전술적 판단의 책임을 인정한다':[5,2],'결정력 부족을 지적한다':[1,-3],'심판 판정에 유감을 표한다':[-3,-1],'상대의 경기력을 인정한다':[2,1],'다음 경기 반등을 약속한다':[3,3],'팬들에게 사과한다':[4,2],'선수단의 집중력을 요구한다':[1,-2],'팬들에게 감사를 전한다':[2,3],'선수 교체 판단은 내 책임이다':[5,2],'상대 압박에 대응하지 못했다':[3,-1],'찬스를 살리지 못한 점이 아쉽다':[2,-2],'수비 간격부터 다시 점검하겠다':[3,1],'경기 운영의 균형을 찾겠다':[4,2],'선수들은 계획을 충실히 수행했다':[1,5],'오늘 결과보다 과정에서 배울 점이 많다':[2,2],'팬들의 실망을 이해한다':[4,1],'다음 경기에는 더 과감하게 나서겠다':[2,4],'상대에게 주도권을 내준 것이 패인이다':[3,-1],'우리가 준비한 축구를 끝까지 밀고 가겠다':[1,4],'선수단과 함께 해답을 찾겠다':[2,5],'기회 창출은 좋았지만 마무리가 부족했다':[3,-1],'승점 1점에 안주하지 않겠다':[2,2],'공격 전개가 계획대로 이뤄졌다':[2,4],'선수단의 집중력을 높이 평가한다':[2,5],'상황에 맞게 유연하게 대응하겠다':[4,2],'팀 전체의 공헌을 기억하겠다':[2,4],'선수단을 믿고 준비하겠다':[2,4]};const [ds,dm]=effects[choice]||[1,1];security=clamp(security+ds);morale=clamp(morale+dm);const index=gm.interview.questionIndex||0;const questions=gm.interview.questions||[{question:gm.interview.question,options:gm.interview.options}];const nextIndex=index+1;const squad=(gm.squad||[]).map(p=>({...p,morale:clamp((p.morale??70)+(choice==='선수단을 감싼다'?5:choice==='선수들의 투지를 칭찬한다'||choice==='선수단과 함께 해답을 찾겠다'?6:choice==='선수단의 집중력을 요구한다'||choice==='결정력 부족을 지적한다'?-2:dm>0?2:0))}));const lastInterview={choice,securityChange:ds,moraleChange:dm};if(nextIndex<questions.length){const q=questions[nextIndex];return {...gm,security,morale,squad,interview:{...gm.interview,questionIndex:nextIndex,question:q.question,options:q.options},lastInterview};}return {...gm,security,morale,squad,interview:null,lastInterview,interviewComplete:true};}
export function resolveEvent(gm,choice){const g={...gm,stats:{...gm.stats}};if(choice==='재계약 체결'){g.contractYears=3;g.salary=Math.round(g.salary*1.1);g.security=clamp(g.security+5);g.event=null;return g;}if(choice==='선수단과 대화'){g.morale=clamp(g.morale+12);g.security=clamp(g.security+3);}if(choice==='훈련 강화'){g.growth++;g.fitness=clamp(g.fitness-10);}if(choice==='재정 안정')g.cash+=g.salary*.4;if(choice==='유망주 육성')g.stats.유소년육성=clamp(g.stats.유소년육성+3);return {...g,event:null};}
export function getOffersAfterSeason(gm){const avg=Object.values(gm.stats).reduce((a,b)=>a+b,0)/Object.values(gm.stats).length;const route=gm.tier<=2||gm.trophies>=3||avg>=76?'legend':gm.tier<=4||avg>=62?'youth':gm.tier<=5||avg>=50?'license':'unknown';return makeOffers(route,gm.philosophy,gm.nationality||'대한민국');}

// Live match mode: short playable match segments with halftime, substitutions and late-game decisions.
const XI_COUNTS={공격:3,중원:4,수비:3,골키퍼:1};
export function selectMatchXI(squad=[],rotation='주전 기용'){
 const selected=[];const used=new Set();
 for(const [position,count] of Object.entries(XI_COUNTS)){
  const group=squad.filter(p=>p.position===position).slice().sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0));
  if(!group.length)continue;
  const starters=rotation==='대규모 로테이션'?Math.max(1,Math.floor(count*.45)):rotation==='부분 로테이션'?Math.max(1,count-1):count;
  const chosen=[...group.slice(0,starters),...group.slice(starters,Math.min(group.length,count))].slice(0,count);
  for(const player of chosen){const key=player.id||player.name;if(!used.has(key)){used.add(key);selected.push(player);}}
 }
 // 포지션 인원이 부족한 구단은 아직 뽑히지 않은 선수로 11명을 보충한다.
 if(selected.length<Math.min(11,squad.length)){for(const player of squad.slice().sort((a,b)=>(Number(b.rating)||0)-(Number(a.rating)||0))){const key=player.id||player.name;if(!used.has(key)){used.add(key);selected.push(player);}if(selected.length>=Math.min(11,squad.length))break;}}
 return selected;
}
export function getTeamRatings(gm={},rotation='주전 기용'){
 const squad=gm.squad?.length?gm.squad:makeSquad(gm.club||'구단',gm.tier||4);const xi=selectMatchXI(squad,rotation);
 const average=position=>{const players=xi.filter(p=>p.position===position);if(!players.length)return Number(gm.teamRatings?.[position]||50);const avgAge=players.reduce((sum,p)=>sum+Number(p.age||26),0)/players.length;const base=players.reduce((sum,p)=>sum+Number(p.rating||50),0)/players.length;const ageMod=avgAge<23?Math.min(3.5,(23-avgAge)*.7):avgAge>30?-Math.min(5,(avgAge-30)*.8):0;return clamp(base+ageMod,20,99);};
 return {공격:average('공격'),중원:average('중원'),수비:average('수비'),골키퍼:average('골키퍼')};
}
export function scoutOpponent(club,tier=1,analysisSkill=40){const profile=clubProfile(club,tier),skill=clamp(Number(analysisSkill)||0,0,100);const precision=skill>=85?1:skill>=65?4:skill>=40?8:15;const estimate=value=>{const offset=((hashClub(`${club}-${value}-${Math.floor(skill/10)}`)% (precision*2+1))-precision);const n=clamp(Math.round((value+offset)/5)*5,20,99);return skill<25?(n>=80?'매우 높음':n>=65?'높음':n>=50?'보통':'낮음'):`약 ${n}${skill<65?' (오차 가능)':''}`;};const keeper=clamp(profile.수비+((hashClub(`${club}-keeper`)%9)-4),20,99);return {expectedRank:skill>=35?profile.expectedRank:null,ratings:{공격:estimate(profile.공격),중원:estimate(profile.중원),수비:estimate(profile.수비),골키퍼:estimate(keeper)},strength:skill>=40?profile.strength:null,weakness:skill>=60?profile.weakness:null,style:skill>=75?profile.style:null,confidence:skill>=85?'매우 높음':skill>=65?'높음':skill>=40?'보통':'낮음'};}
function formationEffects(formation='4-3-3'){
 const map={'4-3-3':{공격:3,중원:1,수비:-.5},'4-2-3-1':{공격:1.5,중원:2.5,수비:1},'4-4-2':{공격:2,중원:0,수비:1},'3-4-2-1':{공격:2.5,중원:1.5,수비:-1.5},'3-5-2':{공격:1,중원:4,수비:-1},'4-1-4-1':{공격:0,중원:3.5,수비:2}};
 return map[formation]||map['4-3-3'];
}
export function beginLiveMatch(gm,opts={}){
 const f=nextFixture(gm);if(!f)return {error:'진행할 경기가 없습니다.'};
 const rotation=opts.rotation||'주전 기용';const gap=f.day-gm.lastDay;
 // 로테이션을 선택하면 체력 저하와 경기력 손실을 줄인다. 짧은 휴식일수록 효과가 커진다.
 const rotationPenalty=rotation==='대규모 로테이션'?-1.4:rotation==='부분 로테이션'?-0.5:0;
 const rotationRelief=rotation==='대규모 로테이션'?5:rotation==='부분 로테이션'?2:0;
 const recovery=Math.min(9,Math.max(0,gap-2)*.55);const managementSkill=Number(gm.stats?.선수관리||40);const effectiveFitness=clamp(gm.fitness+rotationRelief+recovery+Math.max(0,managementSkill-40)*.08,25,100);
 const fatigue=Math.max(0,88-effectiveFitness)*(gap<=3?.075:.035);
 const squad=gm.squad||makeSquad(gm.club,gm.tier);const selectedXI=selectMatchXI(squad,rotation);const ratings=getTeamRatings({...gm,squad},rotation);const shape=formationEffects(opts.formation);
 const attack=ratings.공격+shape.공격+(opts.width==='넓게'?1.8:opts.width==='좁게'?-.5:0)+(opts.tempo==='빠른 템포'?1.2:opts.tempo==='느린 템포'?-1:0);
 const midfield=ratings.중원+shape.중원+(opts.tempo==='느린 템포'?2:opts.tempo==='빠른 템포'?-1.2:0)+(opts.press==='높은 압박'?1.1:0);
 const defence=ratings.수비*.72+ratings.골키퍼*.28+shape.수비+(opts.line==='낮은 수비라인'?2:opts.line==='높은 수비라인'?-1.2:0);
 const tacticBonus=(gm.philosophy==='게겐프레싱'&&opts.press==='높은 압박'?2.2:0)+(gm.philosophy==='점유율 축구'&&opts.tempo==='느린 템포'?2.2:0)+(gm.philosophy==='역습 축구'&&opts.line==='낮은 수비라인'?2.2:0);
 const teamPower=(attack+midfield+defence)/3;const agePenalty=0;const venueBoost=f.home?4.5:-4.5;
 const motivationSkill=Number(gm.stats?.동기부여||40);const strength=(gm.stats.전술*.32+gm.stats.경기분석*.28+gm.stats.선수관리*.2+gm.stats.동기부여*.2)+gm.morale*(.10+Math.max(0,motivationSkill-40)*.0008)+tacticBonus+rotationPenalty-fatigue+(teamPower-60)*.48-agePenalty+venueBoost;
 const opponentProfile=clubProfile(f.opponent,gm.tier);const opponentBase=(opponentProfile.공격+opponentProfile.중원+opponentProfile.수비)/3;
 const attackEdge=(attack-opponentProfile.수비)/19;const midfieldEdge=(midfield-opponentProfile.중원)/25;const defenceEdge=(defence-opponentProfile.공격)/19;
 const analysisSkill=Number(gm.stats?.경기분석||40);const opponentPrepPenalty=Math.max(0,analysisSkill-40)*.035;const scout=scoutOpponent(f.opponent,gm.tier,analysisSkill);return {match:{fixture:f,minute:0,gf:0,ga:0,momentum:0,strength,opponentStrength:opponentBase+(f.home?-2.5:2.5)-opponentPrepPenalty,attack,midfield,defence,attackEdge,midfieldEdge,defenceEdge,opponentStyle:opponentProfile.style,selectedXI:selectedXI.map(p=>p.id||p.name),scoutReport:scout,rotation,rotationRelief,recovery,events:[f.home?'홈 관중의 응원을 받으며 킥오프를 기다립니다.':'원정 경기입니다. 상대 홈 관중의 압박을 견뎌야 합니다.',`전력 분석 · 공격 ${Math.round(attack)} / 중원 ${Math.round(midfield)} / 수비 ${Math.round(defence)}`,`전술 구조 · ${opts.formation||'4-3-3'} · ${opts.tempo||'보통 템포'} · ${opts.press||'중간 압박'}`],prompt:null,injury:false,redCard:false,finished:false,opts,fitnessLoss:0}};
}

export function recordEuropeanLeagueFixture(gm,fixture,gf,ga){
 const comp=gm.europeanCompetition;if(!comp||fixture?.round!=='리그 페이즈')return gm;
 const euroFixtures=(comp.fixtures||[]).map(x=>x.id===fixture.id?{...x,played:true,score:`${gf}-${ga}`} :x);
 let europeanCompetition={...comp,fixtures:euroFixtures,table:updateRoundTable(comp.table,gm.club,fixture.opponent,gf,ga,1)};
 const next={...gm,europeanCompetition};
 // The league-phase fixture ledger is separate from the manager's combined calendar.
 // Synchronize it and create the playoff bracket automatically after match eight.
 if(euroFixtures.length===8&&euroFixtures.every(x=>x.played)){
  const started=europeanKnockoutStart(next);
  if(!started.error)return started;
 }
 return next;
}
const foreignCupRounds={
 '코파 델 레이':['2라운드','32강','16강','8강','준결승','결승'],
 'DFB-포칼':['2라운드','16강','8강','준결승','결승'],
 '코파 이탈리아':['2라운드','16강','8강','준결승','결승'],
 '쿠프 드 프랑스':['2라운드','32강','16강','8강','준결승','결승'],
 'KNVB 베커르':['2라운드','16강','8강','준결승','결승'],
 '타사 드 포르투갈':['2라운드','16강','8강','준결승','결승'],
 '스코티시 컵':['2라운드','16강','8강','준결승','결승'],
 '스코티시 리그 컵':['준준결승','준결승','결승'],
 '벨기에 컵':['2라운드','16강','8강','준결승','결승'],
 '튀르키예 쿠파스':['2라운드','16강','8강','준결승','결승']
};
const domesticCupTypes=['FA컵','카라바오컵',...Object.keys(foreignCupRounds),'수페르코파 데 에스파냐','DFL-슈퍼컵','코파 이탈리아','수페르코파 이탈리아나','쿠프 드 프랑스','트로페 데 샹피옹','KNVB 베커르','요한 크라위프 스할','타사 드 포르투갈','수페르타사 칸디두 드 올리베이라','벨기에 컵','벨기에 슈퍼컵','튀르키예 쿠파스','튀르키예 슈퍼컵'];
function isDomesticCup(type){return domesticCupTypes.includes(type);}
function advanceForeignCup(gm,fixtures,f,win){
 const type=f.type,status={...(gm.domesticCups||{})};let trophies=gm.trophies||0,careerTrophies=[...(gm.careerTrophies||[])];
 if(!win){status[type]='탈락';return {fixtures,status,trophies,careerTrophies};}
 const final=f.round==='결승';
 if(final){status[type]='우승';trophies++;careerTrophies.push({name:type,season:gm.season,club:gm.club,emoji:'🏆'});return {fixtures,status,trophies,careerTrophies};}
 let nextRound=null,day=f.day+28;
 if(['수페르코파 데 에스파냐','수페르코파 이탈리아나'].includes(type)&&f.round==='준결승'){nextRound='결승';day=f.day+7;}
 else if(['DFL-슈퍼컵','트로페 데 샹피옹','요한 크라위프 스할','수페르타사 칸디두 드 올리베이라','벨기에 슈퍼컵','튀르키예 슈퍼컵'].includes(type))nextRound='결승';
 else {const rounds=foreignCupRounds[type]||[];const index=rounds.indexOf(f.round);nextRound=rounds[index+1]||'결승';const dateMap={'코파 델 레이':{'1라운드':165,'2라운드':195,'32강':225,'16강':255,'8강':285,'준결승':320},'DFB-포칼':{'1라운드':120,'2라운드':165,'16강':225,'8강':285,'준결승':320},'코파 이탈리아':{'1라운드':150,'2라운드':190,'16강':230,'8강':270,'준결승':310},'쿠프 드 프랑스':{'1라운드':145,'2라운드':180,'32강':215,'16강':250,'8강':285,'준결승':320},'KNVB 베커르':{'1라운드':145,'2라운드':180,'16강':215,'8강':250,'준결승':285},'타사 드 포르투갈':{'1라운드':135,'2라운드':170,'16강':210,'8강':250,'준결승':290},'스코티시 컵':{'1라운드':175,'2라운드':210,'16강':245,'8강':280,'준결승':315},'스코티시 리그 컵':{'그룹 스테이지':85,'준준결승':120,'준결승':155},'벨기에 컵':{'1라운드':145,'2라운드':180,'16강':215,'8강':250,'준결승':285},'튀르키예 쿠파스':{'1라운드':145,'2라운드':180,'16강':215,'8강':250,'준결승':285}};day=dateMap[type]?.[f.round]||f.day+28;}
 const superCupTypes=['수페르코파 데 에스파냐','DFL-슈퍼컵','수페르코파 이탈리아나','트로페 데 샹피옹','요한 크라위프 스할','수페르타사 칸디두 드 올리베이라','벨기에 슈퍼컵','튀르키예 슈퍼컵'];const source=superCupTypes.includes(type)?(f.participants||gm.leagueClubs||[]):(gm.leagueClubs||[]);const pool=source.filter(x=>x!==gm.club&&x!==f.opponent);const opponent=shuffled(pool)[0]||shuffled(source.filter(x=>x!==gm.club))[0]||'상대 팀';
 fixtures.push({id:`${type}-${gm.season}-${String(nextRound).replaceAll(' ','')}-${f.day}`,type,round:nextRound,day,opponent,participants:f.participants,home:Math.random()>.5,played:false,active:true});
 status[type]='진행 중';return {fixtures,status,trophies,careerTrophies};
}
function applyLiveResult(gm,m){
 const f=m.fixture,gf=m.gf,ga=m.ga,isCup=isDomesticCup(f.type),shootoutWinner=m.shootout?.winner;let win=gf>ga,draw=gf===ga;if(isCup){if(f.tieId&&f.leg===1){win=true;draw=false;}else if(f.tieId&&f.leg===2){const first=gm.fixtures.find(x=>x.tieId===f.tieId&&x.leg===1);const [a,b]=(first?.score||'0-0').split('-').map(Number);const aggregate=(a+gf)-(b+ga);win=aggregate!==0?aggregate>0:shootoutWinner===gm.club;draw=false;}else{win=shootoutWinner?shootoutWinner===gm.club:gf>ga;draw=false;}}
 let fixtures=gm.fixtures.map(x=>x.id===f.id?{...x,played:true,score:`${gf}-${ga}`} :x);
 let fa=gm.fa,carabao=gm.carabao,trophies=gm.trophies;
 if(f.type==='FA컵'||f.type==='카라바오컵'){const isFA=f.type==='FA컵';const stateKey=isFA?'fa':'carabao';const eliminatedKey=isFA?'faEliminated':'carabaoEliminated';const eliminated=[...(gm[eliminatedKey]||[])];if(!win){if(!eliminated.includes(gm.club))eliminated.push(gm.club);if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);if(isFA)fa='탈락';else carabao='탈락';}else if(f.tieId&&f.leg===1){fixtures.push({...f,id:`${f.tieId}-L2`,leg:2,day:f.day+14,home:!f.home,played:false,score:null});}else if(f.tieId&&f.leg===2){const first=gm.fixtures.find(x=>x.tieId===f.tieId&&x.leg===1);const [a,b]=(first?.score||'0-0').split('-').map(Number);const aggregate=(a+gf)-(b+ga);if(aggregate<=0){if(!eliminated.includes(gm.club))eliminated.push(gm.club);if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);if(isFA)fa='탈락';else carabao='탈락';}else{if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);const finalRound=isFA?6:5;if(f.round===finalRound){if(isFA)fa='우승';else carabao='우승';trophies++;}else{const pool=allClubs.filter(x=>x.name!==gm.club&&!eliminated.includes(x.name)&&x.name!==f.opponent&&x.tier<=(isFA?7:4));const opponent=shuffled(pool)[0]?.name;if(opponent)fixtures.push({id:`${isFA?'FA':'CC'}-${gm.season}-${f.round+1}`,type:f.type,round:f.round+1,day:f.day+28,home:Math.random()>.5,opponent,played:false,active:true});}}}else{if(!eliminated.includes(f.opponent))eliminated.push(f.opponent);const finalRound=isFA?6:5;if(f.round===finalRound){if(isFA)fa='우승';else carabao='우승';trophies++;}else{const pool=allClubs.filter(x=>x.name!==gm.club&&!eliminated.includes(x.name)&&x.name!==f.opponent&&x.tier<=(isFA?7:4));const opponent=shuffled(pool)[0]?.name;if(opponent){const twoLeg=!isFA&&f.round===3;const tieId=twoLeg?`CC-${gm.season}-SF-${f.round+1}`:null;fixtures.push({id:tieId?`${tieId}-L1`:`${isFA?'FA':'CC'}-${gm.season}-${f.round+1}`,tieId,leg:twoLeg?1:undefined,type:f.type,round:f.round+1,day:f.day+28,home:twoLeg?true:Math.random()>.5,opponent,played:false,active:true});if(twoLeg)fixtures.push({id:`${tieId}-L2`,tieId,leg:2,type:f.type,round:f.round+1,day:f.day+42,home:false,opponent,played:false,active:true});}}}gm={...gm,[eliminatedKey]:eliminated};}
 if(['챔피언스리그','유로파리그','컨퍼런스리그'].includes(f.type)&&f.round!=='리그 페이즈'&&f.tieId&&f.leg===2){const first=gm.fixtures.find(x=>x.tieId===f.tieId&&x.leg===1);const [a,b]=(first?.score||'0-0').split('-').map(Number);const aggregate=(a+gf)-(b+ga);win=aggregate!==0?aggregate>0:shootoutWinner===gm.club;draw=false;}if(['챔피언스리그','유로파리그','컨퍼런스리그'].includes(f.type)&&f.round==='결승'){win=shootoutWinner?shootoutWinner===gm.club:gf>ga;draw=false;}
 if([...Object.keys(foreignCupRounds),'수페르코파 데 에스파냐','DFL-슈퍼컵','수페르코파 이탈리아나','트로페 데 샹피옹','요한 크라위프 스할','수페르타사 칸디두 드 올리베이라','벨기에 슈퍼컵','튀르키예 슈퍼컵'].includes(f.type)){const advanced=advanceForeignCup(gm,fixtures,f,win);fixtures=advanced.fixtures;gm={...gm,domesticCups:advanced.status,careerTrophies:advanced.careerTrophies};trophies=advanced.trophies;}
 if(['챔피언스리그','유로파리그','컨퍼런스리그'].includes(f.type)&&win&&f.round=== '결승'){trophies++;gm={...gm,careerTrophies:[...(gm.careerTrophies||[]),{name:f.type,season:gm.season,club:gm.club,emoji:'🏆'}]};}
 const table=f.type==='리그'?updateRoundTable(gm.table,gm.club,f.opponent,gf,ga,gm.tier||1):gm.table;let europeanCompetition=gm.europeanCompetition;if(['챔피언스리그','유로파리그','컨퍼런스리그'].includes(f.type)&&f.round==='리그 페이즈'&&europeanCompetition){const eu=recordEuropeanLeagueFixture({...gm,europeanCompetition,fixtures},f,gf,ga);europeanCompetition=eu.europeanCompetition;fixtures=eu.fixtures||fixtures;}if(['챔피언스리그','유로파리그','컨퍼런스리그'].includes(f.type)&&f.round!=='리그 페이즈'&&europeanCompetition){const eu=recordEuropeanKnockoutFixture({...gm,europeanCompetition,fixtures},f,gf,ga,m.shootout?.winner);europeanCompetition=eu.europeanCompetition;fixtures=eu.fixtures||fixtures;}
 const crisisSkill=Number(gm.stats?.위기관리||40);const defeatPenalty=Math.max(-6,-6+Math.max(0,crisisSkill-40)*.09);const security=clamp(gm.security+(win?3:draw?0:defeatPenalty)+(f.type==='리그'?0:win?2:-2));
 const tempo=m.opts?.tempo||'보통 템포';const press=m.opts?.press||'중간 압박';const line=m.opts?.line||'중간 수비라인';const width=m.opts?.width||'보통';const moraleFactor=(gm.morale-50)/100;
 // 통계는 선수단의 세 라인 전력 차이와 포메이션·압박·수비 라인·템포·폭에 연동된다.
 const tempoPoss=tempo==='느린 템포'?7:tempo==='빠른 템포'?-5:0;const pressPoss=press==='높은 압박'?-1.5:press==='낮은 압박'?1:0;
 const possession=clamp(Math.round(50+tempoPoss+pressPoss+(m.midfieldEdge||0)*17+(m.strength-m.opponentStrength)*.12+moraleFactor*5+(f.home?1.5:-1.5)+(Math.random()*6-3)),25,75);
 const tempoShot=tempo==='빠른 템포'?2.8:tempo==='느린 템포'?-1.1:0;const widthShot=width==='넓게'?1.4:width==='좁게'?.25:0;
 const shots=Math.max(gf,Math.round(10+(m.attackEdge||0)*2.7+(m.midfieldEdge||0)*1.25+tempoShot+widthShot+(Math.random()*5-2)));
 const lineShotRisk=line==='높은 수비라인'?1.5:line==='낮은 수비라인'?-1:0;const oppShots=Math.max(ga,Math.round(9.5-(m.defenceEdge||0)*2.4+lineShotRisk+(Math.random()*5-2)));
 const xg=Number(Math.max(.12,shots*(.082+(m.attackEdge||0)*.009)+(tempo==='빠른 템포'?.16:tempo==='느린 템포'?-.08:0)+(Math.random()*.32)).toFixed(2));const oppXg=Number(Math.max(.12,oppShots*(.081-(m.defenceEdge||0)*.008)+(line==='높은 수비라인'?.16:line==='낮은 수비라인'?-.08:0)+(Math.random()*.32)).toFixed(2));
 const passes=Math.round(300+possession*3.25+(tempo==='느린 템포'?65:tempo==='빠른 템포'?-35:0)+(m.midfieldEdge||0)*45+Math.random()*35);const oppPasses=Math.round(300+(100-possession)*3.25+(tempo==='느린 템포'?45:tempo==='빠른 템포'?-20:0)+Math.random()*35);
 const passAccuracy=clamp(Math.round(73+possession*.18+(m.midfieldEdge||0)*8+(tempo==='느린 템포'?5:tempo==='빠른 템포'?-4:0)+(press==='높은 압박'?-1:0)+moraleFactor*5+Math.random()*4),60,97);const oppPassAccuracy=clamp(Math.round(77+(100-possession)*.12+(Math.random()*5-2)),60,95);
 const corners=Math.max(0,Math.round(shots*(width==='넓게'?.43:.32)+(press==='높은 압박'?1:0)+Math.random()*2));const oppCorners=Math.max(0,Math.round(oppShots*.32+(line==='높은 수비라인'?1:0)+Math.random()*2));
 const shotsOnTarget=Math.min(shots,Math.max(gf,Math.round(gf+(shots-gf)*clamp(.29+(m.attackEdge||0)*.035-(tempo==='빠른 템포'?.035:0),.18,.52))));const opponentShotsOnTarget=Math.min(oppShots,Math.max(ga,Math.round(ga+(oppShots-ga)*clamp(.29-(m.defenceEdge||0)*.035,.18,.52))));
 const stats={possession,opponentPossession:100-possession,shots,opponentShots:oppShots,shotsOnTarget,opponentShotsOnTarget,xg,opponentXg:oppXg,passes,opponentPasses:oppPasses,passAccuracy,opponentPassAccuracy:oppPassAccuracy,corners,opponentCorners:oppCorners};const resultType=win?'승리':draw?'무승부':'패배';const questionPool=win?[['오늘 승리를 만든 결정적인 요인은 무엇입니까?',['선수들의 투지를 칭찬한다','전술적 판단의 책임을 인정한다','우리가 준비한 축구를 끝까지 밀고 가겠다']],['상대의 수비를 어떻게 공략했습니까?',['경기 운영의 균형을 찾겠다','선수들은 계획을 충실히 수행했다','오늘 결과보다 과정에서 배울 점이 많다']],['좋은 흐름을 다음 경기까지 이어갈 방법은 무엇입니까?',['선수단과 함께 해답을 찾겠다','다음 경기에는 더 과감하게 나서겠다','팬들에게 감사를 전한다']],['오늘 가장 만족스러웠던 부분은 무엇입니까?',['공격 전개가 계획대로 이뤄졌다','선수단의 집중력을 높이 평가한다','상대의 경기력을 인정한다']]]:draw?[['승점 1점이라는 결과를 어떻게 받아들이십니까?',['승점 1점에 안주하지 않겠다','찬스 창출은 좋았지만 마무리가 부족했다','상대의 경기력을 인정한다']],['승리로 연결하지 못한 이유는 무엇입니까?',['기회 창출은 좋았지만 마무리가 부족했다','경기 운영의 균형을 찾겠다','선수단을 감싼다']],['경기 막판 운영에 아쉬움은 없습니까?',['선수 교체 판단은 내 책임이다','선수들은 계획을 충실히 수행했다','다음 경기에는 더 과감하게 나서겠다']],['다음 경기에서 가장 먼저 보완할 부분은 무엇입니까?',['수비 간격부터 다시 점검하겠다','찬스를 살리지 못한 점이 아쉽다','선수단과 함께 해답을 찾겠다']]]:[['오늘 패배의 가장 큰 원인은 무엇이라고 생각합니까?',['상대 압박에 대응하지 못했다','선수 교체 판단은 내 책임이다','선수단을 감싼다']],['경기 내용에서 어떤 점이 가장 아쉬웠습니까?',['기회 창출은 좋았지만 마무리가 부족했다','수비 간격부터 다시 점검하겠다','상대의 경기력을 인정한다']],['팬들에게 어떤 메시지를 전하고 싶습니까?',['팬들의 실망을 이해한다','다음 경기에는 더 과감하게 나서겠다','선수단과 함께 해답을 찾겠다']],['선수단에 어떤 주문을 하겠습니까?',['선수단의 집중력을 요구한다','선수들은 계획을 충실히 수행했다','오늘 결과보다 과정에서 배울 점이 많다']]];const selectedQuestion=questionPool[Math.floor(Math.random()*questionPool.length)];const followUps=win?[['선수단의 분위기를 어떻게 이어가겠습니까?',['선수단과 함께 해답을 찾겠다','선수들의 투지를 칭찬한다','팬들에게 감사를 전한다']],['다음 경기에서도 같은 전술을 유지할 생각입니까?',['상황에 맞게 유연하게 대응하겠다','우리가 준비한 축구를 끝까지 밀고 가겠다','경기 운영의 균형을 찾겠다']],['오늘 활약한 선수들에게 어떤 말을 전하겠습니까?',['선수들은 계획을 충실히 수행했다','선수들의 투지를 칭찬한다','팀 전체의 공헌을 기억하겠다']]]:draw?[['경기 막판 운영에서 무엇을 배웠습니까?',['선수 교체 판단은 내 책임이다','경기 운영의 균형을 찾겠다','다음 경기에는 더 과감하게 나서겠다']],['다음 경기에서 어떤 변화를 보여주겠습니까?',['수비 간격부터 다시 점검하겠다','찬스를 살리지 못한 점이 아쉽다','선수단을 믿고 준비하겠다']],['선수단에 어떤 메시지를 전하겠습니까?',['선수단과 함께 해답을 찾겠다','선수단의 집중력을 요구한다','팬들에게 감사를 전한다']]]:[['다음 경기에서 어떤 변화를 보여줄 생각입니까?',['상대 압박에 대응하지 못했다','수비 간격부터 다시 점검하겠다','다음 경기에는 더 과감하게 나서겠다']],['선수단의 사기를 어떻게 회복하겠습니까?',['선수단을 감싼다','선수들의 투지를 칭찬한다','선수단과 함께 해답을 찾겠다']],['이번 패배를 어떻게 수습하겠습니까?',['오늘 결과보다 과정에서 배울 점이 많다','경기 운영의 균형을 찾겠다','팬들의 실망을 이해한다']]];const second=followUps[Math.floor(Math.random()*followUps.length)];const questions=[{question:selectedQuestion[0],options:selectedQuestion[1]},{question:second[0],options:second[1]}];const reporterPool=[{name:'올리버 그랜트',outlet:'THE FOOTBALL POST',photo:'/players/reporter-1.png'},{name:'에밀리 카터',outlet:'SPORTS DAILY',photo:'/players/reporter-2.png'},{name:'마이클 리드',outlet:'MATCHDAY NEWS',photo:'/players/reporter-3.png'}];const reporter=reporterPool[Math.floor(Math.random()*reporterPool.length)];const interview={opponent:f.opponent,competition:f.type,result:resultType,questions,questionIndex:0,question:questions[0].question,options:questions[0].options,reporter};
 const trackedSquad=f.type==='리그'?recordPlayerMatchStats(gm.squad||[],gf,{win,draw,ga,selectedXI:m.selectedXI}):gm.squad;
 const matchDate=seasonDate(gm,f.day);const previousDate=seasonDate(gm,gm.lastDay||0);let monthlyAwards=[...(gm.monthlyAwards||[])];let monthlyStats={...(gm.monthlyStats||{month:matchDate.month,w:0,d:0,l:0,goals:0,conceded:0,matches:0})};if(matchDate.month!==monthlyStats.month&&monthlyStats.matches>0){const score=monthlyStats.w*3+monthlyStats.d;const winner=score>=7?gm.club:(leagueForTier(gm.tier)?.clubs.filter(c=>c!==gm.club)||[])[0]||gm.club;monthlyAwards.push({month:monthlyStats.month,winner,record:`${monthlyStats.w}승 ${monthlyStats.d}무 ${monthlyStats.l}패`,goals:monthlyStats.goals,conceded:monthlyStats.conceded});monthlyStats={month:matchDate.month,w:0,d:0,l:0,goals:0,conceded:0,matches:0};}if(f.type==='리그'){monthlyStats.matches++;monthlyStats.w+=win?1:0;monthlyStats.d+=draw?1:0;monthlyStats.l+=(!win&&!draw)?1:0;monthlyStats.goals+=gf;monthlyStats.conceded+=ga;}const wageAnchorDay=gm.wageAnchorDay==null?f.day:gm.wageAnchorDay;const wagePaidWeeks=gm.wagePaidWeeks||0;const dueWageWeeks=Math.max(0,Math.floor((f.day-wageAnchorDay)/7)-wagePaidWeeks);const weeklyWage=Math.round((gm.salary||0)/52);const wagePayment=dueWageWeeks*weeklyWage;const wagePaidThrough=wagePaidWeeks+dueWageWeeks;const ch=(gm.clubHistory||[]).map((c,i)=>i===gm.clubHistory.length-1?{...c,w:c.w+(win?1:0),d:c.d+(draw?1:0),l:c.l+(!win&&!draw?1:0)}:c);const next={...gm,monthlyAwards,monthlyStats,squad:trackedSquad,europeanCompetition,trophies,careerW:(gm.careerW||0)+(win?1:0),careerD:(gm.careerD||0)+(draw?1:0),careerL:(gm.careerL||0)+(!win&&!draw?1:0),clubHistory:ch,fixtures:fixtures.sort((a,b)=>a.day-b.day),table,played:gm.played+(f.type==='리그'?1:0),w:gm.w+(f.type==='리그'&&win?1:0),d:gm.d+(f.type==='리그'&&draw?1:0),l:gm.l+(f.type==='리그'&&!win&&!draw?1:0),gf:gm.gf+(f.type==='리그'?gf:0),ga:gm.ga+(f.type==='리그'?ga:0),pts:gm.pts+(f.type==='리그'?(win?3:draw?1:0):0),fitness:clamp(gm.fitness+(m.recovery||0)+(m.rotation==='주전 기용'?-4:m.rotation==='부분 로테이션'?1:4)-Math.round(m.fitnessLoss*.45),30,100),morale:clamp(gm.morale+resultMoraleChange(gm.squad||[],win,draw)),security,streak:win?0:gm.streak+1,fa,carabao,trophies,lastDay:f.day,wageAnchorDay,wagePaidWeeks:wagePaidThrough,lastWagePayment:wagePayment>0?{amount:wagePayment,weeks:dueWageWeeks,day:f.day,date:seasonDate(gm,f.day).label}:gm.lastWagePayment,totalWagesReceived:(gm.totalWagesReceived||0)+wagePayment,cash:(gm.cash||0)+wagePayment,lastResult:{fixture:f,gf,ga,win,draw,shootout:m.shootout||null,rotation:m.rotation,venue:f.home?'홈 경기':'원정 경기',events:m.events,tacticalSummary:{attack:Math.round(m.attack||0),midfield:Math.round(m.midfield||0),defence:Math.round(m.defence||0),formation:m.opts?.formation||'4-3-3',tempo:m.opts?.tempo||'보통 템포'},fanReactions:gm.foreignFanProfile?makeForeignFanReactions(gm.club,win,draw):makeFanReactions(win,draw,gm.club)},history:[...gm.history.slice(-19),{type:f.type,opponent:f.opponent,score:`${gf}-${ga}${m.shootout?` (승부차기 ${m.shootout.home}-${m.shootout.away})`:''}`,result:win?'승리':draw?'무승부':'패배'}],news:[...(matchDate.month!==previousDate.month?[`월말 결산: ${monthlyAwards[monthlyAwards.length-1]?.month||previousDate.month}월 이달의 감독은 ${monthlyAwards[monthlyAwards.length-1]?.winner||gm.club}입니다.`]:[]),...(matchDate.month===1&&previousDate.month===12?['겨울 이적시장이 열렸습니다. 1월 31일까지 선수를 영입할 수 있습니다.']:[]),...(f.day-(gm.lastDay||0)>=14&&[9,10,11,3].includes(matchDate.month)?['A매치 휴식기가 끝났습니다. 대표팀 일정으로 인한 리그 휴식 기간을 마치고 경기가 재개됩니다.']:[]),`${gm.club} ${gf}-${ga} ${f.opponent}`,`${win?'승리':draw?'무승부':'패배'} · ${f.type} ${f.round}라운드`],interview,matchStats:stats};
 next.lastResult={...next.lastResult,stats,interview};
 next.matchStats=stats;next.interview=interview;
 return {gm:next,result:next.lastResult};
}
export function simulatePenaltyShootout(home,away,options={}){
 const accuracyFor=(team)=>{const age=Number(options[team+'Age']??26);const morale=Number(options[team+'Morale']??50);const talk=options[team+'Talk']||'편안하게';const ageEffect=clamp((26-age)*.004,-.045,.045);const moraleEffect=clamp((morale-50)*.0018,-.07,.07);const talkEffect=talk==='위협적으로'?-.025:.018;return clamp(.76+ageEffect+moraleEffect+talkEffect,.58,.91);};
 const homeAccuracy=accuracyFor('home'),awayAccuracy=accuracyFor('away');
 let h=0,a=0,hTaken=0,aTaken=0;const kicks=[];
 // Five kicks each, then sudden death. Keep going until one side leads after an equal number.
 for(let i=0;i<30;i++){const side=i%2===0?'home':'away';const scored=Math.random()<(side==='home'?homeAccuracy:awayAccuracy);if(side==='home'){hTaken++;if(scored)h++;}else{aTaken++;if(scored)a++;}kicks.push({side,scored,number:side==='home'?hTaken:aTaken,score:`${h}-${a}`});
  if(hTaken>=5&&aTaken>=5&&h!==a&&hTaken===aTaken)break;
  if(i>=9&&hTaken===aTaken&&h!==a)break;
 }
 // A pathological long deadlock is resolved with alternating sudden-death kicks.
 while(h===a){if(Math.random()<homeAccuracy)h++;if(Math.random()<awayAccuracy)a++;}
 return {home:h,away:a,winner:h>a?home:away,kicks,homeAccuracy,awayAccuracy};
}

export function advanceLiveMatch(gm,m,choice){
 if(!m||m.finished)return {error:'진행 중인 경기가 없습니다.'};
 if(m.prompt){if(!choice)return {match:m};if(m.prompt.type==='승부차기'){const tone=choice.includes('위협')?'위협적으로':'편안하게';const age=averageSquadAge(gm.squad||[]);const shootout=simulatePenaltyShootout(gm.club,m.fixture.opponent,{homeAge:m.fixture.home?age:26,awayAge:m.fixture.home?26:age,homeMorale:m.fixture.home?(gm.morale||50):50,awayMorale:m.fixture.home?50:(gm.morale||50),homeTalk:m.fixture.home?tone:'편안하게',awayTalk:m.fixture.home?'편안하게':tone});const done={...m,finished:true,prompt:null,pendingShootout:false,managerTalk:tone,shootout,events:[...m.events,`감독의 승부차기 메시지 · ${tone}`,`승부차기 종료 · ${shootout.home}-${shootout.away} · ${shootout.winner} 승리`]};const result=applyLiveResult(gm,done);return {match:done,...result};}let momentum=m.momentum,events=[...m.events];
  if(choice.includes('공격')||choice.includes('압박')){momentum+=5;events.push(`감독 지시: ${choice} · 공격 강도를 높입니다.`);}else if(choice.includes('수비')||choice.includes('리드 관리')){momentum-=2;events.push(`감독 지시: ${choice} · 수비 안정에 집중합니다.`);}else if(choice.includes('선수단 독려')){momentum+=2+Math.floor(Math.max(0,(gm.stats?.동기부여||40)-40)/15);events.push('감독 지시: 선수단을 독려했습니다.');}else{momentum+=1;events.push(`감독 지시: ${choice}`);}
  m={...m,momentum,events,prompt:null};return {match:m};
 }
 const nextMinute=[15,30,45,60,70,80,90].find(x=>x>m.minute)||90;
 let gf=m.gf,ga=m.ga,events=[...m.events],injury=m.injury,redCard=m.redCard,fitnessLoss=m.fitnessLoss,strength=m.strength;
 const tempo=m.opts?.tempo||'보통 템포';const diff=(strength-m.opponentStrength+m.momentum)/35;
 const tempoBias=tempo==='빠른 템포' ? 0.032 : tempo==='느린 템포' ? -0.014 : 0;const pressBoost=m.opts?.press==='높은 압박' ? 0.014 : 0;const lineRisk=m.opts?.line==='높은 수비라인' ? 0.02 : m.opts?.line==='낮은 수비라인' ? -0.009 : 0;
 // 15분 단위 7개 구간에서 평균 2.5~3골 정도가 나오도록 기본 찬스 빈도를 높이고, 전력 차이는 양 팀 확률에 계속 반영한다.
 const ownChance=clamp(.265+diff*.024+tempoBias+pressBoost+(m.attackEdge||0)*.016+(m.midfieldEdge||0)*.009,.10,.42),oppChance=clamp(.255-diff*.02+(tempo==='빠른 템포'?.014:0)+lineRisk-(m.defenceEdge||0)*.014,.09,.39);
 if(Math.random()<ownChance){gf++;events.push(`${nextMinute}분 · ${gm.club} 득점!`);}
 if(Math.random()<oppChance){ga++;events.push(`${nextMinute}분 · ${m.fixture.opponent} 득점.`);}
 const managementSkill=Number(gm.stats?.선수관리||40);const injuryChance=Math.max(.018,.045-Math.max(0,managementSkill-40)*.00035);if(!injury&&Math.random()<injuryChance){injury=true;fitnessLoss+=10;events.push(`${nextMinute}분 · 주전 선수 부상 발생. 선수 보호가 필요합니다.`);}
 if(!redCard&&Math.random()<.018){redCard=true;strength-=9;events.push(`${nextMinute}분 · 퇴장 발생! 수적 열세에 놓였습니다.`);}
 let prompt=null;
 if(ga>m.ga)prompt={type:'실점',options:['빠른 교체 및 압박 강화','공격 전술로 변경','전술 유지']};
 else if(injury&&!m.injury)prompt={type:'부상',options:['부상 선수 즉시 교체','선수 보호 및 수비 안정','계속 출전']};
 else if(redCard&&!m.redCard)prompt={type:'퇴장',options:['수비 재정비','역습 유지','압박 유지']};
 else if(nextMinute===45)prompt={type:'하프타임',options:['선수단 독려','공격 전술 강화','수비 안정','전술 유지']};
 else if(nextMinute===70||nextMinute===80){if(gf<ga)prompt={type:'추격',options:['공격 교체 및 압박 강화','공격 전술로 변경','전술 유지']};else if(gf>ga)prompt={type:'리드 관리',options:['수비 교체 및 리드 관리','중원 점유 강화','전술 유지']};else prompt={type:'균형',options:['공격 교체','수비 안정','전술 유지']};}
 const next={...m,minute:nextMinute,gf,ga,events,injury,redCard,fitnessLoss,strength,prompt};
 if(nextMinute>=90){let done={...next,finished:true,prompt:null};const euroKnockout=['챔피언스리그','유로파리그','컨퍼런스리그'].includes(m.fixture.type)&&['플레이오프','16강','8강','4강','준결승','결승'].some(x=>String(m.fixture.round).includes(x));if((isDomesticCup(m.fixture.type)||euroKnockout)&&done.gf===done.ga){let needsShootout=!m.fixture.tieId;if(m.fixture.tieId&&m.fixture.leg===2){const first=gm.fixtures.find(x=>x.tieId===m.fixture.tieId&&x.leg===1);const [a,b]=(first?.score||'0-0').split('-').map(Number);needsShootout=(a+done.gf)===(b+done.ga);}if(needsShootout){done={...done,finished:false,prompt:{type:'승부차기',options:['편안하게 말하기','위협적으로 말하기']},pendingShootout:true};return {match:done};}}const result=applyLiveResult(gm,done);return {match:done,...result};}
 return {match:next};
}

export { createEuropeanWorld, simulateEuropeanWorld };

export function europeanStandings(gm){return [...(gm.europeanCompetition?.table||[])].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);}

// UEFA-style ranking-based Champions League knockout bracket.
function euroRanked(comp){return [...(comp?.table||[])].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.name.localeCompare(b.name));}
const EURO_ROUND_DATES={
 '플레이오프':{first:[[2,16],[2,17]],second:[[2,23],[2,24]],ready:[2,24]},
 '16강':{first:[[3,9],[3,10]],second:[[3,16],[3,17]],ready:[3,17]},
 '8강':{first:[[4,6],[4,7]],second:[[4,13],[4,14]],ready:[4,14]},
 '4강':{first:[[4,27],[4,28]],second:[[5,4],[5,5]],ready:[5,5]},
 '결승':{final:[6,5],ready:[6,5]}
};
function euroDateLabel(year,md){return `${year}년 ${md[0]}월 ${md[1]}일`;}
function attachEuroDates(pair,round,index,year){
 const dates=EURO_ROUND_DATES[round];if(!dates)return pair;
 if(round==='결승')return {...pair,finalDate:euroDateLabel(year,dates.final)};
 const first=dates.first[index%dates.first.length],second=dates.second[index%dates.second.length];
 return {...pair,firstLegDate:euroDateLabel(year,first),secondLegDate:euroDateLabel(year,second)};
}
function euroLabelToDay(label,seasonStartYear){const m=String(label||'').match(/(\d+)년\s*(\d+)월\s*(\d+)일/);return m?euroDayOffset(seasonStartYear,Number(m[2]),Number(m[3])):0;}
function scheduleUserEuroFixtures(gm,comp){
 const year=Number(gm.seasonStartYear)||2026;let additions=[];
 if(comp.stage==='결승'&&comp.final&&!comp.final.winner&&(comp.final.home===gm.club||comp.final.away===gm.club)){
  const opponent=comp.final.home===gm.club?comp.final.away:comp.final.home;
  additions.push({id:`EU-${gm.season}-${comp.stage}-FINAL`,type:comp.competition,round:'결승',day:euroLabelToDay(comp.final.date||comp.finalDate,year),home:comp.final.home===gm.club,opponent,played:false,active:true});
 }else{
  const pairs=comp.stage==='플레이오프'?(comp.playoffPairs||[]):(comp.knockoutPairs||[]);
  const idx=pairs.findIndex(p=>p.home===gm.club||p.away===gm.club);
  if(idx>=0){const pair=pairs[idx],opponent=pair.home===gm.club?pair.away:pair.home;
   const firstDay=euroLabelToDay(pair.firstLegDate,year),secondDay=euroLabelToDay(pair.secondLegDate,year);
   additions.push({id:`EU-${gm.season}-${pair.id}-L1`,tieId:pair.id,leg:1,type:comp.competition,round:comp.stage,day:firstDay,home:pair.home===gm.club,opponent,played:false,active:true});
   additions.push({id:`EU-${gm.season}-${pair.id}-L2`,tieId:pair.id,leg:2,type:comp.competition,round:comp.stage,day:secondDay,home:pair.away===gm.club,opponent,played:false,active:true});
  }
 }
 const keep=(gm.fixtures||[]).filter(f=>!additions.some(a=>a.id===f.id));
 return {...gm,fixtures:[...keep,...additions].sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id))};
}
export function migrateEuropeanCalendar(gm){
 const comp=gm?.europeanCompetition;if(!gm||!comp)return gm;const year=Number(gm.seasonStartYear)||2026;
 const corrected=(comp.fixtures||[]).map((f,i)=>{const md=Math.max(1,Math.min(8,Number(f.matchday)||i+1));return {...f,matchday:md,day:euroDayOffset(year,...EURO_LEAGUE_MATCHDAYS[md-1])};});
 let next={...gm,europeanCompetition:{...comp,fixtures:corrected},fixtures:(gm.fixtures||[]).map(f=>{const e=corrected.find(x=>x.id===f.id);return e?{...f,day:e.day,matchday:e.matchday}:f;})};
 if(comp.stage==='플레이오프')next.europeanCompetition={...next.europeanCompetition,playoffPairs:(comp.playoffPairs||[]).map((pair,i)=>attachEuroDates(pair,'플레이오프',i,year+1))};
 if(['16강','8강','4강'].includes(comp.stage))next.europeanCompetition={...next.europeanCompetition,knockoutPairs:(comp.knockoutPairs||[]).map((pair,i)=>attachEuroDates(pair,comp.stage,i,year+1))};
 if(comp.stage==='결승'&&comp.final)next.europeanCompetition={...next.europeanCompetition,final:{...comp.final,date:euroDateLabel(year+1,EURO_ROUND_DATES['결승'].final)}};
 if(comp.stage==='리그 페이즈'&&corrected.length===8&&corrected.every(f=>f.played))next=europeanKnockoutStart(next);
 if(next.europeanCompetition?.stage!=='리그 페이즈'&&next.europeanCompetition?.stage!=='대회 종료')next=scheduleUserEuroFixtures(next,next.europeanCompetition);
 return next;
}
export function europeanRoundReady(gm){
 const comp=gm?.europeanCompetition;if(!comp||!EURO_ROUND_DATES[comp.stage])return false;
 const [month,day]=EURO_ROUND_DATES[comp.stage].ready;
 const now=seasonDate(gm);
 return now.year>=(Number(gm.seasonStartYear)||2026)+1&&(now.month>month||(now.month===month&&now.day>=day));
}
function euroPair(a,b,round){return {id:`${round}-${a.name}-${b.name}`,home:a.name,away:b.name,homeRank:a.rank,awayRank:b.rank,round,leg1:null,leg2:null,winner:null};}
export function europeanKnockoutStart(gm){
 const comp=gm.europeanCompetition;if(!comp)return {error:'유럽대항전 데이터가 없습니다.'};
 if(comp.stage!=='리그 페이즈')return {error:'이미 토너먼트가 시작됐습니다.'};
 if((comp.fixtures||[]).some(f=>!f.played))return {error:'리그 페이즈 8경기를 모두 마쳐야 합니다.'};
 const ranked=euroRanked(comp).map((x,i)=>({...x,rank:i+1}));
 const pairs=[];for(let i=0;i<8;i++){const low=ranked[23-i],high=ranked[8+i];pairs.push(attachEuroDates(euroPair({...high,rank:high.rank},{...low,rank:low.rank},'플레이오프'),'플레이오프',i,(Number(gm.seasonStartYear)||2026)+1));}
 const next={...gm,europeanCompetition:{...comp,stage:'플레이오프',ranked,playoffPairs:pairs,roundHistory:[],knockoutPairs:[],notice:'9~16위 시드와 17~24위 팀이 순위에 따라 플레이오프에서 맞붙습니다.'}};if(!pairs.some(p=>p.home===gm.club||p.away===gm.club)){const advanced=europeanKnockoutAdvance(next,'편안하게');return scheduleUserEuroFixtures(advanced,advanced.europeanCompetition);}return scheduleUserEuroFixtures(next,next.europeanCompetition);
}
function euroTie(pair,round,gm,tone='편안하게'){if(pair.winner)return pair;const home=clubRatings(pair.home,1),away=clubRatings(pair.away,1);const rankEdge=((pair.awayRank||18)-(pair.homeRank||18))*.035;const edge=(home.공격+home.중원+home.수비-away.공격-away.중원-away.수비)/180+rankEdge;const firstHome=Math.max(0,Math.round(1.25+edge+(Math.random()-.5)*2.4));const firstAway=Math.max(0,Math.round(1.05-edge+(Math.random()-.5)*2.4));const secondHome=Math.max(0,Math.round(1.15-edge+(Math.random()-.5)*2.4));const secondAway=Math.max(0,Math.round(1.15+edge+(Math.random()-.5)*2.4));let h=firstHome+secondAway,a=firstAway+secondHome,shootout=null;if(h===a){const userHome=pair.home===gm?.club;const userAway=pair.away===gm?.club;shootout=simulatePenaltyShootout(pair.home,pair.away,{homeAge:userHome?averageSquadAge(gm.squad||[]):26,awayAge:userAway?averageSquadAge(gm.squad||[]):26,homeMorale:userHome?(gm.morale||50):50,awayMorale:userAway?(gm.morale||50):50,homeTalk:userHome?tone:'편안하게',awayTalk:userAway?tone:'편안하게'});if(shootout.winner===pair.home)h++;else a++;}return {...pair,leg1:`${firstHome}-${firstAway}`,leg2:`${secondHome}-${secondAway}`,aggregate:`${h}-${a}`,shootout,winner:h>a?pair.home:pair.away};}
function recordEuropeanKnockoutFixture(gm,fixture,gf,ga,shootoutWinner){
 const comp=gm.europeanCompetition;if(!comp||!['챔피언스리그','유로파리그','컨퍼런스리그'].includes(fixture.type))return gm;
 if(fixture.round==='결승'){const winner=gf===ga?(shootoutWinner||null):(gf>ga?gm.club:fixture.opponent);if(!winner)return gm;const final={...comp.final,score:`${gf}-${ga}`,winner};return {...gm,europeanCompetition:{...comp,stage:'대회 종료',final,roundHistory:[...(comp.roundHistory||[]),{stage:'결승',final}],notice:`${winner} 우승!`}};}
 const key=comp.stage==='플레이오프'?'playoffPairs':'knockoutPairs';const pairs=[...(comp[key]||[])];const index=pairs.findIndex(p=>p.id===fixture.tieId);if(index<0)return gm;
 const pair={...pairs[index]},homeGoals=pair.home===gm.club?gf:ga,awayGoals=pair.home===gm.club?ga:gf;
 if(fixture.leg===1){pair.leg1=`${homeGoals}-${awayGoals}`;pairs[index]=pair;return {...gm,europeanCompetition:{...comp,[key]:pairs}};}
 pair.leg2=`${homeGoals}-${awayGoals}`;const [h1,a1]=(pair.leg1||'0-0').split('-').map(Number),[h2,a2]=pair.leg2.split('-').map(Number);let homeAgg=h1+h2,awayAgg=a1+a2;if(homeAgg===awayAgg&&shootoutWinner){if(shootoutWinner===pair.home)homeAgg++;else awayAgg++;}
 pair.aggregate=`${homeAgg}-${awayAgg}`;pair.winner=homeAgg>awayAgg?pair.home:pair.away;pairs[index]=pair;
 const updated={...gm,europeanCompetition:{...comp,[key]:pairs}};const resolvedPairs=pairs.map(p=>p.winner?p:euroTie(p,comp.stage,gm,'편안하게'));const completed={...updated,europeanCompetition:{...updated.europeanCompetition,[key]:resolvedPairs}};
 const advanced=europeanKnockoutAdvance(completed,'편안하게');return advanced?.europeanCompetition?scheduleUserEuroFixtures(advanced,advanced.europeanCompetition):advanced;
}
export function europeanKnockoutAdvance(gm,tone='편안하게'){const comp=gm.europeanCompetition;if(!comp)return gm;let history=[...(comp.roundHistory||[])];
 if(comp.stage==='플레이오프'){const played=(comp.playoffPairs||[]).map(p=>euroTie(p,'PO',gm,tone));history.push({stage:'플레이오프',pairs:played});const winners=played.map(p=>p.winner);const rankOf=n=>comp.ranked.find(x=>x.name===n)?.rank||36;const seeded=Array.from({length:8},(_,i)=>({name:comp.ranked[i].name,rank:i+1}));const winnerSeeds=winners.map(name=>({name,rank:rankOf(name)}));const pairs=[];const sortedWinners=winnerSeeds.sort((x,y)=>x.rank-y.rank);for(let i=0;i<8;i++)pairs.push(attachEuroDates(euroPair(seeded[i],sortedWinners[7-i],'16강'),'16강',i,(Number(gm.seasonStartYear)||2026)+1));return {...gm,europeanCompetition:{...comp,stage:'16강',roundHistory:history,knockoutPairs:pairs,notice:'1~8위 직행팀과 플레이오프 승자가 16강에서 만납니다.'}};}
 if(['16강','8강','4강'].includes(comp.stage)){const played=(comp.knockoutPairs||[]).map(p=>euroTie(p,comp.stage,gm,tone));history.push({stage:comp.stage,pairs:played});const winners=played.map(p=>({name:p.winner,rank:comp.ranked.find(x=>x.name===p.winner)?.rank||36}));if(comp.stage==='16강'||comp.stage==='8강'){const nextStage=comp.stage==='16강'?'8강':'4강';const pairs=[];for(let i=0;i<winners.length;i+=2)pairs.push(attachEuroDates(euroPair(winners[i],winners[i+1],nextStage),nextStage,pairs.length,(Number(gm.seasonStartYear)||2026)+1));return {...gm,europeanCompetition:{...comp,stage:nextStage,roundHistory:history,knockoutPairs:pairs,notice:`${nextStage} 대진이 확정됐습니다.`}};}return {...gm,europeanCompetition:{...comp,stage:'결승',roundHistory:history,final:{home:winners[0].name,away:winners[1].name,score:null,winner:null,date:euroDateLabel((Number(gm.seasonStartYear)||2026)+1,EURO_ROUND_DATES['결승'].final)},knockoutPairs:[],notice:'결승은 단판 승부입니다.'}};}
 if(comp.stage==='결승'&&comp.final&&!comp.final.winner){const a=clubRatings(comp.final.home,1),b=clubRatings(comp.final.away,1);const x=Math.max(0,Math.round(1.4+(a.공격+a.중원+a.수비-b.공격-b.중원-b.수비)/180+(Math.random()-.5)*2.6));const y=Math.max(0,Math.round(1.3+(b.공격+b.중원+b.수비-a.공격-a.중원-a.수비)/180+(Math.random()-.5)*2.6));const winner=x===y?(Math.random()>.5?comp.final.home:comp.final.away):(x>y?comp.final.home:comp.final.away);const final={...comp.final,score:`${x}-${y}`,winner};history.push({stage:'결승',final});return {...gm,europeanCompetition:{...comp,stage:'대회 종료',final,roundHistory:history,notice:`${winner} 우승!`},europe:gm.european};}
 return gm;
}
