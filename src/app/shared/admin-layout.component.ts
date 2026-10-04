import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  template: `
    <div class="admin">
      <aside class="admin__sidebar">
        <div class="admin__logo">
           <img
              class="admin__logo-imagen"
              src="/logo.jpeg"
              alt="Carlos Fonseca Negocios Inmobiliarios"
            />
          <div>
            <p class="admin__logo-title">Inmobiliaria Carlos Fonseca</p>
            <p class="admin__logo-subtitle">Panel administrativo</p>
          </div>
        </div>

        <nav class="admin__nav">
          <a routerLink="/dashboard" class="admin__link" routerLinkActive="admin__link--active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Dashboard
          </a>
          <a routerLink="/propiedades" class="admin__link" routerLinkActive="admin__link--active">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
              <path d="M9.5 21v-6h5v6" />
            </svg>
            Propiedades
          </a>
          <a routerLink="/categorias" class="admin__link" routerLinkActive="admin__link--active">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7h18" />
              <path d="M3 12h18" />
              <path d="M3 17h18" />
            </svg>
            Categorías
          </a>
        </nav>
      </aside>

      <div class="admin__content">
        <header class="admin__topbar">
          <h1 class="admin__topbar-title">Panel de administración</h1>
          <div class="admin__user">
            <div class="admin__user-info">
              <span class="admin__user-name">{{ authService.session()?.user?.nombre }}</span>
              <span class="admin__user-email">{{ authService.session()?.user?.email }}</span>
            </div>
            <button type="button" class="btn btn--ghost" (click)="logout()">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M9.5 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5" />
                <path d="M14.5 8.5 19 12l-4.5 3.5" />
                <path d="M19 12h-9" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main class="admin__main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .admin {
        display: grid;
        grid-template-columns: 16rem 1fr;
        min-height: 100vh;
        background: var(--color-background);
      }

      .admin__sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.25rem 1rem;
        background: var(--color-surface);
        border-right: 1px solid var(--color-border-soft);
      }

      .admin__logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0.875rem;
        border-radius: var(--radius-lg);
        background: linear-gradient(155deg, var(--color-blue-800) 0%, var(--color-blue-600) 60%, var(--color-blue-500) 100%);
        color: var(--color-white);
        box-shadow: var(--shadow-sm);
      }

      .admin__logo-imagen {
        width: 48px;
        height: 48px;
        max-width: 48px;
        max-height: 48px;
        object-fit: contain;
        display: block;
        flex-shrink: 0;
        border-radius: 8px;
      }

      .admin__logo-title {
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      .admin__logo-subtitle {
        font-size: var(--font-size-sm);
        color: var(--color-text-on-primary);
      }

      .admin__nav {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .admin__link {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.625rem 0.75rem;
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text-secondary);
        border-radius: var(--radius-md);
        text-decoration: none;
        transition: background-color 0.15s ease, color 0.15s ease;

        svg {
          width: 1.125rem;
          height: 1.125rem;
        }

        &:hover {
          color: var(--color-text);
          background: var(--color-surface-alt);
          text-decoration: none;
        }

        &--active {
          color: var(--color-primary);
          background: var(--color-primary-light);
        }
      }

      .admin__content {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .admin__topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.875rem 1.5rem;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border-soft);
        box-shadow: var(--shadow-sm);
      }

      .admin__topbar-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
      }

      .admin__user {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .admin__user-info {
        display: flex;
        flex-direction: column;
        text-align: right;
      }

      .admin__user-name {
        font-size: var(--font-size-sm);
        font-weight: 600;
      }

      .admin__user-email {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .admin__main {
        flex: 1;
        padding: 1.5rem;
        overflow: auto;
      }

      @media (max-width: 960px) {
        .admin {
          grid-template-columns: 1fr;
        }

        .admin__sidebar {
          display: none;
        }

        .admin__main {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}