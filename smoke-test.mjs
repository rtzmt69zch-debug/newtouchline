import fs from 'node:fs';
import assert from 'node:assert/strict';
import {leagueData,europeanLeagues,allEuropeanClubs,starPlayers,roundRobin,createSeason,freshTable,createForeignDomesticCupFixtures} from '../src/leagues.js';
import {createManager,acceptOffer,beginLiveMatch,advanceLiveMatch,closeSeason,resolvePlayoff,buyItem,shopItems,signPlayer,transferCandidates,generateYouthProspects,getTeamRatings,money,seasonDate,transferWindowStatus,ageAdjustedRatings,resultMoraleChange,positionAverageAges,managerNationalities,foreignClubProfile,resolveRenewalOffer,europeanKnockoutStart,europeanKnockoutAdvance,europeanRoundReady,recordEuropeanLeagueFixture,recordPlayerMatchStats,assignSquadRoles,migrateEuropeanCalendar} from '../src/engine.js';

assert.equal(leagueData[0].clubs.length,20,'Premier League has 20 clubs');
for(const l of leagueData.slice(1)) assert.equal(l.clubs.length,24,`${l.name} has 24 clubs`);
assert.equal(roundRobin(leagueData[0].clubs).length,38,'20-team double round robin has 38 rounds');
assert.equal(roundRobin(leagueData[1].clubs).length,46,'24-team double round robin has 46 rounds');
assert.ok(europeanLeagues.length>=8,'eight major overseas leagues are present');
assert.ok(allEuropeanClubs.length>=100,'European club database is populated');
assert.equal(starPlayers['맨체스터 시티'],'엘링 홀란','Manchester City star player is mapped');
assert.equal(starPlayers['맨체스터 유나이티드'],'브루노 페르난데스','Manchester United star player is mapped');

for(const route of ['legend','youth','license','unknown']){
  const initial=createManager(route,'게겐프레싱');
  assert.ok(initial.offers.length>=3&&initial.offers.length<=5,'3–5 manager offers');
  const gm=acceptOffer(initial,initial.offers[0].id);
  assert.ok(gm.club&&gm.salary>0&&gm.fixtures.length>=38,'offer acceptance initializes career');
  assert.equal(gm.table.length,gm.tier===1?20:24,'league table matches division size');
}

const manager=createManager('unknown','게겐프레싱');
let gm=acceptOffer(manager,manager.offers[0].id);
let matches=0;
while(matches<2){
 const started=beginLiveMatch(gm,{rotation:'부분 로테이션',press:'높은 압박',line:'높은 수비라인',tempo:'빠른 템포'});
 assert.ok(started.match,'live match starts');
 let live=started.match,done=null,guard=0;
 while(!done&&guard++<30){
   const step=advanceLiveMatch(gm,live);
   if(step.result){done=step;break;}
   live=step.match;
   if(live.prompt){const decision=advanceLiveMatch(gm,live,live.prompt.options[0]);live=decision.match;}
 }
 assert.ok(done,'match reaches full time');gm=done.gm;matches++;
}
assert.equal(gm.played,2,'league appearances update');
assert.ok(gm.lastResult.fanReactions.length>=3,'fan community reactions are generated per match');
const itemResult=buyItem(gm,shopItems[0]);
assert.ok(itemResult.gm||itemResult.error,'shop purchase returns valid state');
console.log('Smoke tests passed: league sizes, fixture rounds, manager offers, career initialization, live match flow and shop, European league database, club stars and fan reactions.');

// 해외 9개 리그 모두 1·2부를 보유하고, 시즌 종료 시 2개 구단씩 승강한다.
const {createEuropeanWorld,simulateEuropeanWorld}=await import('../src/leagues.js');
const world=createEuropeanWorld();
assert.equal(Object.keys(world).length,9);
for(const [name,league] of Object.entries(world)){
  const beforeTop=league.top.length,beforeSecond=league.second.length;
  const after=simulateEuropeanWorld({[name]:league},2)[name];
  assert.equal(after.lastMovement.filter(x=>x.direction==='승격').length,2,`${name} 승격 수`);
  assert.equal(after.lastMovement.filter(x=>x.direction==='강등').length,2,`${name} 강등 수`);
  assert.equal(after.top.length,beforeTop,`${name} 1부 팀 수 유지`);
  assert.equal(after.second.length,beforeSecond,`${name} 2부 팀 수 유지`);
}
console.log('European promotion/relegation simulation tests passed.');
const seasonReady={...gm,played:gm.tier===1?38:46,fixtures:[],fa:'탈락',carabao:'탈락',table:gm.table.map((r,i)=>({...r,p:gm.tier===1?38:46,pts:i===0?90:35,gf:50,ga:40}))};
const seasonResult=closeSeason(seasonReady);
assert.ok(seasonResult.gm?.europeanWorld,'season close persists overseas league world state');
assert.equal(seasonResult.gm.youthPool.length,5,'season close creates five selectable youth prospects');
assert.equal(seasonResult.gm.europeanMovementHistory.length,1,'season close records overseas promotion/relegation history');
console.log('Season close integration test passed.');

