begin;

create table public.closing_loop_cases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  dataset_row_id uuid not null references public.dataset_rows(id) on delete cascade,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'closed')),
  priority text not null default 'normal'
    check (priority in ('high', 'normal', 'low')),
  owner_membership_id uuid references public.workspace_members(id) on delete set null,
  created_by_membership_id uuid references public.workspace_members(id) on delete set null,
  updated_by_membership_id uuid references public.workspace_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint closing_loop_cases_dataset_row_key unique (dataset_row_id),
  constraint closing_loop_cases_id_workspace_key unique (id, workspace_id),
  constraint closing_loop_cases_closed_at_check check (
    (status = 'closed' and closed_at is not null)
    or (status <> 'closed' and closed_at is null)
  )
);

create index closing_loop_cases_workspace_status_updated_idx
  on public.closing_loop_cases (workspace_id, status, updated_at desc);

create index closing_loop_cases_workspace_owner_status_idx
  on public.closing_loop_cases (workspace_id, owner_membership_id, status);

create index closing_loop_cases_workspace_priority_updated_idx
  on public.closing_loop_cases (workspace_id, priority, updated_at desc);

create table public.closing_loop_case_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id uuid not null,
  event_type text not null check (
    event_type in (
      'case_created',
      'status_changed',
      'owner_changed',
      'priority_changed',
      'note_added'
    )
  ),
  actor_membership_id uuid references public.workspace_members(id) on delete set null,
  previous_status text check (
    previous_status is null or previous_status in ('open', 'in_progress', 'closed')
  ),
  new_status text check (
    new_status is null or new_status in ('open', 'in_progress', 'closed')
  ),
  previous_owner_membership_id uuid references public.workspace_members(id) on delete set null,
  new_owner_membership_id uuid references public.workspace_members(id) on delete set null,
  previous_priority text check (
    previous_priority is null or previous_priority in ('high', 'normal', 'low')
  ),
  new_priority text check (
    new_priority is null or new_priority in ('high', 'normal', 'low')
  ),
  note text check (note is null or char_length(note) <= 4000),
  created_at timestamptz not null default now(),
  constraint closing_loop_case_events_case_workspace_fkey
    foreign key (case_id, workspace_id)
    references public.closing_loop_cases(id, workspace_id)
    on delete cascade,
  constraint closing_loop_case_events_shape_check check (
    (event_type = 'case_created'
      and previous_status is null
      and new_status is not null)
    or (event_type = 'status_changed'
      and previous_status is not null
      and new_status is not null
      and previous_status <> new_status)
    or (event_type = 'owner_changed'
      and previous_owner_membership_id is distinct from new_owner_membership_id)
    or (event_type = 'priority_changed'
      and previous_priority is not null
      and new_priority is not null
      and previous_priority <> new_priority)
    or (event_type = 'note_added'
      and note is not null
      and char_length(btrim(note)) > 0)
  )
);

create index closing_loop_case_events_workspace_case_created_idx
  on public.closing_loop_case_events (workspace_id, case_id, created_at, id);

alter table public.closing_loop_cases enable row level security;
alter table public.closing_loop_case_events enable row level security;

revoke all on table public.closing_loop_cases from public, anon, authenticated;
revoke all on table public.closing_loop_case_events from public, anon, authenticated;
revoke all on table public.closing_loop_cases from service_role;
revoke all on table public.closing_loop_case_events from service_role;

grant select on table public.closing_loop_cases to service_role;
grant select on table public.closing_loop_case_events to service_role;

create or replace function public.create_workspace_closing_loop_case(
  p_workspace_id uuid,
  p_actor_user_id uuid,
  p_dataset_row_id uuid,
  p_owner_membership_id uuid default null,
  p_priority text default null
)
returns public.closing_loop_cases
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_actor_ids uuid[];
  v_actor_roles text[];
  v_actor_membership_id uuid;
  v_actor_role text;
  v_case public.closing_loop_cases;
  v_score numeric;
  v_priority text;
  v_constraint_name text;
