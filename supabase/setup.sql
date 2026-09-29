-- Run once in Supabase SQL Editor. Private per-user notebook with optimistic concurrency.
create table if not exists public.notebooks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision bigint not null default 1,
  data jsonb not null check ((data->>'version' = '1' and jsonb_typeof(data->'beans') = 'array' and jsonb_typeof(data->'recipes') = 'array') is true),
  updated_at timestamptz not null default now()
);
alter table public.notebooks enable row level security;
drop policy if exists own_notebook on public.notebooks;
create policy own_notebook on public.notebooks for select to authenticated using ((select auth.uid())=user_id);
revoke all on public.notebooks from anon, authenticated;
grant select, insert, update on public.notebooks to authenticated;
create policy insert_own_notebook on public.notebooks for insert to authenticated with check ((select auth.uid())=user_id);
create policy update_own_notebook on public.notebooks for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create or replace function public.save_notebook(payload jsonb, expected_revision bigint) returns bigint
language plpgsql security invoker set search_path = '' as $$
declare result bigint; uid uuid := auth.uid();
begin
 if uid is null then raise exception 'Inicia sesión primero'; end if;
 if expected_revision=0 then
   insert into public.notebooks(user_id,data,revision) values(uid,payload,1) on conflict do nothing returning revision into result;
 else
   update public.notebooks set data=payload, revision=revision+1, updated_at=now() where user_id=uid and revision=expected_revision returning revision into result;
 end if;
 if result is null then raise exception 'Hay una copia más reciente. Exporta tus cambios locales y recupera la copia antes de volver a guardar.'; end if;
 return result;
end; $$;
revoke all on function public.save_notebook(jsonb,bigint) from public,anon;
grant execute on function public.save_notebook(jsonb,bigint) to authenticated;
