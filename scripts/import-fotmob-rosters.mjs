// Convert locally obtained FotMob team JSON exports into the game's normalized roster database.
// This script intentionally does not crawl FotMob or bypass its access/usage terms.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeFotMobTeamPayload } from '../src/player-data.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];
if(!input){console.error('사용법: node scripts/import-fotmob-rosters.mjs <FotMob 팀 JSON 파일> [구단명]');process.exit(1);}
const payload=JSON.parse(fs.readFileSync(path.resolve(input),'utf8'));
const normalized=normalizeFotMobTeamPayload(payload,process.argv[3]||'');
if(!normalized.players.length){console.error('선수 명단을 찾지 못했습니다. FotMob 팀 응답의 squad.squad 구조인지 확인하세요.');process.exit(2);}
const outDir=path.join(root,'data','players');fs.mkdirSync(outDir,{recursive:true});
const safe=normalized.club.normalize('NFKC').replace(/[^\p{L}\p{N}-]+/gu,'-').replace(/^-|-$/g,'')||'team';
const out=path.join(outDir,'rosters.js');let db={version:1,clubs:{}};if(fs.existsSync(out)){const source=fs.readFileSync(out,'utf8');const match=source.match(/export default ([\s\S]*);\s*$/);if(match)db=JSON.parse(match[1]);}db.clubs[normalized.club]=normalized;fs.writeFileSync(out,'export default '+JSON.stringify(db,null,2)+';\n');
console.log(`${normalized.club}: ${normalized.players.length}명 → ${path.relative(root,out)}`);
console.log(normalized.counts);
