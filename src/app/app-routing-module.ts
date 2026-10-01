import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { AdminLayoutComponent } from './shared/admin-layout.component';
import { CategoriaFormComponent } from './pages/categorias/categoria-form.component';
import { CategoriasListComponent } from './pages/categorias/categorias-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login';
import { PropiedadFormComponent } from './pages/propiedades/propiedad-form.component';
import { PropiedadesListComponent } from './pages/propiedades/propiedades-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categorias', component: CategoriasListComponent },
      { path: 'categorias/nueva', component: CategoriaFormComponent },
      { path: 'categorias/:id/editar', component: CategoriaFormComponent },
      { path: 'propiedades', component: PropiedadesListComponent },
      { path: 'propiedades/nueva', component: PropiedadFormComponent },
      { path: 'propiedades/:id/editar', component: PropiedadFormComponent },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}