-- ════════════════════════════════════════════════════════════════
--  Luz Torres · Datos de ejemplo (provisionales)
--  Ejecutar después de 0001_schema.sql.
--  Reemplazar por contenido real más adelante.
-- ════════════════════════════════════════════════════════════════

-- ─── PROPIEDADES ────────────────────────────────────────────────
insert into public.properties
  (slug, title, description, operation, property_type, status, price, estado, municipio, colonia, direccion,
   bedrooms, bathrooms, parking, area_m2, lot_m2, amenities, featured)
values
('departamento-venta-del-valle-cdmx',
 'Departamento en venta en Del Valle, Benito Juárez',
 'Departamento de 78 m² en Del Valle Centro, una de las colonias mejor conectadas de la Ciudad de México. Dos recámaras, mucha luz natural y un edificio con mantenimiento al día. Aplica para crédito Infonavit, FOVISSSTE y bancario.',
 'venta','departamento','disponible',5250000,'Ciudad de México','Benito Juárez','Del Valle Centro','Av. Coyoacán',
 2,2,1,78,null,'{"Cocina integral","Elevador","Seguridad 24h","Área de lavado"}',true),

('departamento-renta-roma-norte-cdmx',
 'Departamento en renta en Roma Norte, Cuauhtémoc',
 'Departamento de 65 m² en Roma Norte, a pasos de parques, cafés y transporte. Una recámara amplia, acabados cuidados y contrato bien redactado con depósito en garantía.',
 'renta','departamento','disponible',28000,'Ciudad de México','Cuauhtémoc','Roma Norte','Calle Tonalá',
 1,1,1,65,null,'{"Amueblado","Roof garden","Pet friendly","Internet incluido"}',true),

('oficina-renta-polanco-cdmx',
 'Oficina en renta en Polanco, Miguel Hidalgo',
 'Oficina de 120 m² en Polanco IV Sección, lista para operar. Espacio diáfano, dos baños y tres cajones de estacionamiento. Edificio corporativo con recepción y seguridad.',
 'renta','oficina','disponible',45000,'Ciudad de México','Miguel Hidalgo','Polanco IV Sección','Av. Presidente Masaryk',
 0,2,3,120,null,'{"Aire acondicionado","Recepción","Seguridad 24h","Estacionamiento de visitas"}',false),

('casa-venta-interlomas-huixquilucan-edomex',
 'Casa en venta en Interlomas, Huixquilucan',
 'Casa residencial de 320 m² de construcción en Interlomas. Cuatro recámaras, jardín privado y doble altura en sala. Fraccionamiento con vigilancia y áreas verdes.',
 'venta','casa','disponible',9800000,'Estado de México','Huixquilucan','Interlomas','Av. Jesús del Monte',
 4,3.5,2,320,280,'{"Jardín","Cuarto de servicio","Seguridad 24h","Doble altura"}',true),

('casa-renta-lomas-verdes-naucalpan-edomex',
 'Casa en renta en Lomas Verdes, Naucalpan',
 'Casa de 180 m² en Lomas Verdes, ideal para familia. Tres recámaras, estudio y patio de servicio. Zona tranquila con escuelas y comercios cerca.',
 'renta','casa','disponible',24000,'Estado de México','Naucalpan de Juárez','Lomas Verdes','Blvd. Lomas Verdes',
 3,2.5,2,180,200,'{"Estudio","Patio","Calentador solar"}',false),

('casa-venta-zapopan-jalisco',
 'Casa en venta en Valle Real, Zapopan',
 'Casa de 240 m² en Valle Real, Zapopan. Tres recámaras con vestidor, cocina abierta y terraza. Uno de los desarrollos residenciales más consolidados de la zona metropolitana de Guadalajara.',
 'venta','casa','disponible',6400000,'Jalisco','Zapopan','Valle Real','Av. Universidad',
 3,3,2,240,260,'{"Terraza","Cocina abierta","Seguridad 24h","Casa club"}',true),

