// Player model and FotMob-shaped roster normalizer. No remote scraping is performed here.
export const PLAYER_ROLES = {
  '스트라이커':['타겟맨','포쳐','폴스나인','완성형 공격수','침투형 포워드'],
  '윙어':['클래식 윙어','수비형 윙어','인사이드 포워드','인버티드 윙어'],
  '공격형 미드필더':['공격형 미드필더','전진형 플레이메이커','세컨드 스트라이커','트레콰르티스타'],
  '중앙 미드필더':['박스 투 박스','딥라잉 플레이메이커','볼 위닝 미드필더','로밍 플레이메이커'],
  '수비수':['빌드업 센터백','안정형 센터백','윙백','풀백','수비형 풀백','인버티드 풀백'],
  '골키퍼':['골키퍼','스위퍼 키퍼']
};
export const ROLE_POINT_BIAS = {
 '타겟맨':{goal:1.15,assist:.85,shot:1.05,create:.9,duel:1.2},'포쳐':{goal:1.55,assist:.55,shot:1.45,create:.55,duel:.8},'폴스나인':{goal:.72,assist:1.5,shot:.8,create:1.5,duel:.85},'완성형 공격수':{goal:1.2,assist:1.1,shot:1.1,create:1.05,duel:1},'침투형 포워드':{goal:1.4,assist:.8,shot:1.3,create:.8,duel:.9},
 '클래식 윙어':{goal:.8,assist:1.4,shot:.8,create:1.45,duel:.9},'수비형 윙어':{goal:.65,assist:1.05,shot:.65,create:1.05,duel:1.25},'인사이드 포워드':{goal:1.4,assist:.85,shot:1.35,create:.9,duel:.9},'인버티드 윙어':{goal:1.05,assist:1.2,shot:1.05,create:1.25,duel:.9},
 '공격형 미드필더':{goal:.95,assist:1.2,shot:.9,create:1.3,duel:.8},'전진형 플레이메이커':{goal:.8,assist:1.5,shot:.75,create:1.6,duel:.85},'세컨드 스트라이커':{goal:1.3,assist:1.05,shot:1.25,create:1.05,duel:.8},'트레콰르티스타':{goal:1.0,assist:1.55,shot:.95,create:1.65,duel:.65},
 '박스 투 박스':{goal:1,assist:1,shot:1,create:1,duel:1.15},'딥라잉 플레이메이커':{goal:.55,assist:1.35,shot:.55,create:1.5,duel:1},'볼 위닝 미드필더':{goal:.45,assist:.7,shot:.5,create:.7,duel:1.5},'로밍 플레이메이커':{goal:.85,assist:1.3,shot:.8,create:1.45,duel:1},
 '빌드업 센터백':{goal:.25,assist:.8,shot:.2,create:1.25,duel:1.15},'안정형 센터백':{goal:.25,assist:.35,shot:.2,create:.55,duel:1.45},'윙백':{goal:.55,assist:1.3,shot:.55,create:1.35,duel:1.2},'풀백':{goal:.35,assist:.95,shot:.3,create:1,duel:1.25},'수비형 풀백':{goal:.2,assist:.55,shot:.2,create:.75,duel:1.4},'인버티드 풀백':{goal:.3,assist:.85,shot:.35,create:1.25,duel:1.2},'골키퍼':{goal:.01,assist:.08,shot:.01,create:.15,duel:1}
};
import rosterDatabase from '../data/players/rosters.js';
const stableHash = value => { let h=2166136261; for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0).toString(36); };
export function playerIdentityId(p={}) {
  if(p.fotmobId!=null && String(p.fotmobId).trim()) return `fotmob:${String(p.fotmobId).trim()}`;
  const base=[p.name||'',p.nationality||p.cname||'',p.dateOfBirth||p.birthDate||'',p.club||p.teamName||''].join('|').normalize('NFKC').toLocaleLowerCase();
  return `player:${stableHash(base)}`;
}
export function normalizePosition(raw='') {
 const s=String(raw).toLowerCase();
 if(/keeper|goalkeeper|골키퍼/.test(s)) return '골키퍼';
 if(/wing|forward|striker|attacker|공격수|윙어/.test(s)) return /wing/.test(s)?'윙어':'스트라이커';
 if(/attacking midfield|공격형 미드필더|trequartista/.test(s)) return '공격형 미드필더';
 if(/midfield|중앙 미드필더|defensive midfield/.test(s)) return '중앙 미드필더';
 if(/defender|back|centre-back|center-back|수비수/.test(s)) return '수비수';
 return '중앙 미드필더';
}
export function normalizeFotMobTeamPayload(payload={}, clubOverride='') {
 const team=payload.details||payload.team||{}; const club=clubOverride||team.name||payload.name||'';
 const groups=payload.squad?.squad||payload.squad||[]; const out=[];
 for(const group of groups){const title=group.title||group.role?.fallback||''; if(/coach|감독/i.test(title)) continue;
  for(const raw of group.members||[]){if(raw.excludeFromRanking||raw.isCoach)continue;
   const role=raw.role?.fallback||raw.role||title; const position=normalizePosition(`${title} ${role}`); const age=Number(raw.age)||null;
   const broadPosition=position==='골키퍼'?'골키퍼':['스트라이커','윙어'].includes(position)?'공격':['공격형 미드필더','중앙 미드필더'].includes(position)?'중원':'수비';
   const p={fotmobId:raw.id==null?null:String(raw.id),name:raw.name||raw.localizedName||'',nationality:raw.cname||raw.country||raw.ccode||'미상',countryCode:raw.ccode||'',dateOfBirth:raw.dateOfBirth||raw.birthDate?.utcTime||null,age,club,teamId:team.id||null,position:broadPosition,positionDetail:position,source:'FotMob',sourceUpdatedAt:new Date().toISOString()};
   p.id=playerIdentityId(p); p.rating=estimateBaseRating({...p,position:position}); p.role=defaultRole(position,raw); p.fitness=100; p.season={appearances:0,goals:0,assists:0,ratingTotal:0}; out.push(p);
  }
 }
 return {club,teamId:team.id||null,source:'FotMob',updatedAt:new Date().toISOString(),counts:Object.fromEntries(['스트라이커','윙어','공격형 미드필더','중앙 미드필더','수비수','골키퍼'].map(k=>[k,out.filter(p=>p.position===k).length])),players:out};
}
export function estimateBaseRating(p={}) {
 // FotMob squad lists do not guarantee a universal overall rating; this is an explicitly labelled game estimate.
 const age=Number(p.age)||25; const pos=p.position||'중앙 미드필더'; const seed=parseInt(stableHash(`${p.id||p.name}|${pos}`),36)||50;
 const baseline=pos==='골키퍼'?61:pos==='수비수'?60:pos==='스트라이커'?62:61;
 const ageFactor=age<20?-5:age<23?-1:age<=29?3:age<=32?1:-4;
 return Math.max(35,Math.min(91,baseline+ageFactor+(seed%13)-6));
}
export function defaultRole(position, raw={}) {
 const list=PLAYER_ROLES[position]||PLAYER_ROLES['중앙 미드필더']; const text=String(raw.role?.fallback||raw.role||'').toLowerCase();
 if(position==='골키퍼')return /sweeper/.test(text)?'스위퍼 키퍼':'골키퍼';
 if(position==='윙어')return /left|right wing|winger/.test(text)?'클래식 윙어':'인사이드 포워드';
 if(position==='스트라이커')return /target/.test(text)?'타겟맨':/second/.test(text)?'세컨드 스트라이커':'침투형 포워드';
 if(position==='수비수')return /wing.?back/.test(text)?'윙백':/full.?back/.test(text)?'풀백':/centre|center/.test(text)?'안정형 센터백':'빌드업 센터백';
 if(position==='공격형 미드필더')return '전진형 플레이메이커';
 return list[0];
}
export function rolePointBias(player={}) {return ROLE_POINT_BIAS[player.role]||{goal:1,assist:1,shot:1,create:1,duel:1};}
export function normalizeSquad(players=[]) {return players.map(p=>{const x={...p};x.id=x.id||playerIdentityId(x);x.rating=Number(x.rating)||estimateBaseRating(x);x.fitness=Math.max(0,Math.min(100,Number(x.fitness??100)));x.role=x.role||defaultRole(x.position||normalizePosition(x.rawPosition));x.season={appearances:0,goals:0,assists:0,ratingTotal:0,...(x.season||{})};return x;});}

export function getImportedClubRoster(club) { const file=rosterDatabase.clubs?.[club]; return file?.players?.length?normalizeSquad(file.players):null; }
export function importedRosterSummary(){return Object.values(rosterDatabase.clubs||{}).map(x=>({club:x.club,count:x.players?.length||0,counts:x.counts||{}}));}
