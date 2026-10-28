-- Surprise entrance song, initial schema.
-- File only. Do not apply this from CI or from app scripts.
-- Target: Supabase Postgres (storage schema, plus anon / authenticated / service_role).

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  requester_name text,
  title text,
  storage_path text not null,
  status text not null default 'pending',
  played_at timestamptz,
  constraint requests_requester_name_length check (
    requester_name is null or char_length(requester_name) between 1 and 80
  ),
  constraint requests_title_length check (
    title is null or char_length(title) between 1 and 160
  ),
  constraint requests_storage_path_length check (
    char_length(storage_path) between 1 and 1024
  ),
  constraint requests_status_check check (
    status in ('pending', 'approved', 'played', 'rejected')
  ),
  constraint requests_played_at_matches_status check (
    (status = 'played') = (played_at is not null)
  )
);

comment on table public.requests is
  'Song requests. Anon may insert pending rows only. Play history is not publicly readable.';

create table public.arrivals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text,
  constraint arrivals_source_length check (
    source is null or char_length(source) between 1 and 80
  )
);

comment on table public.arrivals is
  'Door-arrival events from the camera webhook. Not readable by anon.';

-- Newest approved, unplayed request. The player reads this with the service role.
create index requests_next_to_play_idx
  on public.requests (created_at desc)
  where status = 'approved' and played_at is null;

alter table public.requests enable row level security;
alter table public.arrivals enable row level security;
alter table public.requests force row level security;
alter table public.arrivals force row level security;

-- Anon insert only. status must stay pending and played_at must stay null.
-- No select, update, or delete policy: those operations are denied for anon.
create policy requests_anon_insert
  on public.requests
  for insert
  to anon
  with check (
    status = 'pending'
    and played_at is null
  );

-- Supabase default privileges grant anon and authenticated full table access.
-- Strip that, then allow anon to insert requests and nothing else.
revoke all on table public.requests from public, anon, authenticated;
revoke all on table public.arrivals from public, anon, authenticated;
grant insert on table public.requests to anon;
grant all on table public.requests to service_role;
grant all on table public.arrivals to service_role;

-- Private bucket. MIME types and the 10 MB cap are enforced by Storage.
-- Bucket metadata is inserted here; object bytes go through the Storage API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'songs',
  'songs',
  false,
  10485760,
  array['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav']::text[]
);

-- Anon can upload into `songs` and cannot list, read, replace, or delete.
-- storage.objects already has RLS enabled by Supabase. Do not disable it.
create policy songs_anon_insert_only
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'songs');
