import {
  Armchair,
  Bath,
  Bike,
  Building2,
  Car,
  ChefHat,
  Dog,
  Droplets,
  Dumbbell,
  Fence,
  Flame,
  Flower2,
  Gamepad2,
  Landmark,
  Lock,
  MoveVertical,
  PartyPopper,
  Shield,
  Shirt,
  Sofa,
  Sparkles,
  Sun,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  Warehouse,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
} from "lucide-react";

/**
 * Empareja el texto libre de una amenidad con un icono representativo.
 * Las claves se comparan en minúsculas y sin acentos; la primera
 * coincidencia gana, y `Sparkles` es el comodín por defecto.
 */
const MATCHERS: [RegExp, LucideIcon][] = [
  [/alberca|piscina|pool/, Waves],
  [/gimnasio|gym|fitness/, Dumbbell],
  [/jardin|areas? verdes?|parque/, Trees],
  [/roof|terraza|balcon|asador/, Sun],
  [/seguridad|vigilancia|caseta|acceso controlado/, Shield],
  [/elevador|ascensor/, MoveVertical],
  [/cocina/, ChefHat],
  [/comedor|grill|snack/, UtensilsCrossed],
  [/estacionamiento|cochera|garage|garaje|visitas/, Car],
  [/bodega|almacen/, Warehouse],
  [/lavado|lavanderia|lavadora/, Shirt],
  [/amueblado|muebles/, Sofa],
  [/aire acondicionado|clima|a\/c/, Wind],
  [/calentador|caldera|boiler|calefaccion|chimenea/, Flame],
  [/pet|mascota/, Dog],
  [/wifi|internet|fibra/, Wifi],
  [/tv|cable|pantalla/, Tv],
  [/juegos infantiles|ludoteca|juegos/, Gamepad2],
  [/salon|eventos|fiestas|usos multiples/, PartyPopper],
  [/casa club|club/, Users],
  [/cisterna|agua|hidroneumatico/, Droplets],
  [/bici|ciclo/, Bike],
  [/cuarto de servicio|servicio/, Armchair],
  [/bano|vestidor|jacuzzi|vapor|sauna/, Bath],
  [/barda|cerca|privada|fraccionamiento/, Fence],
  [/plusvalia|inversion/, Landmark],
  [/porton|electrico|automatico/, Lock],
  [/panel|solar/, Sun],
  [/flor|huerto/, Flower2],
  [/torre|edificio|lobby/, Building2],
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function amenityIcon(amenity: string): LucideIcon {
  const clean = normalize(amenity);
  for (const [pattern, icon] of MATCHERS) {
    if (pattern.test(clean)) return icon;
  }
  return Sparkles;
}
