import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Categoria } from '../../core/models';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categorias-list',
  standalone: false,
  template: `
    <div class="categorias">
      <header class="categorias__header">
        <div>
          <h2 class="dashboard__title">Categorías</h2>
          <p class="dashboard__subtitle">Gestioná las categorías disponibles para clasificar propiedades.</p>
        </div>
        <button type="button" class="btn btn--primary" (click)="nueva()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Nueva categoría
        </button>
      </header>

      @if (error()) {
        <div class="alert alert--danger">{{ error() }}</div>
      }

      @if (cargando()) {
        <div class="dashboard__loading">
          <span class="spinner spinner--page"></span>
        </div>
      } @else {
        <div class="card">
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Propiedades</th>
                  <th>Última actualización</th>
                  <th class="table__numeric">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @if (categorias().length === 0) {
                  <tr>
                    <td colspan="6">
                      <div class="empty">
                        <p class="empty__title">No hay categorías cargadas</p>
                        <p class="empty__text">Creá tu primera categoría para empezar a clasificar las propiedades.</p>
                      </div>
                    </td>
                  </tr>
                }
                @for (categoria of categorias(); track categoria.id) {
                  <tr>
                    <td class="table__strong">{{ categoria.nombre }}</td>
                    <td>{{ categoria.descripcion || '—' }}</td>
                    <td>
                      @if (categoria.activo) {
                        <span class="badge badge--success">Activa</span>
                      } @else {
                        <span class="badge badge--muted">Inactiva</span>
                      }
                    </td>
                    <td>{{ categoria.propiedades_count ?? 0 }}</td>
                    <td>{{ categoria.updated_at | date: 'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="table__actions">
                        <button type="button" class="btn btn--ghost btn--sm" (click)="editar(categoria.id)">
                          Editar
                        </button>
                        <button
                          type="button"
                          class="btn btn--ghost btn--sm"
                          (click)="eliminar(categoria)"
                          [disabled]="borrandoId() === categoria.id"
                        >
                          @if (borrandoId() === categoria.id) {
                            <span class="spinner"></span>
                            Eliminando...
                          } @else {
                            Eliminar
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .categorias {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .categorias__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class CategoriasListComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly borrandoId = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  nueva(): void {
    void this.router.navigate(['/categorias/nueva']);
  }

  editar(id: number): void {
    void this.router.navigate(['/categorias', id, 'editar']);
  }

  eliminar(categoria: Categoria): void {
    const total = categoria.propiedades_count ?? 0;
    const mensaje = total > 0
      ? `¿Seguro que querés eliminar "${categoria.nombre}"? Tiene ${total} propiedad(es) asociada(s). Se eliminarán las asociaciones.`
      : `¿Seguro que querés eliminar "${categoria.nombre}"?`;

    if (!confirm(mensaje)) {
      return;
    }

    this.borrandoId.set(categoria.id);
    this.error.set(null);

    this.categoriaService
      .eliminar(categoria.id)
      .pipe(
        catchError((e) => {
          this.error.set(e.message ?? 'No se pudo eliminar la categoría.');
          return of(null);
        }),
      )
      .subscribe(() => {
        this.borrandoId.set(null);
        this.cargar();
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.categoriaService
      .listar()
      .pipe(
        catchError((e) => {
          this.error.set(e.message ?? 'No se pudieron cargar las categorías.');
          return of([]);
        }),
      )
      .subscribe((datos) => {
        this.categorias.set(datos);
        this.cargando.set(false);
      });
  }
}