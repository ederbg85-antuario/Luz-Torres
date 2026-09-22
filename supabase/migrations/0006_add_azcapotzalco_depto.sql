-- Alta: Departamento San Marcos, Azcapotzalco (Tokko 10341317)
-- Fotos en el bucket property-images, carpeta del slug (00.jpg portada, 01–11.jpg).
-- Coordenadas: Pasaje Ferrería, Antigua Calzada de Guadalupe 251,
-- Barrio San Marcos (pin público 19.489387, -99.179687), a un costado
-- del inmueble y a unos minutos del Metro Ferrería.
insert into public.properties
  (slug, title, description, operation, property_type, status, price, currency,
   estado, municipio, colonia, direccion, bedrooms, bathrooms, parking, area_m2, lot_m2,
   amenities, cover_image, images, featured, lat, lng)
values
  ('departamento-venta-san-marcos-azcapotzalco-iap10341317',
   'Departamento en venta en San Marcos, Azcapotzalco',
   'Departamento amueblado en planta baja en San Marcos, Azcapotzalco. Superficie construida de 54 m². 2 recámaras, 2 baños, 1 lugar de estacionamiento. Cuenta con cocina integral, vigilancia 24/7, gas natural, área verde comunal y lobby. A un costado de Pasaje Ferrería; a 3 minutos del Metro Ferrería y Suburbano Fortuna. Mantenimiento $760 pesos mensuales. Se acepta Infonavit y crédito bancario (no FOVISSSTE). Ficha técnica completa disponible; agenda una visita y te acompaño en todo el proceso, desde la revisión legal hasta la firma.',
   'venta', 'departamento', 'disponible', 2250000.0, 'MXN',
   'Ciudad de México', 'Azcapotzalco', 'San Marcos', null,
   2, 2, 1, 54, 54,
   '{"Amueblado","Cocina","Jardín","Cancelería de aluminio","Seguridad Privada","Depósito de Agua","Ubicación tranquila","Armarios Empotrados","Persianas","Ventanas de aluminio","Calentador","Estacionamiento fijo","Seguridad 24Hs","Condominio","Gas Natural","Cocina propia","Luminoso"}',
   'https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/00.jpg',
   '{"https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/01.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/02.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/03.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/04.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/05.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/06.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/07.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/08.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/09.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/10.jpg","https://acrzgrbovizhqcnpmpdn.supabase.co/storage/v1/object/public/property-images/departamento-venta-san-marcos-azcapotzalco-iap10341317/11.jpg"}',
   true, 19.489387, -99.179687)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  operation = excluded.operation,
  property_type = excluded.property_type,
  status = excluded.status,
  price = excluded.price,
  currency = excluded.currency,
  estado = excluded.estado,
  municipio = excluded.municipio,
  colonia = excluded.colonia,
  direccion = excluded.direccion,
  bedrooms = excluded.bedrooms,
  bathrooms = excluded.bathrooms,
  parking = excluded.parking,
  area_m2 = excluded.area_m2,
  lot_m2 = excluded.lot_m2,
  amenities = excluded.amenities,
  cover_image = excluded.cover_image,
  images = excluded.images,
  featured = excluded.featured,
  lat = excluded.lat,
  lng = excluded.lng,
  updated_at = now();