('departamento-venta-san-pedro-nuevo-leon',
 'Departamento en venta en San Pedro Garza García',
 'Departamento de 110 m² en San Pedro Garza García, el municipio con mayor plusvalía de Nuevo León. Dos recámaras, amenidades completas y vista a la sierra.',
 'venta','departamento','disponible',7900000,'Nuevo León','San Pedro Garza García','Del Valle','Calz. del Valle',
 2,2,2,110,null,'{"Gimnasio","Alberca","Seguridad 24h","Vista panorámica"}',true),

('casa-venta-juriquilla-queretaro',
 'Casa en venta en Juriquilla, Querétaro',
 'Casa de 210 m² en Juriquilla, una de las zonas de mayor crecimiento de Querétaro. Tres recámaras, jardín y acabados nuevos. Excelente opción para vivir o invertir.',
 'venta','casa','disponible',5600000,'Querétaro','Querétaro','Juriquilla','Anillo Vial Fray Junípero Serra',
 3,2.5,2,210,240,'{"Jardín","Cuarto de TV","Seguridad 24h"}',false),

('departamento-venta-playa-del-carmen-quintana-roo',
 'Departamento en venta en Playa del Carmen — ideal inversión',
 'Departamento de 85 m² a pocos minutos de la Quinta Avenida. Dos recámaras y amenidades de hotel; un activo con buen rendimiento para renta vacacional.',
 'venta','departamento','disponible',4300000,'Quintana Roo','Solidaridad','Centro','Av. 10 Norte',
 2,2,1,85,null,'{"Alberca","Rooftop","Lock-off","Administración de rentas"}',true),

('casa-venta-merida-yucatan',
 'Casa en venta en Temozón Norte, Mérida',
 'Casa de 260 m² en Temozón Norte, la zona residencial de mayor plusvalía de Mérida. Tres recámaras, piscina y diseño contemporáneo con buena ventilación.',
 'venta','casa','disponible',4950000,'Yucatán','Mérida','Temozón Norte','Calle 1',
 3,3,2,260,300,'{"Piscina","Cuarto de servicio","Domótica","Seguridad 24h"}',false),

('bodega-renta-puebla',
 'Bodega industrial en renta en Puebla',
 'Bodega de 600 m² en parque industrial de Puebla, con andén de carga y altura libre de 9 metros. Lista para operación logística o de manufactura ligera.',
 'renta','bodega','disponible',58000,'Puebla','Puebla','Parque Industrial 5 de Mayo','Vía Corta a Santa Ana',
 0,1,4,600,null,'{"Andén de carga","Altura 9 m","Oficina interior","Vigilancia"}',false),

('local-comercial-renta-guadalajara-jalisco',
 'Local comercial en renta en Guadalajara Centro',
 'Local comercial de 90 m² sobre avenida con alto flujo peatonal en el Centro de Guadalajara. Planta libre y baño, ideal para retail o servicios.',
 'renta','local','disponible',32000,'Jalisco','Guadalajara','Centro','Av. Juárez',
 0,1,0,90,null,'{"Planta libre","Cortina automática","Alto flujo peatonal"}',false),

('terreno-venta-valle-de-bravo-edomex',
 'Terreno en venta en Valle de Bravo',
 'Terreno de 1,200 m² con vista al bosque en Valle de Bravo. Uso de suelo residencial, ideal para una casa de descanso. Servicios disponibles en la zona.',
 'venta','terreno','disponible',3200000,'Estado de México','Valle de Bravo','Avándaro','Camino a Avándaro',
 0,0,0,0,1200,'{"Vista al bosque","Uso residencial","Servicios en zona"}',false),

('casa-narvarte-cdmx',
 'Casa en Narvarte Poniente, Benito Juárez',
 'Casa de 68 m² en Narvarte Poniente. Operación cerrada — referencia de la zona y del tipo de propiedad que acompaño.',
 'venta','casa','vendido',3950000,'Ciudad de México','Benito Juárez','Narvarte Poniente','Calle Anaxágoras',
 2,1,1,68,90,'{"Patio","Cerca de transporte"}',false);

-- ─── CONTACTOS (CRM) ────────────────────────────────────────────
insert into public.contacts
  (full_name, email, phone, source, stage, interest, budget_min, budget_max, notes, message, property_id, last_contacted_at)
