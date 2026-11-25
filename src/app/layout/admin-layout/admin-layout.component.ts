import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

interface NavItem {
  label: string;
  route: string;
  icon: 'dashboard' | 'clubs' | 'users' | 'events';
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly loggingOut = signal(false);

  protected readonly navItems: NavItem[] = [
    { label: 'Panel principal', route: '/dashboard', icon: 'dashboard' },
    { label: 'Clubes', route: '/clubs', icon: 'clubs' },
    { label: 'Usuarios', route: '/users', icon: 'users' },
    { label: 'Eventos', route: '/events', icon: 'events' },
  ];

  ngOnInit(): void {
    this.authService.loadProfile().subscribe();
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected logout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.authService.logout().subscribe({
      complete: () => {
        this.loggingOut.set(false);
        this.toastService.info('Sesión cerrada', 'Has salido del panel administrativo.');
      },
    });
  }
}