const featureManager=createManager('youth','점유율 축구');
const featureBase=acceptOffer(featureManager,featureManager.offers[0].id);
const target=featureBase.squad.find(p=>p.position==='공격');
const marketList=transferCandidates(featureBase);
const marketForward=marketList.find(p=>p.position==='공격'&&p.age===19);
assert.equal(marketList.length,12,'each season creates a twelve-player transfer market with three players per position');
assert.equal(marketList.filter(p=>p.position==='골키퍼').length,3,'transfer market includes three goalkeepers');
assert.ok(featureBase.squad.some(p=>p.position==='골키퍼'),'starting squad includes a goalkeeper');
assert.deepEqual(transferCandidates(featureBase).map(p=>p.id),marketList.map(p=>p.id),'the same season market remains stable across renders');
assert.equal(new Set(marketList.map(p=>p.id)).size,marketList.length,'every market player has a unique ID');
assert.equal(new Set(marketList.map(p=>p.name)).size,marketList.length,'market player names do not repeat within a season');
assert.ok(new Set(marketList.map(p=>p.type)).size>=5,'market offers several distinct player archetypes');
assert.ok(new Set(marketList.map(p=>p.rating)).size>=5,'market players have varied ratings');
assert.ok(new Set(marketList.map(p=>p.fee)).size>=5,'market players have varied transfer fees');
assert.ok(marketList.every(p=>p.attributes&&p.style),'each market player has individual attributes and a playing style');
const nextSeasonMarket=transferCandidates({...featureBase,season:featureBase.season+1});
assert.notDeepEqual(nextSeasonMarket.map(p=>p.id),marketList.map(p=>p.id),'new season generates a different transfer market');
assert.notDeepEqual(nextSeasonMarket.map(p=>p.attributes),marketList.map(p=>p.attributes),'new season generates different player attributes');
const signed=signPlayer({...featureBase,transferBudget:1000000000000},marketForward);
assert.equal(signed.gm.squad.length,featureBase.squad.length+1,'signing adds squad depth instead of deleting the existing player');
assert.equal(signed.gm.squad.filter(p=>p.position==='공격').sort((a,b)=>b.rating-a.rating)[0].squadRole,'주전','highest-rated player in a position is assigned as starter');
assert.ok(signed.gm.squad.find(p=>p.marketId===marketForward.id).squadRole==='주전'||signed.gm.squad.find(p=>p.marketId===marketForward.id).squadRole==='부분 로테이션','new signing receives a rating-based squad role');
assert.ok(signed.gm.transferMarketPurchased.includes(marketForward.id),'purchased market player ID is saved');
assert.ok(!transferCandidates(signed.gm).some(p=>p.id===marketForward.id),'purchased player disappears from the market');
assert.ok(signPlayer(signed.gm,marketForward).error?.includes('이미 영입한 선수'),'duplicate purchase is rejected');
assert.equal(transferWindowStatus({...featureBase,lastDay:61}).open,true,'summer transfer window stays open through 31 August');
assert.equal(transferWindowStatus({...featureBase,lastDay:62}).open,false,'summer transfer window closes after 31 August');
assert.equal(transferWindowStatus({...featureBase,lastDay:184}).open,true,'winter transfer window opens on 1 January');
assert.equal(transferWindowStatus({...featureBase,lastDay:214}).open,true,'winter transfer window stays open through 31 January');
assert.equal(transferWindowStatus({...featureBase,lastDay:215}).open,false,'winter transfer window closes after 31 January');
assert.equal(seasonDate({...featureBase,lastDay:62}).iso,'2026-09-01','season day converts to calendar date');
const closedMarket=signPlayer({...featureBase,lastDay:62,transferBudget:1000000000000},marketForward);
assert.ok(closedMarket.error?.includes('이적시장이 닫혀'),'direct signing is blocked outside transfer windows');
assert.ok(transferWindowStatus({...featureBase,lastDay:183}).nextOpen?.includes('2027년 1월 1일'),'after summer close, next opening is the January window');
const winterSigning=signPlayer({...featureBase,lastDay:184,transferBudget:1000000000000},marketForward);
assert.ok(winterSigning.gm?.transferLog?.includes(marketForward.name),'signing is allowed when the winter window opens');
const youngSquad=featureBase.squad.map(p=>({...p,age:19}));const oldSquad=featureBase.squad.map(p=>({...p,age:34}));
assert.deepEqual(positionAverageAges(youngSquad),{공격:19,중원:19,수비:19,골키퍼:19},'average age is independently reported for attack, midfield and defence');
assert.ok(ageAdjustedRatings(youngSquad).공격>ageAdjustedRatings(oldSquad).공격,'young attacking line gets an age-related rating boost vs veteran line');
assert.ok(ageAdjustedRatings(oldSquad).수비<oldSquad.find(p=>p.position==='수비').rating,'older defensive line receives an age-related decline');
assert.equal(resultMoraleChange(youngSquad,true,false),8,'young squad morale rises sharply after a win');
assert.equal(resultMoraleChange(oldSquad,true,false),2,'veteran squad morale remains steadier after a win');
assert.equal(resultMoraleChange(youngSquad,false,false),-8,'young squad morale drops sharply after a loss');
assert.equal(resultMoraleChange(oldSquad,false,false),-2,'veteran squad morale remains steadier after a loss');
const youthBatch=generateYouthProspects({...featureBase,season:2});
assert.equal(youthBatch.length,5,'five academy prospects are generated each season');
assert.equal(new Set(youthBatch.map(p=>p.name)).size,5,'academy prospect names are unique within a batch');
assert.ok(youthBatch.every(p=>!(featureBase.squad||[]).some(member=>member.name===p.name)),'academy prospects do not duplicate current squad members');
const firstXI=beginLiveMatch(featureBase,{rotation:'주전 기용',formation:'4-3-3',press:'높은 압박',line:'높은 수비라인',tempo:'빠른 템포',width:'넓게'}).match;
const rotatedXI=beginLiveMatch(featureBase,{rotation:'대규모 로테이션',formation:'3-5-2',press:'중간 압박',line:'낮은 수비라인',tempo:'느린 템포',width:'보통'}).match;
assert.ok(rotatedXI.rotationRelief>firstXI.rotationRelief,'squad rotation provides extra stamina relief');
const strongAttack={...featureBase,squad:featureBase.squad.map(p=>p.position==='공격'?{...p,rating:99}:p)};
const strongAttackMatch=beginLiveMatch(strongAttack,{rotation:'부분 로테이션',formation:'4-3-3',press:'중간 압박',line:'중간 수비라인',tempo:'보통 템포',width:'보통'}).match;
assert.ok(strongAttackMatch.attackEdge>beginLiveMatch(featureBase,{rotation:'부분 로테이션',formation:'4-3-3',press:'중간 압박',line:'중간 수비라인',tempo:'보통 템포',width:'보통'}).match.attackEdge,'attacking player ratings influence attacking matchup');

