import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { SharedModule } from './shared/shared-module';

@NgModule({
  declarations: [App, LoginComponent, DashboardComponent],
  imports: [BrowserModule, SharedModule, AppRoutingModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
