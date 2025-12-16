import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  perfilForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  loading = false;
  showPasswordSection = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.initForms();
      }
    });
  }

  private initForms(): void {
    this.perfilForm = this.fb.group({
      nombre: [this.currentUser?.nombre || '', [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onUpdateProfile(): void {
    if (this.perfilForm.invalid || !this.currentUser) {
      this.notificationService.showError('Por favor, completa todos los campos correctamente');
      return;
    }

    this.loading = true;
    const { nombre, email } = this.perfilForm.value;

    this.userService.updateUser(this.currentUser.id, { nombre, email }).subscribe({
      next: (updatedUser) => {
        this.notificationService.showSuccess('Perfil actualizado correctamente');
        // Actualizar el usuario en el servicio de autenticación
        this.authService.currentUser$.subscribe(user => {
          if (user) {
            user.nombre = updatedUser.nombre;
            user.email = updatedUser.email;
          }
        });
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Error al actualizar el perfil');
        this.loading = false;
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || !this.currentUser) {
      this.notificationService.showError('Por favor, completa todos los campos correctamente');
      return;
    }

    // Funcionalidad de cambio de contraseña - requiere endpoint en el backend
    this.notificationService.showError('La funcionalidad de cambio de contraseña estará disponible próximamente');
    this.showPasswordSection = false;
    this.passwordForm.reset();
    
    /* TODO: Implementar endpoint en el backend para cambio de contraseña
    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(this.currentUser.id, currentPassword, newPassword).subscribe({
      next: () => {
        this.notificationService.showSuccess('Contraseña actualizada correctamente');
        this.passwordForm.reset();
        this.showPasswordSection = false;
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al actualizar la contraseña');
        this.loading = false;
      }
    });
    */
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  onDeleteAccount(): void {
    if (!this.currentUser) return;

    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    this.loading = true;
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.notificationService.showSuccess('Cuenta eliminada correctamente');
        this.authService.logout();
      },
      error: () => {
        this.notificationService.showError('Error al eliminar la cuenta');
        this.loading = false;
      }
    });
  }
}