values
('Mariana Gómez','mariana.gomez@example.com','55 1234 5678','web','nuevo','compra',4000000,5500000,
 'Busca primera vivienda. Tiene Infonavit precalificado.',
 'Me interesa el departamento de Del Valle, ¿sigue disponible?',
 (select id from public.properties where slug='departamento-venta-del-valle-cdmx'), now() - interval '1 day'),

('Carlos Téllez','carlos.tellez@example.com','55 2345 6789','instagram','contactado','inversion',6000000,9000000,
 'Inversionista, busca departamento para renta. Pidió comparativo de rendimiento.', null,
 (select id from public.properties where slug='departamento-venta-playa-del-carmen-quintana-roo'), now() - interval '3 days'),

('Laura Hernández','laura.hernandez@example.com','55 3456 7890','referido','calificado','compra',8000000,11000000,
 'Familia que se muda. Visitó Interlomas, le gustó. Pendiente segunda visita.', null,
 (select id from public.properties where slug='casa-venta-interlomas-huixquilucan-edomex'), now() - interval '2 days'),

('Roberto Salinas','roberto.salinas@example.com','81 4567 8901','portal','propuesta','compra',7000000,8500000,
 'Recibió propuesta del departamento en San Pedro. Revisando crédito bancario.', null,
 (select id from public.properties where slug='departamento-venta-san-pedro-nuevo-leon'), now() - interval '1 day'),

('Diana Ruiz','diana.ruiz@example.com','55 5678 9012','whatsapp','negociacion','renta',20000,30000,
 'Negociando contrato de renta de la casa en Lomas Verdes. Acordando fecha de entrada.', null,
 (select id from public.properties where slug='casa-renta-lomas-verdes-naucalpan-edomex'), now() - interval '6 hours'),

('Jorge Mendoza','jorge.mendoza@example.com','33 6789 0123','llamada','cerrado','compra',5500000,6800000,
 'Operación cerrada en Zapopan. Firma programada.', null,
 (select id from public.properties where slug='casa-venta-zapopan-jalisco'), now() - interval '5 days'),

('Andrea Vega','andrea.vega@example.com','55 7890 1234','web','perdido','renta',15000,22000,
 'Buscaba renta económica fuera de cobertura de presupuesto. Sin seguimiento.', null,
 null, now() - interval '20 days');

-- ─── CITAS (Agenda) ─────────────────────────────────────────────
insert into public.appointments (title, type, contact_id, property_id, starts_at, ends_at, location, notes, status)
values
('Visita · Departamento Del Valle','visita',
 (select id from public.contacts where email='mariana.gomez@example.com'),
 (select id from public.properties where slug='departamento-venta-del-valle-cdmx'),
 now() + interval '2 days' + interval '11 hours', now() + interval '2 days' + interval '12 hours',
 'Av. Coyoacán, Del Valle Centro','Llevar ficha técnica impresa.','programada'),

('Llamada · Comparativo de inversión','llamada',
 (select id from public.contacts where email='carlos.tellez@example.com'),
 null, now() + interval '1 day' + interval '17 hours', now() + interval '1 day' + interval '17 hours' + interval '30 minutes',
 'Telefónica','Enviar comparativo de rendimiento antes de la llamada.','programada'),

('Segunda visita · Casa Interlomas','visita',
 (select id from public.contacts where email='laura.hernandez@example.com'),
 (select id from public.properties where slug='casa-venta-interlomas-huixquilucan-edomex'),
 now() + interval '4 days' + interval '13 hours', now() + interval '4 days' + interval '14 hours',
 'Av. Jesús del Monte, Interlomas',null,'programada'),

('Firma · Casa Zapopan','firma',
 (select id from public.contacts where email='jorge.mendoza@example.com'),
 (select id from public.properties where slug='casa-venta-zapopan-jalisco'),
 now() + interval '6 days' + interval '10 hours', now() + interval '6 days' + interval '12 hours',
 'Notaría 12, Guadalajara','Confirmar documentos con notaría un día antes.','programada'),