assert.ok(getTeamRatings(featureBase).중원>0&&getTeamRatings(featureBase).수비>0&&getTeamRatings(featureBase).골키퍼>0,'team ratings are derived from attack, midfield, defence and goalkeeper units');
const savedRandom=Math.random;Math.random=()=>.5;
const lowAcademy=generateYouthProspects({...featureBase,stats:{...featureBase.stats,유소년육성:20}});
const highAcademy=generateYouthProspects({...featureBase,stats:{...featureBase.stats,유소년육성:90}});
assert.ok(highAcademy.reduce((a,p)=>a+p.potential,0)>lowAcademy.reduce((a,p)=>a+p.potential,0),'youth development skill improves prospect potential');
function simulateForStats(state,opts){let live=beginLiveMatch(state,opts).match,done=null,guard=0;while(!done&&guard++<30){const step=advanceLiveMatch(state,live,live.prompt?.options?.[0]);if(step.result)done=step;else live=step.match;}return done;}
const neutralOpts={rotation:'부분 로테이션',formation:'4-3-3',press:'중간 압박',line:'중간 수비라인',tempo:'보통 템포',width:'보통'};
const wageManager={...featureBase,salary:5200000,cash:0,fixtures:[{...featureBase.fixtures.find(x=>x.type==='리그'),id:'wage-first',day:7,played:false},{...featureBase.fixtures.find(x=>x.type==='리그'),id:'wage-second',day:14,played:false}]};
const wageFirst=simulateForStats(wageManager,neutralOpts);
assert.equal(wageFirst.gm.cash,0,'weekly wages are not paid before seven days have elapsed from the first match');
const wageSecond=simulateForStats(wageFirst.gm,neutralOpts);
assert.equal(wageSecond.gm.cash,100000,'one weekly salary is paid seven days after the first match');
assert.equal(wageSecond.gm.wagePaidWeeks,1,'weekly payroll records paid weeks to prevent duplicate payment');
const baselineStats=simulateForStats(featureBase,neutralOpts).result.stats;
const attackingStats=simulateForStats(strongAttack,neutralOpts).result.stats;
assert.ok(attackingStats.shots>baselineStats.shots&&attackingStats.xg>baselineStats.xg,'attacking unit quality changes shots and expected goals');
const slowStats=simulateForStats(featureBase,{...neutralOpts,tempo:'느린 템포'}).result.stats;
const fastStats=simulateForStats(featureBase,{...neutralOpts,tempo:'빠른 템포'}).result.stats;
assert.ok(slowStats.possession>fastStats.possession&&fastStats.shots>slowStats.shots,'tempo changes possession and shot volume');
Math.random=savedRandom;

