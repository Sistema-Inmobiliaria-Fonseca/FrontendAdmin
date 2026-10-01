import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Categoria, CategoriaInput } from '../core/models';
import { ApiService } from './api.service';

const BASE_URL = '/api/categorias';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly api = inject(ApiService);

  listar(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>(BASE_URL);
  }

  buscar(id: number): Observable<Categoria> {
    return this.api.get<Categoria>(`${BASE_URL}/${id}`);
  }

  crear(datos: CategoriaInput): Observable<Categoria> {
    return this.api.post<Categoria>(BASE_URL, datos);
  }

  actualizar(id: number, datos: CategoriaInput): Observable<Categoria> {
    return this.api.put<Categoria>(`${BASE_URL}/${id}`, datos);
  }

  eliminar(id: number): Observable<null> {
    return this.api.delete<null>(`${BASE_URL}/${id}`);
  }
}