begin
  select array_agg(wm.id), array_agg(wm.role)
    into v_actor_ids, v_actor_roles
  from public.workspace_members as wm
  inner join public.app_users as au on au.id = wm.user_id
  where wm.workspace_id = p_workspace_id
    and wm.user_id = p_actor_user_id
    and au.is_active = true;

  if coalesce(array_length(v_actor_ids, 1), 0) <> 1 then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN_MEMBERSHIP';
  end if;

  v_actor_membership_id := v_actor_ids[1];
  v_actor_role := v_actor_roles[1];

  if v_actor_role is null or v_actor_role not in ('owner', 'admin', 'member') then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN_ROLE';
  end if;

  if p_priority is not null and p_priority not in ('high', 'normal', 'low') then
    raise exception using errcode = 'P0001', message = 'INVALID_PRIORITY';
  end if;

  select dr.score
    into v_score
    from public.dataset_rows as dr
    inner join public.datasets as d on d.id = dr.dataset_id
    where dr.id = p_dataset_row_id
      and d.workspace_id = p_workspace_id
      and d.workspace_id is not null;

  if not found then
    raise exception using errcode = 'P0001', message = 'DATASET_ROW_NOT_FOUND';
  end if;

  v_priority := coalesce(
    p_priority,
    case
      when v_score between 0 and 6 then 'high'
      when v_score between 7 and 8 then 'normal'
      when v_score between 9 and 10 then 'low'
      else 'normal'
    end
  );

  if p_owner_membership_id is not null and not exists (
    select 1
    from public.workspace_members as owner_wm
    inner join public.app_users as owner_au on owner_au.id = owner_wm.user_id
    where owner_wm.id = p_owner_membership_id
      and owner_wm.workspace_id = p_workspace_id
      and owner_wm.role in ('owner', 'admin', 'member')
      and owner_au.is_active = true
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_OWNER';
  end if;

  if exists (
    select 1
    from public.closing_loop_cases as existing_case
    where existing_case.dataset_row_id = p_dataset_row_id
  ) then
    raise exception using errcode = 'P0001', message = 'CASE_ALREADY_EXISTS';
  end if;

  begin
    insert into public.closing_loop_cases (
      workspace_id,
      dataset_row_id,
      status,
      priority,
      owner_membership_id,
      created_by_membership_id,
      updated_by_membership_id
    ) values (
      p_workspace_id,
      p_dataset_row_id,
      'open',
      v_priority,
      p_owner_membership_id,
      v_actor_membership_id,
      v_actor_membership_id
    )
    returning * into v_case;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'closing_loop_cases_dataset_row_key' then
        raise exception using errcode = 'P0001', message = 'CASE_ALREADY_EXISTS';
      end if;

      raise;
  end;

  insert into public.closing_loop_case_events (
    workspace_id,
    case_id,
    event_type,
    actor_membership_id,
    new_status,
    new_owner_membership_id,
    new_priority
  ) values (
    p_workspace_id,
    v_case.id,
    'case_created',
    v_actor_membership_id,
    v_case.status,
    v_case.owner_membership_id,
    v_case.priority
  );

  return v_case;
end;
$function$;

create or replace function public.update_workspace_closing_loop_case(
  p_workspace_id uuid,
  p_actor_user_id uuid,
  p_case_id uuid,
  p_update_status boolean default false,
  p_status text default null,
  p_update_owner boolean default false,
  p_owner_membership_id uuid default null,
  p_update_priority boolean default false,
  p_priority text default null,
  p_note text default null
)
returns public.closing_loop_cases
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_actor_ids uuid[];
  v_actor_roles text[];
  v_actor_membership_id uuid;
  v_actor_role text;
  v_case public.closing_loop_cases;
  v_previous_status text;
  v_previous_owner_membership_id uuid;
  v_previous_priority text;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_changed boolean := false;
begin
  select array_agg(wm.id), array_agg(wm.role)
    into v_actor_ids, v_actor_roles
  from public.workspace_members as wm
  inner join public.app_users as au on au.id = wm.user_id
  where wm.workspace_id = p_workspace_id
    and wm.user_id = p_actor_user_id
    and au.is_active = true;

  if coalesce(array_length(v_actor_ids, 1), 0) <> 1 then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN_MEMBERSHIP';
  end if;

  v_actor_membership_id := v_actor_ids[1];
  v_actor_role := v_actor_roles[1];

  if v_actor_role is null or v_actor_role not in ('owner', 'admin', 'member') then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN_ROLE';
  end if;

  if not p_update_status and not p_update_owner and not p_update_priority and v_note is null then
    raise exception using errcode = 'P0001', message = 'EMPTY_UPDATE';
  end if;

  if p_update_status and (p_status is null or p_status not in ('open', 'in_progress', 'closed')) then
    raise exception using errcode = 'P0001', message = 'INVALID_STATUS';
  end if;

  if p_update_priority and (p_priority is null or p_priority not in ('high', 'normal', 'low')) then
    raise exception using errcode = 'P0001', message = 'INVALID_PRIORITY';
  end if;

  if p_update_owner and p_owner_membership_id is not null and not exists (
    select 1
    from public.workspace_members as owner_wm
    inner join public.app_users as owner_au on owner_au.id = owner_wm.user_id
    where owner_wm.id = p_owner_membership_id
      and owner_wm.workspace_id = p_workspace_id
      and owner_wm.role in ('owner', 'admin', 'member')
      and owner_au.is_active = true
  ) then
    raise exception using errcode = 'P0001', message = 'INVALID_OWNER';
  end if;

  if v_note is not null and char_length(v_note) > 4000 then
    raise exception using errcode = 'P0001', message = 'NOTE_TOO_LONG';
  end if;

  select *
    into v_case
  from public.closing_loop_cases as closing_case
  where closing_case.id = p_case_id
    and closing_case.workspace_id = p_workspace_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'CASE_NOT_FOUND';
  end if;

  v_previous_status := v_case.status;
  v_previous_owner_membership_id := v_case.owner_membership_id;
  v_previous_priority := v_case.priority;

  if p_update_status and p_status <> v_case.status then
    if p_status = 'closed' and v_note is null then
      raise exception using errcode = 'P0001', message = 'CLOSURE_NOTE_REQUIRED';
    end if;

    v_case.status := p_status;
    v_case.closed_at := case when p_status = 'closed' then now() else null end;
    v_changed := true;

    insert into public.closing_loop_case_events (
      workspace_id,
      case_id,
      event_type,
      actor_membership_id,
      previous_status,
      new_status,
      note
    ) values (
      p_workspace_id,
      v_case.id,
      'status_changed',
      v_actor_membership_id,
      v_previous_status,
      v_case.status,
      v_note
    );
  end if;

  if p_update_owner and p_owner_membership_id is distinct from v_case.owner_membership_id then
    v_case.owner_membership_id := p_owner_membership_id;
    v_changed := true;

    insert into public.closing_loop_case_events (
      workspace_id,
      case_id,
      event_type,
      actor_membership_id,
      previous_owner_membership_id,
      new_owner_membership_id
    ) values (
      p_workspace_id,
      v_case.id,
      'owner_changed',
      v_actor_membership_id,
      v_previous_owner_membership_id,
      v_case.owner_membership_id
    );
  end if;

  if p_update_priority and p_priority <> v_case.priority then
    v_case.priority := p_priority;
    v_changed := true;

    insert into public.closing_loop_case_events (
      workspace_id,
      case_id,
      event_type,
      actor_membership_id,
      previous_priority,
      new_priority
    ) values (
      p_workspace_id,
      v_case.id,
      'priority_changed',
      v_actor_membership_id,
      v_previous_priority,
      v_case.priority
    );
  end if;

  if v_note is not null and not (p_update_status and p_status <> v_previous_status) then
    insert into public.closing_loop_case_events (
      workspace_id,
      case_id,
      event_type,
      actor_membership_id,
      note
    ) values (
      p_workspace_id,
      v_case.id,
      'note_added',
      v_actor_membership_id,
      v_note
    );
    v_changed := true;
  end if;

  if not v_changed then
    raise exception using errcode = 'P0001', message = 'NO_CHANGES';
  end if;

  update public.closing_loop_cases
  set status = v_case.status,
      priority = v_case.priority,
      owner_membership_id = v_case.owner_membership_id,
      updated_by_membership_id = v_actor_membership_id,
      updated_at = now(),
      closed_at = v_case.closed_at
  where id = v_case.id
    and workspace_id = p_workspace_id
  returning * into v_case;

  return v_case;
end;
$function$;

create or replace function public.add_workspace_closing_loop_note(
  p_workspace_id uuid,
  p_actor_user_id uuid,
  p_case_id uuid,
  p_note text
)
returns public.closing_loop_case_events
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_actor_ids uuid[];
  v_actor_roles text[];
  v_actor_membership_id uuid;
  v_actor_role text;
  v_note text := nullif(btrim(coalesce(p_note, '')), '');
  v_event public.closing_loop_case_events;
  v_case_id uuid;
begin
  select array_agg(wm.id), array_agg(wm.role)
    into v_actor_ids, v_actor_roles
  from public.workspace_members as wm
  inner join public.app_users as au on au.id = wm.user_id
  where wm.workspace_id = p_workspace_id
    and wm.user_id = p_actor_user_id
    and au.is_active = true;

  if coalesce(array_length(v_actor_ids, 1), 0) <> 1 then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN_MEMBERSHIP';
  end if;

  v_actor_membership_id := v_actor_ids[1];
  v_actor_role := v_actor_roles[1];

  if v_actor_role is null or v_actor_role not in ('owner', 'admin', 'member') then
    raise exception using errcode = 'P0001', message = 'FORBIDDEN_ROLE';
  end if;

  if v_note is null then
    raise exception using errcode = 'P0001', message = 'NOTE_REQUIRED';
  end if;

  if char_length(v_note) > 4000 then
    raise exception using errcode = 'P0001', message = 'NOTE_TOO_LONG';
  end if;

  select closing_case.id
    into v_case_id
  from public.closing_loop_cases as closing_case
  where closing_case.id = p_case_id
    and closing_case.workspace_id = p_workspace_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'CASE_NOT_FOUND';
  end if;

  insert into public.closing_loop_case_events (
    workspace_id,
    case_id,
    event_type,
    actor_membership_id,
    note
  ) values (
    p_workspace_id,
    v_case_id,
    'note_added',
    v_actor_membership_id,
    v_note
  )
  returning * into v_event;

  update public.closing_loop_cases
  set updated_by_membership_id = v_actor_membership_id,
      updated_at = now()
  where id = v_case_id
    and workspace_id = p_workspace_id;

  return v_event;
end;
$function$;

revoke all on function public.create_workspace_closing_loop_case(uuid, uuid, uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.update_workspace_closing_loop_case(uuid, uuid, uuid, boolean, text, boolean, uuid, boolean, text, text)
  from public, anon, authenticated;
revoke all on function public.add_workspace_closing_loop_note(uuid, uuid, uuid, text)
  from public, anon, authenticated;

grant execute on function public.create_workspace_closing_loop_case(uuid, uuid, uuid, uuid, text)
  to service_role;
grant execute on function public.update_workspace_closing_loop_case(uuid, uuid, uuid, boolean, text, boolean, uuid, boolean, text, text)
  to service_role;
grant execute on function public.add_workspace_closing_loop_note(uuid, uuid, uuid, text)
  to service_role;

commit;