// Match engine regression: missing momentum previously made the goal probability NaN,
// silently preventing either side from scoring. Verify normal match scoring and post-match payloads.
const momentumCheck=beginLiveMatch(featureBase,neutralOpts).match;
assert.equal(momentumCheck.momentum,0,'live match initializes momentum at zero');
let totalGoals=0,scoredMatches=0,zeroZeroMatches=0,postMatchPayloads=0;
const scoringSample=100;
for(let i=0;i<scoringSample;i++){
 const outcome=simulateForStats(featureBase,neutralOpts);
 totalGoals+=outcome.result.gf+outcome.result.ga;
 if(outcome.result.gf+outcome.result.ga>0)scoredMatches++;
 if(outcome.result.gf===0&&outcome.result.ga===0)zeroZeroMatches++;
 assert.ok(outcome.result.stats?.possession!==undefined,'full-time result includes match statistics');
 assert.ok(outcome.gm.interview?.questions?.length===2,'full-time result includes two press-conference questions');
 assert.ok(outcome.gm.lastResult?.stats?.shotsOnTarget!==undefined,'saved match report includes shots on target');
 postMatchPayloads++;
}
const averageGoals=totalGoals/scoringSample;
assert.ok(averageGoals>2.2&&averageGoals<4.5,`average total goals should be lively but plausible (actual ${averageGoals.toFixed(2)})`);
assert.ok(scoredMatches>=85,`most matches should contain goals (actual ${scoredMatches}/${scoringSample})`);
assert.ok(zeroZeroMatches<=8,`0-0 results should be uncommon (actual ${zeroZeroMatches}/${scoringSample})`);
for(const portrait of ['attacker-youth.png','attacker-prime.png','attacker-veteran.png','midfielder-youth.png','midfielder-prime.png','midfielder-veteran.png','defender-youth.png','defender-prime.png','defender-veteran.png','goalkeeper-youth.png','goalkeeper-prime.png','goalkeeper-veteran.png','youth.png','prime.png','veteran.png','reporter-1.png','reporter-2.png','reporter-3.png'])assert.ok(fs.existsSync(new URL(`../public/players/${portrait}`,import.meta.url)),'bundled player/reporter portrait exists: '+portrait);
const uiSource=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
assert.ok(uiSource.includes("postMatchStage==='stats'"),'full-time statistics have a dedicated screen before the press conference');
assert.ok(uiSource.includes("setPostMatchStage('interview')")&&uiSource.includes("setTab('기자회견')"),'statistics confirmation opens the press conference');
assert.ok(uiSource.includes("postMatchStage:next.interview?'interview':'complete'"),'press-conference progress is saved with the career');
assert.ok(fs.readFileSync(new URL('../src/engine.js',import.meta.url),'utf8').includes('goalkeeper'),'transfer portraits use position-specific PNG files');
assert.ok(uiSource.includes("tab==='기자회견'"),'press conference is rendered as its own screen');
console.log(`Match-flow regression passed: ${averageGoals.toFixed(2)} average total goals, ${scoredMatches}/${scoringSample} matches with goals, ${zeroZeroMatches}/${scoringSample} 0-0 results, stats and press conference payloads present.`);
console.log('Feature tests passed: rating-ranked squad depth, youth prospects, rotation stamina relief, positional tactics, age-related line ratings, separate position age averages, age-sensitive morale, 7-day weekly payroll, transfer windows and local portraits.');

// Currency display regression: compact Korean units, numeric unit labels, max two significant digits.
assert.equal(money(100000000000),'1000억','one thousand hundred-million won is shown as 1000억');
assert.equal(money(12345678900),'120억','large amounts are rounded to two significant digits');
assert.equal(money(1234567890000),'1.2조','trillion amounts use 조 and two significant digits');
assert.equal(money(1234567),'120만','mid-sized amounts use 만 and two significant digits');
assert.equal(money(5000),'5,000원','small amounts retain won notation');
console.log('Currency formatting tests passed: numeric Korean units and two significant digits.');

