export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: number | boolean;
  created_at: string;
  updated_at: string;
  propiedades_count?: number;
  propiedades_ids?: number[];
}

export interface CategoriaResumen {
  id: number;
  nombre: string;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface Pais {
  id: number;
  nombre: string;
  codigo_iso: string;
  activo: boolean;
  provincias_count: number;
  localidades_count: number;
}

export interface Provincia {
  id: number;
  pais_id: number;
  nombre: string;
  codigo: string | null;
  activo: boolean;
  pais_nombre: string;
  pais_codigo_iso: string;
  localidades_count: number;
}

export interface Localidad {
  id: number;
  provincia_id: number;
  nombre: string;
  activo: boolean;
  provincia_nombre: string;
  provincia_codigo: string | null;
  pais_id: number;
  pais_nombre: string;
  pais_codigo_iso: string;
}

export interface Ubicacion {
  localidad: { id: number; nombre: string };
  provincia: { id: number; nombre: string };
  pais: { id: number; nombre: string; codigo_iso: string };
}

export type EstadoPropiedad = 'disponible' | 'alquilada';

export interface Propiedad {
  id: number;
  nombre: string;
  localidad_id: number | null;
  metros_cuadrados: number | null;
  valor: number | null;
  cantidad_habitaciones: number;
  cantidad_ambientes: number;
  descripcion: string | null;
  apto_credito: boolean;
  estado: EstadoPropiedad;
  created_at: string;
  updated_at: string;
  ubicacion: Ubicacion | null;
  categorias: CategoriaResumen[];
  imagenes?: PropiedadImagen[];
}

export interface PropiedadInput {
  nombre: string;
  localidad_id?: number | null;
  metros_cuadrados?: number | null;
  valor?: number | null;
  cantidad_habitaciones?: number | null;
  cantidad_ambientes?: number | null;
  descripcion?: string | null;
  apto_credito?: boolean;
  estado?: EstadoPropiedad;
  categorias?: number[];
}
export interface PropiedadImagen {
  id: number;
  nombre: string;
  nombre_archivo?: string;
  nombre_original: string;
  mime_type: string;
  tamano: number;
  orden: number;
  url?: string;
  created_at: string;
}

