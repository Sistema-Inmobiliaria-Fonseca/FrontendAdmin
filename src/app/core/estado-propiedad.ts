import { EstadoPropiedad } from './models';

export interface EstadoPropiedadOpcion {
  valor: EstadoPropiedad;
  etiqueta: string;
  badge: string;
}

/**
 * Los valores 'disponible' y 'alquilada' son los que acepta y devuelve la API.
 * 'alquilada' se muestra al usuario como "Ocupada": el texto visible no altera el valor persistido.
 */
export const ESTADOS_PROPIEDAD: readonly EstadoPropiedadOpcion[] = [
  { valor: 'disponible', etiqueta: 'Disponible', badge: 'badge--success' },
  { valor: 'alquilada', etiqueta: 'Ocupada', badge: 'badge--info' },
];

export function opcionEstado(estado: EstadoPropiedad): EstadoPropiedadOpcion | undefined {
  return ESTADOS_PROPIEDAD.find((opcion) => opcion.valor === estado);
}

export function estadoLabel(estado: EstadoPropiedad): string {
  return opcionEstado(estado)?.etiqueta ?? estado;
}

export function estadoBadge(estado: EstadoPropiedad): string {
  return opcionEstado(estado)?.badge ?? '';
}