-- Las visitas del sitio son solicitudes: el equipo confirma disponibilidad
-- antes de considerarlas citas programadas.

alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('solicitud', 'programada', 'completada', 'cancelada'));

create index if not exists appointments_status_starts_idx
  on public.appointments(status, starts_at);

create or replace function public.request_visit(
  p_property_id    uuid,
  p_preferred_date date,
  p_preferred_time time,
  p_full_name      text,
  p_phone          text,
  p_email          text,
  p_financing      text default 'por_definir',
  p_message        text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prop       properties%rowtype;
  v_contact_id uuid;
  v_starts     timestamptz;
  v_financing  text := p_financing;
  v_fin_label  text;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    return jsonb_build_object('ok', false, 'error', 'Falta tu nombre completo.');
  end if;
  if coalesce(trim(p_phone), '') = '' or coalesce(trim(p_email), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'Necesito teléfono y correo para confirmar disponibilidad.');
  end if;
  if p_preferred_date is null or p_preferred_time is null then
    return jsonb_build_object('ok', false, 'error', 'Indica fecha y horario preferidos.');
  end if;
  if p_preferred_date < (now() at time zone 'America/Mexico_City')::date
     or p_preferred_date > ((now() at time zone 'America/Mexico_City')::date + 90) then
    return jsonb_build_object('ok', false, 'error', 'Elige una fecha dentro de los próximos 90 días.');
  end if;

  if v_financing is null or v_financing not in
     ('recursos_propios','credito_bancario','infonavit','fovissste','cofinanciamiento','por_definir','no_aplica') then
    v_financing := 'por_definir';
  end if;

  select * into v_prop from properties where id = p_property_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Esta propiedad ya no está publicada.');
  end if;
  if v_prop.status in ('vendido', 'rentado') then
    return jsonb_build_object('ok', false, 'error', 'Esta propiedad ya no está disponible para visitas.');
  end if;

  v_starts := (p_preferred_date + p_preferred_time) at time zone 'America/Mexico_City';
  v_fin_label := case v_financing
    when 'recursos_propios' then 'Recursos propios'
    when 'credito_bancario' then 'Crédito bancario'
    when 'infonavit' then 'Crédito Infonavit'
    when 'fovissste' then 'Crédito FOVISSSTE'
    when 'cofinanciamiento' then 'Cofinanciamiento'
    when 'no_aplica' then 'No aplica (renta)'
    else 'Aún por definir'
  end;

  insert into contacts (full_name, phone, email, source, stage, interest, financing, message, property_id)
  values (
    trim(p_full_name),
    trim(p_phone),
    trim(p_email),
    'web',
    'nuevo',
    case when v_prop.operation = 'renta' then 'renta' else 'compra' end,
    v_financing,
    nullif(trim(coalesce(p_message, '')), ''),
    p_property_id
  )
  returning id into v_contact_id;

  insert into appointments (title, type, contact_id, property_id, starts_at, ends_at, location, notes, status)
  values (
    'Solicitud de visita · ' || v_prop.title,
    'visita',
    v_contact_id,
    p_property_id,
    v_starts,
    v_starts + interval '1 hour',
    concat_ws(', ', v_prop.direccion, v_prop.colonia, v_prop.municipio, v_prop.estado),
    'Solicitud recibida desde el sitio web. Pendiente de confirmar disponibilidad.' || E'\n' ||
      'Fecha solicitada: ' || to_char(p_preferred_date, 'DD/MM/YYYY') || ' ' || to_char(p_preferred_time, 'HH24:MI') || E'\n' ||
      'Financiamiento: ' || v_fin_label ||
      case when trim(coalesce(p_message, '')) <> '' then E'\nMensaje: ' || trim(p_message) else '' end,
    'solicitud'
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.request_visit(uuid, date, time, text, text, text, text, text) from public;
grant execute on function public.request_visit(uuid, date, time, text, text, text, text, text) to anon, authenticated;

-- La función anterior ya no se ofrece a visitantes: no queremos reservas
-- confirmadas automáticamente desde una llamada directa al RPC.
revoke all on function public.book_visit(uuid, timestamptz, text, text, text, text, text) from anon, authenticated;