// V27: nationality-aware foreign careers, overseas club profiles, renewal offers and UEFA bracket integrity.
assert.ok(managerNationalities.includes('대한민국')&&managerNationalities.includes('스페인'),'manager nationality choices are available');
const spanishManager=createManager('legend','점유율 축구','스페인');
assert.equal(spanishManager.offers.length,5,'career starts with five job offers');
assert.equal(spanishManager.offers.filter(o=>o.isForeign&&o.country==='스페인').length,2,'matching nationality receives two offers from its domestic league');
const spanishOffer=spanishManager.offers.find(o=>o.isForeign&&o.country==='스페인');
const spanishCareer=acceptOffer(spanishManager,spanishOffer.id);
const foreignMatchCount=(spanishCareer.leagueClubs.length-1)*2;
assert.equal(spanishCareer.fixtures.filter(f=>f.type==='리그').length,foreignMatchCount,'foreign league gets a full double round-robin schedule');
assert.equal(spanishCareer.fixtures.filter(f=>f.type==='챔피언스리그'||f.type==='유로파리그'||f.type==='컨퍼런스리그').length,spanishOffer.europeanCompetition==='없음'?0:8,'foreign European entrants receive eight league-phase fixtures');
assert.equal(spanishCareer.europe,spanishOffer.europeanCompetition,'foreign manager offer competition is retained after appointment');
assert.equal(spanishCareer.table.length,spanishCareer.leagueClubs.length,'foreign league table contains every club');
assert.ok(spanishCareer.isForeign&&spanishCareer.leagueName==='라리가','foreign offer starts a playable foreign career');
const foreignProfile=foreignClubProfile(spanishOffer.club,spanishOffer.league);
assert.ok(foreignProfile.nickname&&foreignProfile.averageAge>=23&&foreignProfile.공격&&foreignProfile.중원&&foreignProfile.수비,'foreign club has nickname, average age and three ratings');
assert.ok(spanishCareer.fixtures.some(f=>f.type==='코파 델 레이'),'LaLiga career includes Copa del Rey fixtures');
const germanCups=createForeignDomesticCupFixtures('분데스리가','바이에른 뮌헨',1,['바이에른 뮌헨','보루시아 도르트문트','RB 라이프치히','바이어 레버쿠젠']);
assert.ok(germanCups.fixtures.some(f=>f.type==='DFB-포칼'),'Bundesliga career includes DFB-Pokal');
assert.ok(germanCups.fixtures.some(f=>f.type==='DFL-슈퍼컵'),'eligible Bundesliga clubs receive DFL-Supercup fixture');
for(const [league,club,clubs] of [['세리에 A','인터 밀란',['인터 밀란','AC 밀란','유벤투스','나폴리']],['리그 1','파리 생제르맹',['파리 생제르맹','마르세유','AS 모나코','릴']],['에레디비시','아약스',['아약스','PSV 에인트호번','페예노르트','AZ 알크마르']],['프리메이라리가','벤피카',['벤피카','포르투','스포르팅 CP','브라가']],['스코티시 프리미어십','셀틱',['셀틱','레인저스','하츠','애버딘']],['프로 리그','클럽 브뤼헤',['클럽 브뤼헤','안더레흐트','위니옹 생질루아즈','헹크']],['쉬페르리그','갈라타사라이',['갈라타사라이','페네르바흐체','베식타시','트라브존스포르']]]){const cups=createForeignDomesticCupFixtures(league,club,1,clubs);assert.ok(cups.fixtures.length>=1,`${league} has a domestic cup schedule`);assert.ok(Object.keys(cups.status).length>=1,`${league} tracks domestic cup status`);}
const spanishCupDates=spanishCareer.fixtures.filter(f=>f.type==='코파 델 레이');
assert.equal(spanishCupDates[0].day,135,'Copa del Rey begins in the autumn cup window');
assert.ok(['진행 중','불참'].includes(spanishCareer.domesticCups?.['수페르코파 데 에스파냐']),'LaLiga career tracks Spanish Super Cup eligibility');
const spanishCupTypes=['코파 델 레이','수페르코파 데 에스파냐'];
const foreignFinished=closeSeason({...spanishCareer,played:foreignMatchCount,w:22,d:8,l:foreignMatchCount-30,gf:90,ga:25,pts:105,fixtures:spanishCareer.fixtures.map(f=>spanishCupTypes.includes(f.type)?{...f,played:true}:f),domesticCups:Object.fromEntries(Object.entries(spanishCareer.domesticCups||{}).map(([k])=>[k,'탈락'])),table:spanishCareer.table.map(r=>r.name===spanishCareer.club?{...r,p:foreignMatchCount,w:22,d:8,l:foreignMatchCount-30,gf:90,ga:25,pts:105}:r)});
assert.ok(!foreignFinished.error&&foreignFinished.gm.season===2&&foreignFinished.gm.renewalOffer,'foreign season closes and offers a renewal after a strong finish');
const renewed=resolveRenewalOffer(foreignFinished.gm,'accept');
assert.equal(renewed.contractYears,3,'accepting renewal signs a three-year extension');
assert.equal(renewed.renewalOffer,null,'renewal offer is cleared after decision');
const uclBase=createManager('legend','게겐프레싱');
const uclClub='리버풀';
const uclTable=Array.from({length:36},(_,i)=>({name:i===0?uclClub:`UCL 팀 ${i+1}`,p:8,w:5,d:1,l:2,gf:30-i,ga:8,pts:20-i,pot:Math.floor(i/9)+1,ai:i!==0}));
const uclCareer={...uclBase,club:uclClub,europeanCompetition:{competition:'챔피언스리그',stage:'리그 페이즈',club:uclClub,fixtures:[],table:uclTable,pots:Array.from({length:4},(_,i)=>({pot:i+1,teams:uclTable.slice(i*9,(i+1)*9).map(r=>r.name)}))}};
const uclPO=europeanKnockoutStart(uclCareer);
assert.equal(uclPO.europeanCompetition.playoffPairs.length,8,'UCL playoff has eight seeded ties');
const playoffTable=Array.from({length:36},(_,i)=>({name:i===9?uclClub:`PO 팀 ${i+1}`,p:8,w:4,d:2,l:2,gf:25-i,ga:12,pts:i<9?40-i:i===9?25:24-(i-10),pot:Math.floor(i/9)+1,ai:i!==9}));
const playoffCareer={...uclBase,club:uclClub,seasonStartYear:2026,lastDay:210,fixtures:[],europeanCompetition:{competition:'챔피언스리그',stage:'리그 페이즈',club:uclClub,fixtures:Array.from({length:8},(_,i)=>({id:`PO-MD-${i}`,type:'챔피언스리그',round:'리그 페이즈',matchday:i+1,day:70+i*10,home:i%2===0,opponent:`MD 상대 ${i+1}`,played:true,score:'1-0'})),table:playoffTable,pots:[]}};
const playoffCareerDraw=europeanKnockoutStart(playoffCareer);
assert.equal(playoffCareerDraw.europeanCompetition.stage,'플레이오프','9th-24th teams enter the playoff round');
const playablePO=playoffCareerDraw.fixtures.filter(f=>f.type==='챔피언스리그'&&f.round==='플레이오프');
assert.equal(playablePO.length,2,'playoff tie is added as two individual live fixtures');
assert.deepEqual(playablePO.map(f=>f.leg),[1,2],'playoff fixtures are split into first and second legs');
assert.ok(playablePO.every(f=>f.day>210),'playoff fixtures are scheduled after the league phase');
const poEntrants=uclPO.europeanCompetition.playoffPairs.flatMap(p=>[p.home,p.away]);
assert.equal(new Set(poEntrants).size,16,'UCL playoff draw has no duplicate entrants');
assert.equal(uclPO.europeanCompetition.stage,'16강','top-eight club skips the playoff and bracket advances automatically');
assert.equal(uclPO.europeanCompetition.knockoutPairs.length,8,'round of 16 has eight ties');
assert.equal(uclPO.fixtures.filter(f=>f.type==='챔피언스리그'&&f.round==='16강').length,2,'manager receives two playable round-of-16 fixtures');
const r16Entrants=uclPO.europeanCompetition.knockoutPairs.flatMap(p=>[p.home,p.away]);
assert.equal(new Set(r16Entrants).size,16,'round-of-16 bracket has no duplicate entrants');
const mainSource=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
assert.ok(mainSource.includes('리그 페이즈 경기 일정'),'Champions League matchday calendar is visible in the cups tab');
assert.ok(mainSource.includes('전체 리그 페이즈 순위표'),'Champions League standings show all 36 places');
assert.ok(!mainSource.includes('대진 경기 결과 진행'),'knockout matches are not simulated by a round-advance button');
const playableUclOffer={id:'ucl-live',club:'리버풀',tier:1,league:'프리미어리그',leagueClubs:leagueData[0].clubs,rep:90,salary:1000000000,weekly:20000000,years:3,budget:10000000000,expectations:{league:'우승 경쟁',fa:'8강',carabao:'4강'},europeanCompetition:'챔피언스리그'};
const playableUcl=acceptOffer({...createManager('legend','게겐프레싱'),offers:[playableUclOffer]},'ucl-live');
const oldSave={...playableUcl,fixtures:playableUcl.fixtures.map(f=>f.type==='챔피언스리그'?{...f,day:14}:f),europeanCompetition:{...playableUcl.europeanCompetition,fixtures:playableUcl.europeanCompetition.fixtures.map(f=>({...f,day:14}))}};
const migratedSave=migrateEuropeanCalendar(oldSave);
assert.equal(seasonDate(migratedSave,migratedSave.fixtures.find(f=>f.type==='챔피언스리그').day).iso,'2026-09-08','existing saves are migrated to the correct UEFA matchday dates');
const mdFixtures=playableUcl.fixtures.filter(f=>f.type==='챔피언스리그'&&f.round==='리그 페이즈').sort((a,b)=>a.matchday-b.matchday);
assert.equal(mdFixtures.length,8,'league phase fixtures are included in the regular career calendar');
assert.deepEqual(mdFixtures.map(f=>{const d=new Date(Date.UTC(playableUcl.seasonStartYear,6,1+f.day));return `${d.getUTCMonth()+1}/${d.getUTCDate()}`;}),['9/8','10/13','10/20','11/3','11/24','12/8','1/19','1/27'],'league phase follows 2026/27 matchday dates');
const duplicateSquad=assignSquadRoles([{id:'old-1',name:'준호 김',position:'공격',rating:68},{id:'old-2',marketId:'market-duplicate',name:'준호 김',position:'공격',rating:68},{id:'other',name:'준호 김',position:'중원',rating:62}]);
assert.equal(duplicateSquad.length,2,'duplicate player names in the same position are migrated to one player');
assert.equal(duplicateSquad.find(p=>p.position==='공격').squadRole,'주전','remaining duplicate player receives a squad role');
console.log('V27 tests passed: nationality-based job offers, playable overseas leagues, foreign club profiles, renewals and unique UCL playoff/R16 brackets.');

