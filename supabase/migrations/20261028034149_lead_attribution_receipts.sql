-- Additive rollout: apply before deploying callers. Does not rewrite old contacts
-- or replace request_visit; old clients remain compatible and have unknown source.
create table public.lead_submissions (
  id uuid primary key,
  retry_hash text not null check (retry_hash ~ '^[a-f0-9]{64}$'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  contact_id uuid not null unique references public.contacts(id) on delete cascade,
  event_id uuid not null unique default gen_random_uuid(),
  lead_type text not null check (lead_type in ('contact','seller','visit')),
  acquisition jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.lead_submissions enable row level security;
revoke all on public.lead_submissions from public, anon, authenticated;
grant select (contact_id,event_id,lead_type,acquisition,created_at) on public.lead_submissions to authenticated;
create policy lead_submissions_team_read on public.lead_submissions
  for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid())));

-- Defense in depth for callers that bypass the Next server action. Only a closed
-- set of non-PII attribution fields can enter this table. No raw URL/query/hash.
create function public.clean_lead_touch(p_touch jsonb)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  v jsonb;
  k text;
  t text;
  at_time timestamptz;
  campaign_present boolean := coalesce(p_touch->'campaign_present' = 'true'::jsonb,false);
  rejected boolean := coalesce(p_touch->'campaign_rejected' = 'true'::jsonb,false);
  paid_click boolean := coalesce(p_touch->'paid_click_present' = 'true'::jsonb,false);
  social_click boolean := coalesce(p_touch->'social_click_present' = 'true'::jsonb,false);
  source text;
  medium text;
  channel text := 'unknown';
begin
  if jsonb_typeof(p_touch) <> 'object' then return null; end if;
  t := p_touch->>'landing_path';
  if t is null or length(t) > 240 or not (
    t in ('/','/contacto','/sobre-luz','/vende-tu-propiedad') or
    t ~ '^/propiedades(/[a-z0-9-]+){0,4}/?$'
  ) then return null; end if;
  begin at_time := (p_touch->>'observed_at')::timestamptz;
  exception when others then return null; end;
  if at_time is null or at_time > now() + interval '5 minutes' or at_time < now() - interval '24 hours' then return null; end if;
  v := jsonb_build_object('landing_path',t,'observed_at',at_time);
  foreach k in array array['utm_source','utm_medium','utm_campaign','utm_content','utm_term'] loop
    t := lower(trim(p_touch->>k));
    if t is not null then campaign_present := true; end if;
    if t is not null and not (t ~ '^[a-z][a-z0-9_-]{0,79}$' and t !~ '[0-9]{8,}|[a-f0-9]{24,}' and t !~ '^[a-z0-9]{24,}$' and t !~ '^[a-f0-9]{8}-[a-f0-9]{4}-') then t := null; rejected := true; end if;
    v := v || jsonb_build_object(k,t);
  end loop;
  t := lower(p_touch->>'referrer_host');
  if t is null or length(t) > 120 or t !~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$'
    or t ~ '^[0-9.]+$' or t ~ '(^|\.)luztorres\.com$' or t ~ '\.test$'
    or t = 'accounts.google.com' or t ~ '^(login|auth|checkout)\.' then t := null; end if;
  v := v || jsonb_build_object('referrer_host',t);
  source := coalesce(v->>'utm_source','');
  medium := replace(coalesce(v->>'utm_medium',''),'_','-');
  if not rejected then
    if medium in ('cpc','ppc','paid','paid-social','paid-search','sponsored','display') then
      channel := case
        when source ~ '^(google(\.com(\.mx)?)?|bing(\.com)?|duckduckgo(\.com)?|search\.yahoo\.com|search\.brave\.com)$' then 'paid_search'
        when source ~ '^((l\.|lm\.|m\.)?(facebook|instagram)\.com|facebook|instagram|linkedin(\.com)?|tiktok(\.com)?|x(\.com)?|t\.co|pinterest(\.com)?)$' then 'paid_social'
        else 'paid_other' end;
    elsif paid_click or social_click then channel := 'unknown';
    elsif medium = 'email' then channel := 'email';
    elsif medium = 'organic' and source ~ '^(google(\.com(\.mx)?)?|bing(\.com)?|duckduckgo(\.com)?|search\.yahoo\.com|search\.brave\.com)$' then channel := 'organic_search';
    elsif medium in ('social','organic-social') and source ~ '^((l\.|lm\.|m\.)?(facebook|instagram)\.com|facebook|instagram|linkedin(\.com)?|tiktok(\.com)?|x(\.com)?|t\.co|pinterest(\.com)?)$' then channel := 'organic_social';
    elsif source <> '' or medium <> '' or campaign_present then channel := 'unknown';
    elsif t ~ '^(google(\.com(\.mx)?)?|bing(\.com)?|duckduckgo(\.com)?|search\.yahoo\.com|search\.brave\.com)$' then channel := 'organic_search';
    elsif t ~ '^((l\.|lm\.|m\.)?(facebook|instagram)\.com|facebook|instagram|linkedin(\.com)?|tiktok(\.com)?|x(\.com)?|t\.co|pinterest(\.com)?)$' then channel := 'organic_social';
    elsif t is not null then channel := 'referral'; end if;
  end if;
  v := v || jsonb_build_object('channel',channel,'campaign_present',campaign_present,'campaign_rejected',rejected,'paid_click_present',paid_click,'social_click_present',social_click);
  return v;
