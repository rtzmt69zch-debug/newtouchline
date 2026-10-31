-- Touchline Manager Career: Supabase schema
-- Run this in Supabase SQL Editor after creating a project.
create extension if not exists pgcrypto;

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  visibility text not null default 'private' check (visibility in ('public','private')),
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(6),'hex'),1,8)),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default '감독',
  club text,
  tier int check (tier between 1 and 7),
  manager_state jsonb,
  joined_at timestamptz not null default now(),
  unique(league_id,user_id),
  unique(league_id,club)
);
create table if not exists public.online_results (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  club text not null,
  opponent text not null,
  competition text not null,
  score text not null,
  result text not null,
  created_at timestamptz not null default now()
);
create index if not exists league_members_league_idx on public.league_members(league_id);
create index if not exists online_results_league_idx on public.online_results(league_id,created_at desc);

create or replace function public.is_league_member(p_league_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.league_members m where m.league_id=p_league_id and m.user_id=auth.uid());
$$;

alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.online_results enable row level security;

create policy "public leagues readable, private leagues visible to members" on public.leagues
 for select using (visibility='public' or public.is_league_member(id) or owner_id=auth.uid());
create policy "authenticated users create leagues" on public.leagues for insert to authenticated with check(owner_id=auth.uid());
create policy "owners update leagues" on public.leagues for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "members readable by league participants" on public.league_members for select to authenticated using(public.is_league_member(league_id) or exists(select 1 from public.leagues l where l.id=league_id and l.visibility='public'));
create policy "users insert own membership" on public.league_members for insert to authenticated with check(user_id=auth.uid());
create policy "users update own membership" on public.league_members for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users delete own membership" on public.league_members for delete to authenticated using(user_id=auth.uid());
create policy "league results visible to participants" on public.online_results for select to authenticated using(public.is_league_member(online_results.league_id));
create policy "members post own results" on public.online_results for insert to authenticated with check(user_id=auth.uid() and public.is_league_member(online_results.league_id));

create or replace function public.create_league(p_name text,p_visibility text default 'private')
returns jsonb language plpgsql security definer set search_path=public as $$
declare l public.leagues;
begin
 if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
 if p_visibility not in ('public','private') then raise exception '잘못된 공개 설정입니다.'; end if;
 insert into public.leagues(name,visibility,owner_id) values(trim(p_name),p_visibility,auth.uid()) returning * into l;
 insert into public.league_members(league_id,user_id,display_name) values(l.id,auth.uid(),coalesce(nullif(split_part((select email from auth.users where id=auth.uid()),'@',1),''),'감독'));
 return jsonb_build_object('id',l.id,'name',l.name,'visibility',l.visibility,'invite_code',l.invite_code,'owner_id',l.owner_id);
end; $$;

create or replace function public.join_league(p_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare l public.leagues; uname text;
begin
 if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
 select * into l from public.leagues where invite_code=upper(trim(p_code));
 if l.id is null then raise exception '해당 초대 코드의 리그를 찾을 수 없습니다.'; end if;
 uname:=coalesce(nullif(split_part((select email from auth.users where id=auth.uid()),'@',1),''),'감독');
 insert into public.league_members(league_id,user_id,display_name) values(l.id,auth.uid(),uname) on conflict(league_id,user_id) do nothing;
 return jsonb_build_object('id',l.id,'name',l.name,'visibility',l.visibility,'invite_code',l.invite_code,'owner_id',l.owner_id);
end; $$;

-- Enable realtime updates for the lobby, membership list and result feed.
do $$ begin
 alter publication supabase_realtime add table public.league_members;
 exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
 alter publication supabase_realtime add table public.online_results;
 exception when duplicate_object then null; when undefined_object then null; end $$;

-- Aggregated standings for a shared online competition (results submitted by league members).
create or replace view public.online_league_standings with (security_invoker=true) as
select league_id, club,
       count(*)::int as played,
       count(*) filter (where result='승리')::int as wins,
       count(*) filter (where result='무승부')::int as draws,
       count(*) filter (where result='패배')::int as losses,
       (count(*) filter (where result='승리')*3 + count(*) filter (where result='무승부'))::int as points
from public.online_results
group by league_id,club;
