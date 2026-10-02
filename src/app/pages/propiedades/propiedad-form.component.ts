import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of, switchMap, tap } from 'rxjs';

import { ApiError } from '../../services/api.service';
import { ESTADOS_PROPIEDAD } from '../../core/estado-propiedad';
import { Categoria, EstadoPropiedad, Localidad, Pais, Provincia, PropiedadInput } from '../../core/models';
import { CategoriaService } from '../../services/categoria.service';
import { GeografiaService } from '../../services/geografia.service';
import { PropiedadService } from '../../services/propiedad.service';

const MENSAJES: Record<string, string> = {
  'nombre.required': 'El nombre es obligatorio.',
  'nombre.maxlength': 'El nombre debe tener hasta 200 caracteres.',
  'metros_cuadrados.required': 'La superficie es obligatoria.',
  'metros_cuadrados.min': 'La superficie no puede ser negativa.',
  'valor.required': 'El valor es obligatorio.',
  'valor.min': 'El valor no puede ser negativo.',
  'cantidad_habitaciones.required': 'La cantidad de habitaciones es obligatoria.',
  'cantidad_habitaciones.min': 'La cantidad de habitaciones no puede ser negativa.',
  'cantidad_ambientes.required': 'La cantidad de ambientes es obligatoria.',
  'cantidad_ambientes.min': 'La cantidad de ambientes no puede ser negativa.',
  'descripcion.required': 'La descripción es obligatoria.',
  'descripcion.maxlength': 'La descripción debe tener hasta 5000 caracteres.',
  'estado.required': 'El estado es obligatorio.',
};

