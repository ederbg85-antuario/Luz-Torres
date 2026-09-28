-- Solicitudes de visita sin fecha: el prospecto pide que lo contacten
-- para agendar. El correo y la fecha dejan de ser obligatorios.
-- Las citas que ya tienen fecha no se modifican.

alter table public.appointments
  alter column starts_at drop not null;

-- Las solicitudes sin horario no ocupan un espacio de la agenda.
create or replace function public.get_taken_slots(p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select a.starts_at, coalesce(a.ends_at, a.starts_at + interval '1 hour')
  from appointments a
  where a.status = 'programada'
    and a.starts_at is not null
    and a.starts_at < p_to
    and coalesce(a.ends_at, a.starts_at + interval '1 hour') > p_from;
$$;

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
  v_email      text := nullif(trim(coalesce(p_email, '')), '');
  v_digits     text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_national   text;
  v_phone      text;
  v_has_date   boolean := p_preferred_date is not null or p_preferred_time is not null;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    return jsonb_build_object('ok', false, 'error', 'Falta tu nombre completo.');
  end if;

  if length(v_digits) = 10 then
    v_national := v_digits;
  elsif length(v_digits) = 12 and left(v_digits, 2) = '52' then
    v_national := substring(v_digits from 3);
  elsif length(v_digits) = 13 and left(v_digits, 3) = '521' then
    v_national := substring(v_digits from 4);
  else
    v_national := '';
  end if;

  if v_national !~ '^[1-9][0-9]{9}$' then
    return jsonb_build_object(
      'ok', false,
      'error', 'Escribe un WhatsApp de México de 10 dígitos. Puedes incluir +52.'
    );
  end if;
  v_phone := '+52' || v_national;

  if v_email is not null and v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return jsonb_build_object('ok', false, 'error', 'Escribe un correo electrónico válido.');
  end if;

  -- Quien envía fecha debe enviar también el horario, y al revés.
  -- Sin ninguno de los dos, la solicitud queda como "contactar para agendar".
  if (p_preferred_date is null) <> (p_preferred_time is null) then
    return jsonb_build_object('ok', false, 'error', 'Si indicas una preferencia, necesito fecha y horario.');
  end if;
  if v_has_date and (
    p_preferred_date < (now() at time zone 'America/Mexico_City')::date
    or p_preferred_date > ((now() at time zone 'America/Mexico_City')::date + 90)
  ) then
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
    v_phone,
    v_email,
    'web',
    'nuevo',
    case when v_prop.operation = 'renta' then 'renta' else 'compra' end,
    v_financing,
    nullif(trim(coalesce(p_message, '')), ''),
    p_property_id
  )
  returning id into v_contact_id;

  if v_has_date then
    v_starts := (p_preferred_date + p_preferred_time) at time zone 'America/Mexico_City';
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
  else
    insert into appointments (title, type, contact_id, property_id, starts_at, ends_at, location, notes, status)
    values (
      'Contactar para agendar · ' || v_prop.title,
      'visita',
      v_contact_id,
      p_property_id,
      null,
      null,
      concat_ws(', ', v_prop.direccion, v_prop.colonia, v_prop.municipio, v_prop.estado),
      'Contactar para agendar. Solicitud recibida desde el sitio web, sin fecha preferida.' || E'\n' ||
        'Financiamiento: ' || v_fin_label ||
        case when trim(coalesce(p_message, '')) <> '' then E'\nMensaje: ' || trim(p_message) else '' end,
      'solicitud'
    );
  end if;

  return jsonb_build_object('ok', true);
end;
$$;
