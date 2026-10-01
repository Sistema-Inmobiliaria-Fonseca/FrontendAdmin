import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { ApiError } from '../../services/api.service';
import { CategoriaInput } from '../../core/models';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria-form',
  standalone: false,
  template: `
    <div class="form-page">
      <header class="form-page__header">
        <div>
          <h2 class="dashboard__title">{{ esEdicion() ? 'Editar categoría' : 'Nueva categoría' }}</h2>
          <p class="dashboard__subtitle">
            {{ esEdicion() ? 'Actualizá los datos de la categoría seleccionada.' : 'Completá los datos para crear una nueva categoría.' }}
          </p>
        </div>
        <button type="button" class="btn btn--secondary" (click)="volver()">Volver al listado</button>
      </header>

      @if (errorGeneral()) {
        <div class="alert alert--danger">{{ errorGeneral() }}</div>
      }

      @if (cargando()) {
        <div class="dashboard__loading">
          <span class="spinner spinner--page"></span>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="guardar()" novalidate class="card">
          <div class="card__body">
            <div class="grid">
              <div class="field grid--full">
                <label class="field__label" for="nombre">Nombre <span class="field__optional">*</span></label>
                <input
                  id="nombre"
                  type="text"
                  class="field__input"
                  formControlName="nombre"
                  placeholder="Ej.: Casas"
                  maxlength="120"
                  [attr.aria-invalid]="campoInvalido('nombre')"
                />
                @if (campoInvalido('nombre')) {
                  <p class="field__error">El nombre es obligatorio y debe tener hasta 120 caracteres.</p>
                } @else if (erroresCampo()['nombre']) {
                  <p class="field__error">{{ erroresCampo()['nombre'] }}</p>
                }
              </div>

              <div class="field grid--full">
                <label class="field__label" for="descripcion">Descripción <span class="field__optional">(opcional)</span></label>
                <textarea
                  id="descripcion"
                  rows="3"
                  class="field__textarea"
                  formControlName="descripcion"
                  placeholder="Breve descripción de la categoría"
                  maxlength="2000"
                ></textarea>
                @if (erroresCampo()['descripcion']) {
                  <p class="field__error">{{ erroresCampo()['descripcion'] }}</p>
                }
              </div>

              <div class="checkbox">
                <input id="activo" type="checkbox" formControlName="activo" />
                <label for="activo">Categoría activa</label>
              </div>
            </div>
          </div>

          <footer class="card__footer">
            <button type="button" class="btn btn--secondary" (click)="volver()" [disabled]="guardando()">Cancelar</button>
            <button type="submit" class="btn btn--primary" [disabled]="guardando()">
              @if (guardando()) {
                <span class="spinner"></span>
                Guardando...
              } @else {
                {{ esEdicion() ? 'Guardar cambios' : 'Crear categoría' }}
              }
            </button>
          </footer>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .form-page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-page__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        gap: 1.25rem;
      }

      .grid--full {
        grid-column: 1 / -1;
      }

      .card__footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.625rem;
        padding: 1rem 1.25rem;
        background: var(--color-surface-alt);
        border-top: 1px solid var(--color-border-soft);
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      }
    `,
  ],
})
export class CategoriaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['' as string | null],
    activo: [true],
  });

  readonly id = signal<number | null>(null);
  readonly esEdicion = signal(false);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorGeneral = signal<string | null>(null);
  readonly erroresCampo = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const rawId = params.get('id');
          if (rawId) {
            const id = Number(rawId);
            if (!isNaN(id)) {
              this.id.set(id);
              this.esEdicion.set(true);
              this.cargando.set(true);
              return this.categoriaService.buscar(id).pipe(
                catchError((e) => {
                  this.errorGeneral.set(e.message ?? 'No se pudo cargar la categoría.');
                  return of(null);
                }),
              );
            }
          }
          return of(null);
        }),
      )
      .subscribe((categoria) => {
        if (categoria) {
          this.form.patchValue({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            activo: Boolean(categoria.activo),
          });
        }
        this.cargando.set(false);
      });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  volver(): void {
    void this.router.navigate(['/categorias']);
  }

  guardar(): void {
    this.errorGeneral.set(null);
    this.erroresCampo.set({});
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.guardando.set(true);

    const valor = this.form.getRawValue();
    const datos: CategoriaInput = {
      nombre: valor.nombre.trim(),
      descripcion: valor.descripcion?.trim() || null,
      activo: valor.activo,
    };

    const peticion = this.esEdicion() && this.id()
      ? this.categoriaService.actualizar(this.id()!, datos)
      : this.categoriaService.crear(datos);

    peticion
      .pipe(
        catchError((e: ApiError) => {
          this.errorGeneral.set(e.message ?? 'No se pudo guardar la categoría.');
          if (e.fields) {
            this.erroresCampo.set(e.fields);
          }
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        this.guardando.set(false);
        if (resultado) {
          void this.router.navigate(['/categorias']);
        }
      });
  }
}