for(const league of europeanLeagues){const manager=createManager('legend','역습 축구',league.country);const offers=manager.offers.filter(o=>o.isForeign&&o.country===league.country);assert.ok(offers.length>=2,`${league.country} manager receives local-league offers`);const career=acceptOffer(manager,offers[0].id);assert.equal(career.fixtures.filter(f=>f.type==='리그').length,(league.clubs.length-1)*2,`${league.name} domestic fixture count matches its team count`);
 assert.equal(career.europe,offers[0].europeanCompetition,`${league.name} European qualification is retained on appointment`);}
console.log('Overseas league coverage passed: all nine countries produce nationality-matched offers and complete league schedules.');

const uclStartManager=createManager('legend','게겐프레싱');
const baseUclOffer=uclStartManager.offers.find(o=>o.tier===1&&!o.isForeign);
const uclStartOffer={...baseUclOffer,club:'리버풀',tier:1,league:'프리미어리그',leagueName:'프리미어리그',leagueClubs:leagueData[0].clubs,isForeign:false};
const uclStartCareer=acceptOffer({...uclStartManager,offers:[uclStartOffer]},uclStartOffer.id);
const uclSchedule=uclStartCareer.europeanCompetition.fixtures;
assert.equal(uclSchedule.length,8,'Champions League league phase schedules eight opponents');
assert.equal(new Set(uclSchedule.map(f=>f.opponent)).size,8,'Champions League league phase has no repeated opponents');
assert.equal(uclSchedule.filter(f=>f.home).length,4,'Champions League schedule has four home matches');
assert.equal(uclSchedule.filter(f=>!f.home).length,4,'Champions League schedule has four away matches');
assert.equal(uclStartCareer.europeanCompetition.table.length,36,'Champions League league phase contains 36 clubs');
for(let pot=1;pot<=4;pot++)assert.equal(uclSchedule.filter(f=>f.pot===pot).length,2,`two opponents are drawn from pot ${pot}`);

