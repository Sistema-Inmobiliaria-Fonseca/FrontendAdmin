# FrontendAdmin

Panel de administración del sistema inmobiliario (Angular 20). Consume la API del
backend en `../Backend-`.

## Requisitos

- Node.js 20 o superior
- La API corriendo en `http://localhost:8000` (ver el README del backend)

## Puesta en marcha

```bash
npm install
npm start
```

Abrí `http://localhost:4200/`. El proxy de `proxy.conf.json` reenvía las rutas
`/api` a `http://localhost:8000`, así que no hace falta configurar ninguna URL.

Credenciales del usuario inicial (las crea el seed del backend):

```
admin@inmobiliaria.com / admin123
```

## Pantallas

| Ruta                        | Descripción                                             |
|-----------------------------|---------------------------------------------------------|
| `/login`                    | Inicio de sesión                                        |
| `/dashboard`                | KPIs, distribución por estado y últimas propiedades      |
| `/categorias`               | Listado de categorías                                   |
| `/categorias/nueva`         | Alta de categoría                                       |
| `/categorias/:id/editar`    | Edición de categoría                                    |
| `/propiedades`              | Listado de propiedades                                  |
| `/propiedades/nueva`        | Alta de propiedad                                       |
| `/propiedades/:id/editar`   | Edición de propiedad                                    |

Todas las rutas salvo `/login` están protegidas por `authGuard`.

## Estructura

```
src/
├── styles/
│   ├── _tokens.scss        Variables SCSS (fuente de verdad del tema)
│   └── _components.scss    .btn, .card, .table, .badge, .field, .modal, .alert
├── styles.scss             Tokens → custom properties + reset
└── app/
    ├── core/models.ts      Interfaces que reflejan el JSON de la API
    ├── services/
    │   ├── api.service.ts      Desenvuelve {success, data} y normaliza errores
    │   ├── auth.service.ts     Sesión y token en localStorage
    │   ├── categoria.service.ts
    │   ├── propiedad.service.ts
    │   └── geografia.service.ts
    ├── interceptors/
    │   ├── auth-token.interceptor.ts   Agrega Authorization: Bearer
    │   └── unauthorized.interceptor.ts Cierra sesión ante un 401
    ├── guards/             authGuard, guestGuard
    └── pages/              login, dashboard, categorias, propiedades
```

## Notas de implementación

- Los componentes son **no standalone** (`standalone: false`), declarados en
  `app-module.ts`. Es lo que fija `angular.json` en los schematics.
- El estado es con **signals**, sin librerías externas.
- Los estilos usan **BEM con SCSS** y las custom properties de `styles.scss`.
  Las clases genéricas viven en `_components.scss` para no repetirlas por pantalla.
- `ApiService` es el único que conoce el sobre `{success, data, error}`. El resto
  de los servicios y las pantallas reciben el `data` ya desenvuelto.
- El logout es del lado del cliente: los tokens del backend son sin estado, sin
  tabla de revocación.

## Building

```bash
npm run build
```

Los artefactos quedan en `dist/`. En producción el build no lleva ninguna URL de
API: hay que servir la app y la API bajo el mismo origen (por ejemplo detrás del
mismo reverse proxy) o agregar unenvironments con `fileReplacements`.