import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserListComponent, UserFormComponent, ModalComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  public users$!: Observable<User[]>;
  public totalUsers = 0;
  public currentPage = 1;
  public pageSize = 10;
  public Math = Math; // Para usar en el template
  
  // Modal
  public isModalOpen = false;
  public selectedUser: User | null = null;
  public modalMode: 'create' | 'edit' = 'create';

  private pageSubject = new BehaviorSubject<number>(1);

  ngOnInit(): void {
    this.users$ = this.pageSubject.pipe(
      switchMap(page => 
        this.userService.getUsers(page, this.pageSize).pipe(
          map(response => {
            this.totalUsers = response.total;
            this.currentPage = response.page;
            return response.data;
          })
        )
      )
    );
  }

  openModalParaCrear(): void {
    this.modalMode = 'create';
    this.selectedUser = null;
    this.isModalOpen = true;
  }

  onEditar(user: User): void {
    const currentUser = this.authService.currentUserValue;
    
    // Solo permitir editar el usuario actual
    if (!currentUser || user.id !== currentUser.id) {
      this.notificationService.showError('Solo puedes editar tu propio perfil.');
      return;
    }
    
    this.modalMode = 'edit';
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  onEliminar(user: User): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Usuario "${user.nombre}" eliminado correctamente.`);
        this.loadUsers();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Error al eliminar usuario.');
      }
    });
  }

  onVerDetalle(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  onSaveUser(userData: Partial<User>): void {
    const action = this.modalMode === 'create'
      ? this.userService.createUser(userData as any)
      : this.userService.updateUser(this.selectedUser!.id, userData);

    action.subscribe({
      next: () => {
        const message = this.modalMode === 'create' ? 'creado' : 'actualizado';
        this.notificationService.showSuccess(`Usuario ${message} correctamente.`);
        this.isModalOpen = false;
        this.loadUsers();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || `Error al ${this.modalMode === 'create' ? 'crear' : 'actualizar'} usuario.`);
      }
    });
  }

  onPageChange(page: number): void {
    this.pageSubject.next(page);
  }

  onSearch(email: string): void {
    if (!email || email.trim() === '') {
      this.loadUsers();
      return;
    }

    this.userService.searchUsersByEmail(email).subscribe({
      next: (users) => {
        this.users$ = new BehaviorSubject(users).asObservable();
        this.totalUsers = users.length;
      },
      error: (err) => {
        this.notificationService.showError('Error al buscar usuarios.');
      }
    });
  }

  private loadUsers(): void {
    this.pageSubject.next(this.currentPage);
  }
}