assert.ok(uclSchedule.every(f=>!leagueData[0].clubs.includes(f.opponent)),'English clubs do not draw same-association opponents in the league phase');
const drawCountry=name=>leagueData[0].clubs.includes(name)?'잉글랜드':allEuropeanClubs.find(c=>c.name===name)?.country||'기타';
assert.ok(Object.values(uclSchedule.reduce((counts,f)=>({...counts,[drawCountry(f.opponent)]:(counts[drawCountry(f.opponent)]||0)+1}),{})).every(n=>n<=2),'league phase draw includes at most two opponents from each association');

function awardSeason({position=1,goals=0,assists=0,rating=7.2,uclWinner='리버풀'}={}){
 const base=createManager('legend','게겐프레싱');const offer={...base.offers.find(o=>o.tier===1&&!o.isForeign),club:'리버풀',tier:1,league:'프리미어리그',leagueName:'프리미어리그',leagueClubs:leagueData[0].clubs,isForeign:false};
 const career=acceptOffer({...base,offers:[offer]},offer.id);const rows=leagueData[0].clubs.map((name,i)=>({name,p:38,w:20,d:5,l:13,gf:55,ga:40,pts:name==='리버풀'?(position===1?90:85):name==='아스널'?(position===1?85:90):30}));
 const squad=[{id:'award-fw',name:'Award Forward',position:'공격',rating:90,age:25,squadRole:'주전',seasonGoals:goals,seasonAssists:assists,seasonAppearances:38,seasonRatingTotal:rating*38,seasonAverageRating:rating},{id:'award-mf',name:'Award Midfielder',position:'중원',rating:85,age:26,squadRole:'주전',seasonGoals:5,seasonAssists:8,seasonAppearances:38,seasonRatingTotal:rating*37,seasonAverageRating:rating-.03},{id:'award-df',name:'Award Defender',position:'수비',rating:82,age:27,squadRole:'주전',seasonGoals:1,seasonAssists:2,seasonAppearances:38,seasonRatingTotal:rating*36,seasonAverageRating:rating-.05},{id:'award-gk',name:'Award Keeper',position:'골키퍼',rating:84,age:29,squadRole:'주전',seasonGoals:0,seasonAssists:0,seasonAppearances:38,seasonRatingTotal:rating*37,seasonAverageRating:rating-.02}];
 return closeSeason({...career,played:38,w:25,d:5,l:8,gf:75,ga:35,pts:position===1?90:85,table:rows,fixtures:[],fa:'탈락',carabao:'탈락',squad,europeanCompetition:{competition:'챔피언스리그',stage:'대회 종료',final:{home:'리버풀',away:'레알 마드리드',winner:uclWinner}}});
}
const noIndividualAwards=awardSeason({goals:24,assists:12,uclWinner:'레알 마드리드'});
assert.equal(noIndividualAwards.gm.pendingAwards,null,"no individual awards are announced below the 25-goal and 13-assist thresholds when Ballon d'Or conditions are unmet");
const doubleWinners=awardSeason({goals:25,assists:13,rating:7.6,uclWinner:'리버풀'});
assert.deepEqual(doubleWinners.gm.pendingAwards.winners.map(x=>x.award).sort(),['득점왕','도움왕','발롱도르'].sort(),'league and Champions League double with best starter rating can earn all awards');
const runnerUpBallon=awardSeason({position:2,goals:10,assists:8,rating:8.3,uclWinner:'리버풀'});
assert.ok(runnerUpBallon.gm.pendingAwards.winners.some(x=>x.award==='발롱도르'),"league runner-up with Champions League title and an 8.0+ starter rating can win Ballon d'Or");




