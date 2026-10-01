import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { AdminLayoutComponent } from './shared/admin-layout.component';
import { CategoriaFormComponent } from './pages/categorias/categoria-form.component';
import { CategoriasListComponent } from './pages/categorias/categorias-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login';
import { PropiedadFormComponent } from './pages/propiedades/propiedad-form.component';
import { PropiedadesListComponent } from './pages/propiedades/propiedades-list.component';
import { SharedModule } from './shared/shared-module';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    DashboardComponent,
    AdminLayoutComponent,
    CategoriasListComponent,
    CategoriaFormComponent,
    PropiedadesListComponent,
    PropiedadFormComponent,
  ],
  imports: [BrowserModule, SharedModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor, unauthorizedInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
