import { TipoMoneda } from './models';

export interface TipoMonedaOpcion {
  valor: TipoMoneda;
  etiqueta: string;
}

/**
 * Las monedas que acepta y devuelve la API en propiedades.moneda.
 * El valor persistido no cambia por como se muestra al usuario.
 */
export const TIPOS_MONEDA: readonly TipoMonedaOpcion[] = [
  { valor: 'ARS', etiqueta: 'Pesos argentinos' },
  { valor: 'USD', etiqueta: 'Dólares estadounidenses' },
];

export function tipoMonedaLabel(moneda: TipoMoneda | null | undefined): string {
  if (!moneda) {
    return '';
  }

  return TIPOS_MONEDA.find((opcion) => opcion.valor === moneda)?.etiqueta ?? moneda;
}