end;
$$;
revoke all on function public.clean_lead_touch(jsonb) from public, anon, authenticated;

create function public.submit_web_lead(
  p_submission_id uuid, p_retry_hash text,
  p_payload jsonb, p_acquisition jsonb
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  receipt public.lead_submissions%rowtype;
  prop public.properties%rowtype;
  kind text := p_payload->>'lead_type';
  person text := trim(p_payload->>'full_name');
  phone text := trim(p_payload->>'phone');
  email text := nullif(trim(p_payload->>'email'),'');
  message text := nullif(trim(p_payload->>'message'),'');
  interest text := p_payload->>'interest';
  financing text := coalesce(p_payload->>'financing','por_definir');
  property_id uuid;
  lead_id uuid;
  event_id uuid := gen_random_uuid();
  first_touch jsonb;
  last_touch jsonb;
  acquisition jsonb;
  conversion_path text;
  preferred_date date;
  preferred_time time;
  starts timestamptz;
  payload_hash text;
begin
  if p_submission_id is null or p_retry_hash is null or p_retry_hash !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_payload) <> 'object' or octet_length(p_payload::text) > 12000
    or kind is null or kind not in ('contact','seller','visit')
    or person is null or length(person) not between 2 and 160
    or phone is null or length(phone) > 30 or regexp_replace(phone,'[^0-9]','','g') !~ '^[0-9]{10,15}$'
    or length(coalesce(email,'')) > 254 or length(coalesce(message,'')) > 6000
    or (email is not null and email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
    or (kind <> 'visit' and email is null)
    or exists (select 1 from jsonb_object_keys(p_payload) k where k not in ('lead_type','full_name','phone','email','message','interest','property_id','financing','preferred_date','preferred_time'))
  then return jsonb_build_object('ok',false); end if;

  -- Core PostgreSQL SHA-256, no pgcrypto dependency. Derived inside the trusted
  -- transaction from canonical JSONB; callers cannot keep a stale fingerprint.
  payload_hash := encode(sha256(convert_to(p_payload::text,'UTF8')),'hex');

  -- Serializes the same retry key across concurrent transactions. Both the
  -- secret token and payload fingerprint must match; never return another lead.
  perform pg_advisory_xact_lock(hashtextextended(p_submission_id::text,0));
  select * into receipt from public.lead_submissions where id = p_submission_id;
  if found then
    if receipt.retry_hash <> p_retry_hash or receipt.lead_type <> kind then
      return jsonb_build_object('ok',false);
    end if;
    if receipt.payload_hash <> payload_hash then return jsonb_build_object('ok',false,'reason','payload_changed'); end if;
    select c.interest, c.property_id into interest, property_id from public.contacts c where c.id = receipt.contact_id;
    return jsonb_build_object('ok',true,'created',false,'lead_id',receipt.contact_id,'event_id',receipt.event_id,'interest',interest,'property_id',property_id);
  end if;

  begin
    property_id := nullif(p_payload->>'property_id','')::uuid;
    preferred_date := nullif(p_payload->>'preferred_date','')::date;
    preferred_time := nullif(p_payload->>'preferred_time','')::time;
  exception when invalid_text_representation or invalid_datetime_format or datetime_field_overflow then
    return jsonb_build_object('ok',false);
  end;
  if kind = 'seller' then property_id := null; interest := 'venta'; end if;
  if kind = 'visit' or property_id is not null then
    select * into prop from public.properties p where p.id = property_id;
    if not found or prop.status in ('vendido','rentado') then return jsonb_build_object('ok',false); end if;
  end if;
  if kind = 'visit' then
    if phone !~ '^\+52[1-9][0-9]{9}$' then return jsonb_build_object('ok',false); end if;
    interest := case when prop.operation = 'renta' then 'renta' else 'compra' end;
    if (preferred_date is null) <> (preferred_time is null) then return jsonb_build_object('ok',false); end if;
    if preferred_date is not null and (preferred_date < (now() at time zone 'America/Mexico_City')::date or preferred_date > (now() at time zone 'America/Mexico_City')::date + 90) then return jsonb_build_object('ok',false); end if;
  elsif interest is null or interest not in ('compra','renta','venta','inversion') then
    return jsonb_build_object('ok',false);
  end if;
  if financing not in ('recursos_propios','credito_bancario','infonavit','fovissste','cofinanciamiento','por_definir','no_aplica') then financing := 'por_definir'; end if;

  if octet_length(p_acquisition::text) > 8000 then p_acquisition := null; end if;
  first_touch := public.clean_lead_touch(p_acquisition->'first_touch');
  last_touch := public.clean_lead_touch(p_acquisition->'last_touch');
  if first_touch is not null and last_touch is not null and (last_touch->>'observed_at')::timestamptz < (first_touch->>'observed_at')::timestamptz then last_touch := first_touch; end if;
  conversion_path := p_acquisition->>'conversion_path';
  if conversion_path is null or length(conversion_path) > 240 or not (conversion_path in ('/','/contacto','/sobre-luz','/vende-tu-propiedad') or conversion_path ~ '^/propiedades(/[a-z0-9-]+){0,4}/?$') then conversion_path := null; end if;
  acquisition := jsonb_build_object('version',1,'first_touch',first_touch,'last_touch',last_touch,'conversion_path',conversion_path,
    'source_basis',case when first_touch is null and last_touch is null then 'unknown' else 'browser_observed' end,
    'source_confidence',case when first_touch is null and last_touch is null then 'unknown' else 'low' end);

  insert into public.contacts (full_name,phone,email,source,stage,interest,financing,message,property_id)
    values (person,phone,email,'web','nuevo',interest,case when kind='visit' then financing end,message,property_id)
    returning id into lead_id;
  if kind = 'visit' then
    starts := case when preferred_date is not null then (preferred_date + preferred_time) at time zone 'America/Mexico_City' end;
    insert into public.appointments (title,type,contact_id,property_id,starts_at,ends_at,location,notes,status)
      values (case when starts is null then 'Contactar para agendar · ' else 'Solicitud de visita · ' end || prop.title,
        'visita',lead_id,property_id,starts,starts + interval '1 hour',
        concat_ws(', ',prop.direccion,prop.colonia,prop.municipio,prop.estado),
        case when starts is null then 'Contactar para agendar. Solicitud web sin fecha preferida.' else 'Solicitud web pendiente de confirmar disponibilidad.' end || E'\nFinanciamiento: ' || financing || case when message is not null then E'\nMensaje: ' || message else '' end,'solicitud');
  end if;
  insert into public.lead_submissions (id,retry_hash,payload_hash,contact_id,event_id,lead_type,acquisition)
    values (p_submission_id,p_retry_hash,payload_hash,lead_id,event_id,kind,acquisition);
  return jsonb_build_object('ok',true,'created',true,'lead_id',lead_id,'event_id',event_id,'interest',interest,'property_id',property_id);
end;
$$;
revoke all on function public.submit_web_lead(uuid,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.submit_web_lead(uuid,text,jsonb,jsonb) to anon, authenticated;

comment on table public.lead_submissions is 'Opaque action-to-contact receipt and browser-reported acquisition. No person matching or historical backfill. Read only for team profiles.';
comment on function public.submit_web_lead(uuid,text,jsonb,jsonb) is 'Bounded anonymous intake only; atomic contact/appointment/receipt; retries require secret and DB-derived payload fingerprint. Returns IDs/enums, never contact PII.';