// Goal distribution favors forwards, goalkeeper assists are excluded, and squad identities stay unique.
const keeperStats=recordPlayerMatchStats([{id:'gk',name:'Keeper',position:'골키퍼'},{id:'fw',name:'Forward',position:'공격'},{id:'mf',name:'Midfielder',position:'중원'},{id:'df',name:'Defender',position:'수비'}],500,{win:true,ga:0});
assert.equal(keeperStats.find(p=>p.id==='gk').seasonAssists,0,'goalkeeper assists are excluded');
assert.ok(keeperStats.find(p=>p.id==='fw').seasonGoals>keeperStats.find(p=>p.id==='mf').seasonGoals,'forward goals exceed midfielder goals over a large sample');
assert.ok(keeperStats.every(p=>p.seasonAppearances===1&&p.seasonAverageRating>0),'league match appearances and ratings are recorded');
assert.equal(assignSquadRoles([{id:'a',name:'A',position:'공격',rating:80},{id:'b',name:'B',position:'공격',rating:75},{id:'a-copy',name:'A',position:'공격',rating:80}]).length,2,'duplicate player identity is removed from squad lists even if the duplicate has a different ID');
assert.ok(keeperStats.filter(p=>p.position!=='골키퍼').reduce((sum,p)=>sum+p.seasonAssists,0)<=500,'assists cannot exceed goals');
console.log('Player-stat regression passed: weighted scorers, goalkeeper assist exclusion, ratings and duplicate squad identities.');


// V37 calendar and tactical-philosophy progression.
const calendarFixtures=createSeason(1,'리버풀',1).filter(f=>f.type==='리그');
const calendarDays=calendarFixtures.map(f=>f.day);
assert.ok(calendarDays.at(-1)>=280&&calendarDays.at(-1)<=335,'league season finishes in late May');
const internationalWindows=[[85,90],[134,139],[183,188],[267,272]];
for(const [start,end] of internationalWindows){assert.ok(!calendarDays.some(day=>day>=start&&day<=end),'no league fixture is scheduled during an international break');}
const philosophyCareer=createManager('unknown','게겐프레싱');
assert.deepEqual(Object.keys(philosophyCareer.tacticUnderstanding).sort(),['게겐프레싱','역습','점유율축구'].sort(),'three separate tactical understanding stats are initialized');
assert.equal(shopItems.filter(item=>item.tactic).length,3,'shop retains exactly three tactical philosophy courses');
assert.equal(shopItems.filter(item=>item.stat).length,5,'shop adds five manager-skill development products');
const purchased=buyItem({...philosophyCareer,cash:1000000000},shopItems[0]);
assert.equal(purchased.gm.tacticUnderstanding.게겐프레싱,39,'buying a philosophy course increases only that philosophy understanding by four');
assert.equal(purchased.gm.tacticUnderstanding.역습,35,'other philosophy understanding remains unchanged');
const skillProducts=['선수관리','경기분석','동기부여','유소년육성','위기관리'];
for(const skill of skillProducts){const item=shopItems.find(product=>product.stat===skill);assert.ok(item,`${skill} development product exists`);const result=buyItem({...philosophyCareer,cash:1000000000},item);assert.equal(result.gm.stats[skill],philosophyCareer.stats[skill]+2,`${skill} product increases the matching manager stat by two`);}
assert.equal(buyItem(purchased.gm,shopItems[1]).error,'성장 상점 상품은 일주일에 한 번만 구매할 수 있습니다.','weekly purchase limit still applies across all product types');
assert.ok(shopItems.filter(item=>item.tactic).every(item=>item.price===450000000),'tactical courses are more expensive');
assert.ok(shopItems.filter(item=>item.stat).every(item=>item.price===400000000),'manager-skill courses are more expensive');
let euroProgress={...uclStartCareer,europeanCompetition:{...uclStartCareer.europeanCompetition,fixtures:uclStartCareer.europeanCompetition.fixtures.map(f=>({...f}))}};
for(const fixture of [...euroProgress.europeanCompetition.fixtures])euroProgress=recordEuropeanLeagueFixture(euroProgress,fixture,2,1);
assert.equal(euroProgress.europeanCompetition.stage,'16강','top-eight manager automatically bypasses the playoff round');
assert.equal(euroProgress.europeanCompetition.playoffPairs.length,8,'playoff bracket contains eight AI ties');
assert.equal(euroProgress.europeanCompetition.knockoutPairs.length,8,'round-of-16 bracket is generated after AI playoffs');
assert.equal(euroProgress.fixtures.filter(f=>f.type==='챔피언스리그'&&f.round==='16강').length,2,'two individual round-of-16 legs are added to the manager calendar');
assert.equal(euroProgress.europeanCompetition.knockoutPairs[0].firstLegDate,'2027년 3월 9일','round of 16 first legs start on 9 March 2027');
assert.equal(europeanRoundReady({...euroProgress,lastDay:251}),false,'round of 16 date gate remains before its second-leg date');
assert.equal(europeanRoundReady({...euroProgress,lastDay:260}),true,'round of 16 date gate opens after 17 March 2027');

console.log('V37 calendar and tactical philosophy progression tests passed.');
