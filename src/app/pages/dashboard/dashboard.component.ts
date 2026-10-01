import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Categoria, EstadoPropiedad, Propiedad } from '../../core/models';
import { CategoriaService } from '../../services/categoria.service';
import { PropiedadService } from '../../services/propiedad.service';

interface DashboardKpi {
  label: string;
  value: string;
  hint?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  template: `
    <div class="dashboard">
      <header class="dashboard__header">
        <div>
          <h2 class="dashboard__title">Vista general</h2>
          <p class="dashboard__subtitle">Estado actual del inventario de propiedades y categorías.</p>
        </div>
        <div class="dashboard__actions">
          <a routerLink="/propiedades" class="btn btn--secondary">Ver propiedades</a>
          <a routerLink="/categorias" class="btn btn--primary">Ver categorías</a>
        </div>
      </header>

      @if (error()) {
        <div class="alert alert--danger">{{ error() }}</div>
      }

      @if (cargando()) {
        <div class="dashboard__loading">
          <span class="spinner spinner--page"></span>
        </div>
      } @else {
        <section class="dashboard__grid">
          @for (kpi of kpis(); track kpi.label) {
            <article class="kpi">
              <p class="kpi__label">{{ kpi.label }}</p>
              <p class="kpi__value">{{ kpi.value }}</p>
              @if (kpi.hint) {
                <p class="kpi__hint">{{ kpi.hint }}</p>
              }
            </article>
          }
        </section>

        <section class="dashboard__split">
          <article class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Propiedades por estado</h3>
                <p class="card__subtitle">Distribución entre disponibles y alquiladas.</p>
              </div>
            </div>
            <div class="card__body">
              <ul class="list">
                @for (item of porEstado(); track item.estado) {
                  <li class="list__item">
                    <span class="list__label">{{ item.estado }}</span>
                    <span class="list__value">{{ item.cantidad }}</span>
                  </li>
                }
              </ul>
            </div>
          </article>

          <article class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Categorías más usadas</h3>
                <p class="card__subtitle">Top por cantidad de propiedades asociadas.</p>
              </div>
            </div>
            <div class="card__body">
              @if (topCategorias().length === 0) {
                <p class="empty__text">Todavía no hay categorías asociadas a propiedades.</p>
              } @else {
                <ul class="list">
                  @for (item of topCategorias(); track item.nombre) {
                    <li class="list__item">
                      <span class="list__label">{{ item.nombre }}</span>
                      <span class="list__value">{{ item.cantidad }}</span>
                    </li>
                  }
                </ul>
              }
            </div>
          </article>

          <article class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Últimas propiedades</h3>
                <p class="card__subtitle">Las 5 más recientemente cargadas.</p>
              </div>
            </div>
            <div class="card__body card__body--flush">
              @if (recientes().length === 0) {
                <p class="empty__text empty">No hay propiedades cargadas.</p>
              } @else {
                <ul class="recientes">
                  @for (propiedad of recientes(); track propiedad.id) {
                    <li class="recientes__item">
                      <div>
                        <p class="recientes__nombre">{{ propiedad.nombre }}</p>
                        <p class="recientes__ubicacion">
                          {{ propiedad.ubicacion ? propiedad.ubicacion.localidad.nombre + ', ' + propiedad.ubicacion.pais.nombre : 'Sin ubicación' }}
                        </p>
                      </div>
                      @if (propiedad.estado === 'disponible') {
                        <span class="badge badge--success">Disponible</span>
                      } @else {
                        <span class="badge badge--info">Alquilada</span>
                      }
                    </li>
                  }
                </ul>
              }
            </div>
          </article>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dashboard__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .dashboard__actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dashboard__title {
        font-size: var(--font-size-2xl);
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .dashboard__subtitle {
        margin-top: 0.375rem;
        color: var(--color-text-secondary);
      }

      .dashboard__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
      }

      .dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
        gap: 1rem;
      }

      .dashboard__split {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
        gap: 1rem;
        align-items: start;
      }

      .kpi {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 1.125rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
      }

      .kpi__label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .kpi__value {
        font-size: clamp(1.625rem, 2.5vw, 2.125rem);
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--color-text);
      }

      .kpi__hint {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .list__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.625rem 0.75rem;
        background: var(--color-surface-alt);
        border: 1px solid var(--color-border-soft);
        border-radius: var(--radius-md);
      }

      .list__label {
        font-weight: 600;
        color: var(--color-text);
        text-transform: capitalize;
      }

      .list__value {
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .recientes {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .recientes__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 1.25rem;
        border-bottom: 1px solid var(--color-border-soft);
      }

      .recientes__nombre {
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text);
      }

      .recientes__ubicacion {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly propiedadService = inject(PropiedadService);
  private readonly router = inject(Router);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly propiedades = signal<Propiedad[]>([]);

  readonly kpis = signal<DashboardKpi[]>([]);
  readonly porEstado = signal<{ estado: EstadoPropiedad; cantidad: number }[]>([]);
  readonly topCategorias = signal<{ nombre: string; cantidad: number }[]>([]);
  readonly recientes = signal<Propiedad[]>([]);

  ngOnInit(): void {
    forkJoin({
      categorias: this.categoriaService.listar(),
      propiedades: this.propiedadService.listar(),
    }).subscribe({
      next: ({ categorias, propiedades }) => {
        this.propiedades.set(propiedades);
        this.calcular(categorias.length, propiedades);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.message ?? 'No se pudo cargar la información del panel.');
        this.cargando.set(false);
      },
    });
  }

  private calcular(totalCategorias: number, propiedades: Propiedad[]): void {
    const disponibles = propiedades.filter((p) => p.estado === 'disponible').length;
    const alquiladas = propiedades.filter((p) => p.estado === 'alquilada').length;

    const conMetros = propiedades.filter((p) => p.metros_cuadrados !== null);
    const conValor = propiedades.filter((p) => p.valor !== null);

    const promedioMetros = conMetros.length
      ? (conMetros.reduce((total, p) => total + (p.metros_cuadrados ?? 0), 0) / conMetros.length)
      : null;
    const promedioValor = conValor.length
      ? conValor.reduce((total, p) => total + (p.valor ?? 0), 0) / conValor.length
      : null;

    this.kpis.set([
      { label: 'Propiedades', value: String(propiedades.length) },
      { label: 'Disponibles', value: String(disponibles) },
      { label: 'Alquiladas', value: String(alquiladas) },
      { label: 'Categorías', value: String(totalCategorias) },
      {
        label: 'Superficie promedio',
        value: promedioMetros === null ? '—' : `${promedioMetros.toFixed(2)} m²`,
        hint: `${conMetros.length} de ${propiedades.length} con dato`,
      },
      {
        label: 'Valor promedio',
        value: promedioValor === null ? '—' : formatMoneda(promedioValor),
        hint: `${conValor.length} de ${propiedades.length} con dato`,
      },
    ]);

    this.porEstado.set([
      { estado: 'disponible', cantidad: disponibles },
      { estado: 'alquilada', cantidad: alquiladas },
    ]);

    const conteo = new Map<string, number>();

    for (const propiedad of propiedades) {
      for (const categoria of propiedad.categorias ?? []) {
        conteo.set(categoria.nombre, (conteo.get(categoria.nombre) ?? 0) + 1);
      }
    }

    this.topCategorias.set(
      [...conteo.entries()]
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 6),
    );

    this.recientes.set(propiedades.slice(0, 5));
  }
}

function formatMoneda(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(valor);
}