('Avalúo · Departamento San Pedro','avaluo',
 (select id from public.contacts where email='roberto.salinas@example.com'),
 (select id from public.properties where slug='departamento-venta-san-pedro-nuevo-leon'),
 now() - interval '3 days' + interval '9 hours', now() - interval '3 days' + interval '11 hours',
 'Calz. del Valle, San Pedro','Avalúo coordinado con el banco.','completada');

-- ─── TAREAS (Tablero) ───────────────────────────────────────────
insert into public.tasks (title, description, status, priority, due_date, contact_id, position)
values
('Subir fotos profesionales de la casa en Mérida','Coordinar sesión y publicar en el portal.','pendiente','media',current_date + 5,null,0),
('Redactar contrato de renta · Lomas Verdes','Borrador para revisión de Diana Ruiz.','pendiente','alta',current_date + 2,
 (select id from public.contacts where email='diana.ruiz@example.com'),1),
('Solicitar precalificación Infonavit','Apoyar a Mariana con la documentación.','en_progreso','alta',current_date + 3,
 (select id from public.contacts where email='mariana.gomez@example.com'),0),
('Comparativo de inversión · Playa del Carmen','Rendimiento estimado de renta vacacional para Carlos.','en_progreso','media',current_date + 1,
 (select id from public.contacts where email='carlos.tellez@example.com'),1),
('Revisar documentos de firma · Zapopan','Verificar escrituras y libertad de gravamen.','en_revision','alta',current_date + 4,
 (select id from public.contacts where email='jorge.mendoza@example.com'),0),
('Publicar oficina de Polanco en redes','Pieza para Instagram con la ficha técnica.','en_revision','baja',current_date + 6,null,1),
('Cierre de avalúo · San Pedro','Avalúo recibido y enviado al banco.','completada','media',current_date - 2,
 (select id from public.contacts where email='roberto.salinas@example.com'),0);

-- ─── MARKETING · integraciones ──────────────────────────────────
insert into public.marketing_integrations (provider, status, account_label)
values
('instagram','desconectado','@luztorres.inmuebles'),
('facebook','desconectado','Luz Torres Inmobiliaria'),
('meta_ads','desconectado','Meta Ads Manager'),
('google_analytics','desconectado','luztorres.com'),
('search_console','desconectado','luztorres.com'),
('google_ads','desconectado','Google Ads')
on conflict (provider) do nothing;

-- ─── MARKETING · métricas de ejemplo ────────────────────────────
insert into public.marketing_metrics (provider, metric, value, recorded_date) values
('instagram','seguidores',4820,current_date),        ('instagram','seguidores',4510,current_date - 30),
('instagram','alcance',18400,current_date),          ('instagram','alcance',15900,current_date - 30),
('instagram','interacciones',1260,current_date),     ('instagram','interacciones',1080,current_date - 30),
('facebook','seguidores',2310,current_date),         ('facebook','seguidores',2240,current_date - 30),
('facebook','alcance',9700,current_date),            ('facebook','alcance',10200,current_date - 30),
('meta_ads','inversion',12500,current_date),         ('meta_ads','inversion',9800,current_date - 30),
('meta_ads','clics',3140,current_date),              ('meta_ads','clics',2510,current_date - 30),
('meta_ads','leads',46,current_date),                ('meta_ads','leads',33,current_date - 30),
('google_analytics','usuarios',5240,current_date),   ('google_analytics','usuarios',4310,current_date - 30),
('google_analytics','sesiones',7180,current_date),   ('google_analytics','sesiones',6020,current_date - 30),
('search_console','clics',1180,current_date),        ('search_console','clics',870,current_date - 30),
('search_console','impresiones',42300,current_date), ('search_console','impresiones',35600,current_date - 30),
('google_ads','inversion',8600,current_date),        ('google_ads','inversion',7400,current_date - 30),
('google_ads','clics',1920,current_date),            ('google_ads','clics',1650,current_date - 30),
('google_ads','conversiones',38,current_date),       ('google_ads','conversiones',29,current_date - 30);
