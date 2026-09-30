import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <header class="dashboard__bar">
        <h1 class="dashboard__title">Panel de control</h1>
        <div class="dashboard__user">
          <span class="dashboard__name">{{ authService.session()?.user?.nombre }}</span>
          <button type="button" class="dashboard__logout" (click)="logout()">Cerrar sesión</button>
        </div>
      </header>
      <main class="dashboard__body">
        <p>Sesión iniciada correctamente.</p>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard {
        min-height: 100vh;
        background: var(--color-background);
        color: var(--color-text);
      }
      .dashboard__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem 1.5rem;
        background: var(--color-primary);
        color: var(--color-text-inverse);
      }
      .dashboard__title {
        font-size: var(--font-size-lg);
        font-weight: 600;
      }
      .dashboard__user {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: var(--font-size-sm);
      }
      .dashboard__logout {
        padding: 0.5rem 0.875rem;
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-primary);
        background: var(--color-white);
        border: none;
        border-radius: var(--radius-md);
      }
      .dashboard__logout:hover {
        background: var(--color-primary-light);
      }
      .dashboard__logout:focus-visible {
        outline: none;
        box-shadow: var(--focus-ring);
      }
      .dashboard__body {
        padding: 1.5rem;
      }
    `,
  ],
  standalone: false,
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
