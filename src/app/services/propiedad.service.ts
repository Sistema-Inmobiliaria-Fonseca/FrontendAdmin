import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Propiedad, PropiedadInput } from '../core/models';
import { ApiService } from './api.service';

const BASE_URL = '/api/propiedades';

@Injectable({ providedIn: 'root' })
export class PropiedadService {
  private readonly api = inject(ApiService);

  listar(): Observable<Propiedad[]> {
    return this.api.get<Propiedad[]>(BASE_URL);
  }

  buscar(id: number): Observable<Propiedad> {
    return this.api.get<Propiedad>(`${BASE_URL}/${id}`);
  }

  crear(datos: PropiedadInput): Observable<Propiedad> {
    return this.api.post<Propiedad>(BASE_URL, datos);
  }

  actualizar(id: number, datos: PropiedadInput): Observable<Propiedad> {
    return this.api.put<Propiedad>(`${BASE_URL}/${id}`, datos);
  }

  eliminar(id: number): Observable<null> {
    return this.api.delete<null>(`${BASE_URL}/${id}`);
  }
}