@Component({
  selector: 'app-propiedad-form',
  standalone: false,
  template: `
    <div class="form-page">
      <header class="form-page__header">
        <div>
          <h2 class="dashboard__title">{{ esEdicion() ? 'Editar propiedad' : 'Nueva propiedad' }}</h2>
          <p class="dashboard__subtitle">
            {{
              esEdicion()
                ? 'Actualizá los datos de la propiedad seleccionada.'
                : 'Completá los datos para cargar una nueva propiedad al catálogo.'
            }}
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
        <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          <section class="card">
            <div class="card__header">
              <h3 class="card__title">Datos generales</h3>
            </div>
            <div class="card__body">
              <div class="grid">
                <div class="field grid--full">
                  <label class="field__label" for="nombre">Nombre <span class="field__optional">*</span></label>
                  <input
                    id="nombre"
                    type="text"
                    class="field__input"
                    formControlName="nombre"
                    placeholder="Ej.: Casa en Palmares"
                    maxlength="200"
                    [attr.aria-invalid]="campoInvalido('nombre')"
                  />
                  @if (mensajeCampo('nombre')) {
                    <p class="field__error">{{ mensajeCampo('nombre') }}</p>
                  }
                </div>

                <div class="field">
                  <label class="field__label" for="metros_cuadrados">
                    Superficie (m²) <span class="field__optional">*</span>
                  </label>
                  <input
                    id="metros_cuadrados"
                    type="number"
                    min="0"
                    step="0.01"
                    class="field__input"
                    formControlName="metros_cuadrados"
                    placeholder="120.50"
                    [attr.aria-invalid]="campoInvalido('metros_cuadrados')"
                  />
                  @if (mensajeCampo('metros_cuadrados')) {
                    <p class="field__error">{{ mensajeCampo('metros_cuadrados') }}</p>
                  }
                </div>

                <div class="field">
                  <label class="field__label" for="valor">Valor <span class="field__optional">*</span></label>
                  <input
                    id="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    class="field__input"
                    formControlName="valor"
                    placeholder="250000"
                    [attr.aria-invalid]="campoInvalido('valor')"
                  />
                  @if (mensajeCampo('valor')) {
                    <p class="field__error">{{ mensajeCampo('valor') }}</p>
                  }
                </div>

                <div class="field">
                  <label class="field__label" for="cantidad_habitaciones">
                    Habitaciones <span class="field__optional">*</span>
                  </label>
                  <input
                    id="cantidad_habitaciones"
                    type="number"
                    min="0"
                    class="field__input"
                    formControlName="cantidad_habitaciones"
                    placeholder="3"
                    [attr.aria-invalid]="campoInvalido('cantidad_habitaciones')"
                  />
                  @if (mensajeCampo('cantidad_habitaciones')) {
                    <p class="field__error">{{ mensajeCampo('cantidad_habitaciones') }}</p>
                  }
                </div>

                <div class="field">
                  <label class="field__label" for="cantidad_ambientes">
                    Ambientes <span class="field__optional">*</span>
                  </label>
                  <input
                    id="cantidad_ambientes"
                    type="number"
                    min="0"
                    class="field__input"
                    formControlName="cantidad_ambientes"
                    placeholder="5"
                    [attr.aria-invalid]="campoInvalido('cantidad_ambientes')"
                  />
                  @if (mensajeCampo('cantidad_ambientes')) {
                    <p class="field__error">{{ mensajeCampo('cantidad_ambientes') }}</p>
                  }
                </div>

                <div class="field">
                  <label class="field__label" for="estado">Estado <span class="field__optional">*</span></label>
                  <div class="field__control">
                    <select id="estado" class="field__select" formControlName="estado">
                      @for (opcion of estados; track opcion.valor) {
                        <option [value]="opcion.valor">{{ opcion.etiqueta }}</option>
                      }
                    </select>
                  </div>
                  @if (mensajeCampo('estado')) {
                    <p class="field__error">{{ mensajeCampo('estado') }}</p>
                  }
                </div>

                <div class="field">
                  <span class="field__label">Financiación</span>
                  <label class="checkbox">
                    <input type="checkbox" formControlName="apto_credito" />
                    <span>Apto a crédito</span>
                  </label>
                </div>

                <div class="field grid--full">
                  <label class="field__label" for="descripcion">Descripción <span class="field__optional">*</span></label>
                  <textarea
                    id="descripcion"
                    rows="4"
                    class="field__textarea"
                    formControlName="descripcion"
                    placeholder="Características de la propiedad"
                    maxlength="5000"
                    [attr.aria-invalid]="campoInvalido('descripcion')"
                  ></textarea>
                  @if (mensajeCampo('descripcion')) {
                    <p class="field__error">{{ mensajeCampo('descripcion') }}</p>
                  }
                </div>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Ubicación</h3>
                <p class="card__subtitle">Seleccioná país, provincia y localidad del catálogo.</p>
              </div>
            </div>
            <div class="card__body">
              <div class="grid grid--three">
                <div class="field">
                  <label class="field__label" for="pais">País <span class="field__optional">*</span></label>
                  <div class="field__control" [class.field__control--invalid]="cargandoPaises()">
                    <select
                      id="pais"
                      class="field__select"
                      [formControl]="paisControl"
                      [class.field__control--invalid]="cargandoPaises()"
                    >
                      <option [ngValue]="null">Seleccionar país...</option>
                      @for (pais of paises(); track pais.id) {
                        <option [ngValue]="pais.id">{{ pais.nombre }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="provincia">
                    Provincia <span class="field__optional">*</span>
                  </label>
                  <div class="field__control">
                    <select
                      id="provincia"
                      class="field__select"
                      [formControl]="provinciaControl"
                      [disabled]="!paisControl.value"
                    >
                      <option [ngValue]="null">Seleccionar provincia...</option>
                      @for (provincia of provincias(); track provincia.id) {
                        <option [ngValue]="provincia.id">{{ provincia.nombre }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="field">
                  <label class="field__label" for="localidad">Localidad <span class="field__optional">*</span></label>
                  <div class="field__control" [class.field__control--invalid]="localidadInvalida()">
                    <select
                      id="localidad"
                      class="field__select"
                      [formControl]="localidadControl"
                      [disabled]="!provinciaControl.value"
                      [attr.aria-invalid]="localidadInvalida()"
                    >
                      <option [ngValue]="null">Seleccionar localidad...</option>
                      @for (localidad of localidades(); track localidad.id) {
                        <option [ngValue]="localidad.id">{{ localidad.nombre }}</option>
                      }
                    </select>
                  </div>
                  @if (erroresCampo()['localidad_id']) {
                    <p class="field__error">{{ erroresCampo()['localidad_id'] }}</p>
                  } @else if (localidadInvalida()) {
                    <p class="field__error">Seleccioná una localidad.</p>
                  }
                </div>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card__header">
              <div>
                <h3 class="card__title">Categorías</h3>
                <p class="card__subtitle">Elegí todas las categorías que apliquen a esta propiedad.</p>
              </div>
            </div>
            <div class="card__body">
              @if (categorias().length === 0) {
                <p class="empty__text">No hay categorías cargadas.</p>
              } @else {
                <div class="checkbox-list">
                  @for (categoria of categorias(); track categoria.id) {
                    <label class="checkbox">
                      <input
                        type="checkbox"
                        [checked]="seleccionadas().includes(categoria.id)"
                        (change)="alternarCategoria(categoria.id)"
                      />
                      <span>{{ categoria.nombre }}</span>
                    </label>
                  }
                </div>
                @if (erroresCampo()['categorias']) {
                  <p class="field__error">{{ erroresCampo()['categorias'] }}</p>
                }
              }
            </div>
          </section>

          <div class="form-page__footer">
            <button type="button" class="btn btn--secondary" (click)="volver()" [disabled]="guardando()">Cancelar</button>
            <button type="submit" class="btn btn--primary" [disabled]="guardando()">
              @if (guardando()) {
                <span class="spinner"></span>
                Guardando...
              } @else {
                {{ esEdicion() ? 'Guardar cambios' : 'Crear propiedad' }}
              }
            </button>
          </div>
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

      .form-page__footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.625rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        gap: 1.25rem;
      }

      .grid--three {
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
      }

      .grid--full {
        grid-column: 1 / -1;
      }
    `,
  ],
})
export class PropiedadFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly propiedadService = inject(PropiedadService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly geografiaService = inject(GeografiaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly estados = ESTADOS_PROPIEDAD;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(200)]],
    metros_cuadrados: [null as number | null, [Validators.required, Validators.min(0)]],
    valor: [null as number | null, [Validators.required, Validators.min(0)]],
    cantidad_habitaciones: [null as number | null, [Validators.required, Validators.min(0)]],
    cantidad_ambientes: [null as number | null, [Validators.required, Validators.min(0)]],
    descripcion: ['' as string | null, [Validators.required, Validators.maxLength(5000)]],
    apto_credito: [false],
    estado: ['disponible' as EstadoPropiedad, Validators.required],
  });

  readonly paisControl = this.fb.control<number | null>(null);
  readonly provinciaControl = this.fb.control<number | null>(null);
  readonly localidadControl = this.fb.control<number | null>(null, Validators.required);

  readonly id = signal<number | null>(null);
  readonly esEdicion = signal(false);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly cargandoPaises = signal(false);
  readonly errorGeneral = signal<string | null>(null);
  readonly erroresCampo = signal<Record<string, string>>({});

  readonly paises = signal<Pais[]>([]);
  readonly provincias = signal<Provincia[]>([]);
  readonly localidades = signal<Localidad[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly seleccionadas = signal<number[]>([]);

  ngOnInit(): void {
    this.paisControl.valueChanges.subscribe((paisId) => {
      this.provinciaControl.setValue(null, { emitEvent: false });
      this.localidadControl.setValue(null, { emitEvent: false });
      this.provincias.set([]);
      this.localidades.set([]);

      if (paisId) {
        this.geografiaService
          .provincias(paisId)
          .pipe(catchError(() => of([] as Provincia[])))
          .subscribe((lista) => this.provincias.set(lista));
      }
    });

    this.provinciaControl.valueChanges.subscribe((provinciaId) => {
      this.localidadControl.setValue(null, { emitEvent: false });
      this.localidades.set([]);

      if (provinciaId) {
        this.geografiaService
          .localidades(provinciaId)
          .pipe(catchError(() => of([] as Localidad[])))
          .subscribe((lista) => this.localidades.set(lista));
      }
    });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const rawId = params.get('id');

          if (rawId) {
            const id = Number(rawId);

            if (!isNaN(id)) {
              this.id.set(id);
              this.esEdicion.set(true);
              return this.propiedadService.buscar(id).pipe(catchError(() => of(null)));
            }
          }

          return of(null);
        }),
      )
      .subscribe((propiedad) => {
        if (propiedad) {
          this.form.patchValue({
            nombre: propiedad.nombre,
            metros_cuadrados: propiedad.metros_cuadrados,
            valor: propiedad.valor,
            cantidad_habitaciones: propiedad.cantidad_habitaciones,
            cantidad_ambientes: propiedad.cantidad_ambientes,
            descripcion: propiedad.descripcion,
            apto_credito: propiedad.apto_credito,
            estado: propiedad.estado,
          });
          this.seleccionadas.set(propiedad.categorias.map((c) => c.id));

          if (propiedad.ubicacion) {
            this.paisControl.setValue(propiedad.ubicacion.pais.id, { emitEvent: false });
            this.cargarProvincias(propiedad.ubicacion.pais.id, propiedad.ubicacion.provincia.id);
            this.cargarLocalidades(propiedad.ubicacion.provincia.id, propiedad.ubicacion.localidad.id);
          }
        }

        this.cargar();
      });
  }

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Mensaje de validación en español para los errores del formulario.
   * Si el control es válido, delega en el mensaje que devolvió la API.
   */
  mensajeCampo(campo: string): string | null {
    const control = this.form.controls[campo as keyof typeof this.form.controls];

    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return this.erroresCampo()[campo] ?? null;
    }

    const errores = control.errors;
    const clave = errores['required']
      ? 'required'
      : errores['min']
        ? 'min'
        : errores['maxlength']
          ? 'maxlength'
          : null;

    return clave ? (MENSAJES[`${campo}.${clave}`] ?? 'Revisá el valor ingresado.') : null;
  }

  localidadInvalida(): boolean {
    return this.localidadControl.invalid && (this.localidadControl.dirty || this.localidadControl.touched);
  }

  alternarCategoria(id: number): void {
    this.seleccionadas.update((lista) =>
      lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id],
    );
  }

  volver(): void {
    void this.router.navigate(['/propiedades']);
  }

  guardar(): void {
    this.errorGeneral.set(null);
    this.erroresCampo.set({});
    this.form.markAllAsTouched();
    this.localidadControl.markAsTouched();

    if (this.form.invalid || this.localidadControl.invalid) {
      return;
    }

    const descripcion = this.form.controls.descripcion.value?.trim() ?? '';

    if (descripcion === '') {
      this.form.controls.descripcion.setErrors({ required: true });
      this.form.controls.descripcion.markAsTouched();
      return;
    }

    this.guardando.set(true);

    const valor = this.form.getRawValue();
    const datos: PropiedadInput = {
      nombre: valor.nombre.trim(),
      localidad_id: this.localidadControl.value,
      metros_cuadrados: valor.metros_cuadrados,
      valor: valor.valor,
      cantidad_habitaciones: valor.cantidad_habitaciones,
      cantidad_ambientes: valor.cantidad_ambientes,
      descripcion,
      apto_credito: valor.apto_credito,
      estado: valor.estado,
      categorias: this.seleccionadas(),
    };

    const peticion = this.esEdicion() && this.id()
      ? this.propiedadService.actualizar(this.id()!, datos)
      : this.propiedadService.crear(datos);

    peticion
      .pipe(
        catchError((e: ApiError) => {
          this.errorGeneral.set(e.message ?? 'No se pudo guardar la propiedad.');
          if (e.fields) {
            this.erroresCampo.set(e.fields);
          }
          return of(null);
        }),
      )
      .subscribe((resultado) => {
        this.guardando.set(false);

        if (resultado) {
          void this.router.navigate(['/propiedades']);
        }
      });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.cargandoPaises.set(true);

    forkJoin({
      paises: this.geografiaService.paises().pipe(catchError(() => of([] as Pais[]))),
      categorias: this.categoriaService.listar().pipe(catchError(() => of([] as Categoria[]))),
    })
      .pipe(tap(() => this.cargandoPaises.set(false)))
      .subscribe(({ paises, categorias }) => {
        this.paises.set(paises);
        this.categorias.set(categorias);
        this.cargando.set(false);
      });
  }

  private cargarProvincias(paisId: number, seleccionarId?: number): void {
    this.geografiaService
      .provincias(paisId)
      .pipe(catchError(() => of([] as Provincia[])))
      .subscribe((lista) => {
        this.provincias.set(lista);

        if (seleccionarId) {
          this.provinciaControl.setValue(seleccionarId, { emitEvent: false });
        }
      });
  }

  private cargarLocalidades(provinciaId: number, seleccionarId?: number): void {
    this.geografiaService
      .localidades(provinciaId)
      .pipe(catchError(() => of([] as Localidad[])))
      .subscribe((lista) => {
        this.localidades.set(lista);

        if (seleccionarId) {
          this.localidadControl.setValue(seleccionarId, { emitEvent: false });
        }
      });
  }
}