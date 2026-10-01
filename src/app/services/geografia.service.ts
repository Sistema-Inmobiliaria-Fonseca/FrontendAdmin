import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Localidad, Pais, Provincia } from '../core/models';
import { ApiService } from './api.service';

/**
 * Catálogo geográfico (País -> Provincia -> Localidad). Es de solo lectura:
 * el backend lo carga con seeds y no expone endpoints de escritura.
 */
@Injectable({ providedIn: 'root' })
export class GeografiaService {
  private readonly api = inject(ApiService);

  paises(): Observable<Pais[]> {
    return this.api.get<Pais[]>('/api/paises');
  }

  provincias(paisId?: number | null): Observable<Provincia[]> {
    return this.api.get<Provincia[]>('/api/provincias', { pais_id: paisId ?? undefined });
  }

  localidades(provinciaId?: number | null): Observable<Localidad[]> {
    return this.api.get<Localidad[]>('/api/localidades', { provincia_id: provinciaId ?? undefined });
  }
}