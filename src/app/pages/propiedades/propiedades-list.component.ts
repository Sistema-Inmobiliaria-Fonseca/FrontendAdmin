import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { estadoBadge, estadoLabel } from '../../core/estado-propiedad';
import { Propiedad } from '../../core/models';
import { PropiedadService } from '../../services/propiedad.service';

@Component({
  selector: 'app-propiedades-list',
  standalone: false,
  template: `
    <div class="propiedades">
      <header class="propiedades__header">
        <div>
          <h2 class="dashboard__title">Propiedades</h2>
          <p class="dashboard__subtitle">Administrá el catálogo de propiedades, su ubicación y sus categorías.</p>
        </div>
        <button type="button" class="btn btn--primary" (click)="nueva()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Nueva propiedad
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
                  <th>Foto</th><th>Nombre</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Superficie</th>
                  <th>Valor</th>
                  <th>Ambientes</th>
                  <th>Categorías</th>
                  <th>Actualizado</th>
                  <th class="table__numeric">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @if (propiedades().length === 0) {
                  <tr>
                    <td colspan="9">
                      <div class="empty">
                        <p class="empty__title">No hay propiedades cargadas</p>
                        <p class="empty__text">Creá tu primera propiedad para empezar a poblar el catálogo.</p>
                      </div>
                    </td>
                  </tr>
                }
                @for (propiedad of propiedades(); track propiedad.id) {
                  <tr>
                    <td style="width:80px;">@if (propiedad.imagenes && propiedad.imagenes.length > 0) {<img [src]="propiedad.imagenes[0].url" style="width:70px;height:50px;object-fit:cover;border-radius:6px;">} @else {<div style="width:70px;height:50px;background:#e5e7eb;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6b7280;">Sin foto</div>}</td><td class="table__strong">{{ propiedad.nombre }}</td>
                    <td>
                      <span class="badge" [ngClass]="estadoBadge(propiedad.estado)">
                        {{ estadoLabel(propiedad.estado) }}
                      </span>
                    </td>
                    <td>
                      @if (propiedad.ubicacion) {
                        {{ propiedad.ubicacion.localidad.nombre }}, {{ propiedad.ubicacion.provincia.nombre }},
                        {{ propiedad.ubicacion.pais.nombre }}
                      } @else {
                        —
                      }
                    </td>
                    <td>{{ propiedad.metros_cuadrados !== null ? propiedad.metros_cuadrados + ' m²' : '—' }}</td>
                     <td>
                       {{ propiedad.valor !== null ? (propiedad.valor | currency: (propiedad.moneda || 'ARS'):'symbol-narrow':'1.0-0') : '—' }}
                     </td>
                    <td>{{ propiedad.cantidad_ambientes }}</td>
                    <td>
                      @if (propiedad.categorias.length === 0) {
                        —
                      } @else {
                        <div class="chips">
                          @for (cat of propiedad.categorias; track cat.id) {
                            <span class="badge">{{ cat.nombre }}</span>
                          }
                        </div>
                      }
                    </td>
                    <td>{{ propiedad.updated_at | date: 'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div class="table__actions">
                        <button type="button" class="btn btn--ghost btn--sm" (click)="editar(propiedad.id)">
                          Editar
                        </button>
                        <button
                          type="button"
                          class="btn btn--ghost btn--sm"
                          (click)="eliminar(propiedad)"
                          [disabled]="borrandoId() === propiedad.id"
                        >
                          @if (borrandoId() === propiedad.id) {
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
      .propiedades {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .propiedades__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .chips {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.375rem;
      }
    `,
  ],
})
export class PropiedadesListComponent implements OnInit {
  private readonly propiedadService = inject(PropiedadService);
  private readonly router = inject(Router);

  readonly estadoLabel = estadoLabel;
  readonly estadoBadge = estadoBadge;

  readonly propiedades = signal<Propiedad[]>([]);
  readonly cargando = signal(true);
  readonly borrandoId = signal<number | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  nueva(): void {
    void this.router.navigate(['/propiedades/nueva']);
  }

  editar(id: number): void {
    void this.router.navigate(['/propiedades', id, 'editar']);
  }

  eliminar(propiedad: Propiedad): void {
    if (!confirm(`¿Seguro que querés eliminar "${propiedad.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.borrandoId.set(propiedad.id);
    this.error.set(null);

    this.propiedadService
      .eliminar(propiedad.id)
      .pipe(
        catchError((e) => {
          this.error.set(e.message ?? 'No se pudo eliminar la propiedad.');
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

    this.propiedadService
      .listar()
      .pipe(
        catchError((e) => {
          this.error.set(e.message ?? 'No se pudieron cargar las propiedades.');
          return of([]);
        }),
      )
      .subscribe((datos) => {
        this.propiedades.set(datos);
        this.cargando.set(false);
      });
  }
}