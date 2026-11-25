import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ClubApi } from '../../../core/api/club.api';
import { UserApi } from '../../../core/api/user.api';
import { UserRole } from '../../../core/models/auth.model';
import { Club } from '../../../core/models/club.model';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { parseApiError } from '../../../core/utils/api-error.parser';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ModalComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements OnInit {
  private readonly userApi = inject(UserApi);
  private readonly clubApi = inject(ClubApi);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly users = signal<User[]>([]);
  protected readonly clubs = signal<Club[]>([]);
  protected readonly roleFilter = signal<'ALL' | UserRole>('ALL');
  protected readonly search = signal('');

  protected readonly modalOpen = signal(false);
  protected readonly saving = signal(false);

  protected readonly clubMap = computed(() => {
    const map = new Map<number, Club>();
    for (const c of this.clubs()) {
      map.set(c.id, c);
    }
    return map;
  });

  protected readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.users().filter((u) => {
      if (role !== 'ALL' && u.role !== role) return false;
      if (!query) return true;
      return (
        `${u.name} ${u.surname}`.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.documentNumber.toLowerCase().includes(query)
      );
    });
  });

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    surname: ['', [Validators.required]],
    documentNumber: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['CLUB_MANAGER' as UserRole, [Validators.required]],
    clubId: [null as number | null],
  });

  ngOnInit(): void {
    this.loadData();
    this.form.controls.role.valueChanges.subscribe((role) => {
      const clubControl = this.form.controls.clubId;
      if (role === 'CLUB_MANAGER') {
        clubControl.setValidators([Validators.required]);
      } else {
        clubControl.clearValidators();
        clubControl.setValue(null);
      }
      clubControl.updateValueAndValidity();
    });
  }

  protected loadData(): void {
    this.loading.set(true);
    forkJoin({
      users: this.userApi.getAll(),
      clubs: this.clubApi.getAll(),
    }).subscribe({
      next: ({ users, clubs }) => {
        this.users.set(users);
        this.clubs.set(clubs);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const parsed = parseApiError(err);
        this.toastService.error(parsed.title, parsed.message);
      },
    });
  }

  protected getClubName(clubId: number | null): string {
    if (!clubId) return '—';
    return this.clubMap().get(clubId)?.name ?? `Club #${clubId}`;
  }

  protected openCreateModal(): void {
    this.form.reset({
      name: '',
      surname: '',
      documentNumber: '',
      username: '',
      password: '',
      role: 'CLUB_MANAGER',
      clubId: null,
    });
    this.form.controls.clubId.setValidators([Validators.required]);
    this.form.controls.clubId.updateValueAndValidity();
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected createUser(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const role = (raw.role ?? 'CLUB_MANAGER') as UserRole;

    this.saving.set(true);
    this.userApi
      .create({
        name: (raw.name ?? '').trim(),
        surname: (raw.surname ?? '').trim(),
        documentNumber: (raw.documentNumber ?? '').trim(),
        username: (raw.username ?? '').trim(),
        password: raw.password ?? '',
        role,
        clubId: role === 'CLUB_MANAGER' && raw.clubId ? Number(raw.clubId) : null,
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.modalOpen.set(false);
          this.toastService.success(
            'Usuario creado',
            `@${created.username} fue registrado correctamente.`
          );
          this.loadData();
        },
        error: (err) => {
          this.saving.set(false);
          const parsed = parseApiError(err);
          this.toastService.error(parsed.title, parsed.message);
        },
      });
  }
}
