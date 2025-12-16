// =========================================================================
// ARCHIVO: src/app/features/auth/login/login.component.ts
// MODIFICADO: Se eliminan los valores hardcodeados del formulario para
// que tome los datos ingresados por el usuario.
// =========================================================================
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    // *** CORRECCIÓN AQUÍ ***
    // Los campos ahora se inicializan vacíos, listos para la entrada del usuario.
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Muestra los errores si se intenta enviar vacío
      return;
    }
    this.isLoading = true;
    this.error = null;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      // El 'next' observer no es necesario aquí porque la redirección
      // la maneja el servicio en caso de éxito.
      error: (err) => {
        // La API puede devolver un objeto de error, así que buscamos el mensaje.
        this.error = err.error?.message || err.message || 'Error desconocido al iniciar sesión.';
        this.isLoading = false;
      }
    });
  }

  createDemoUser(): void {
    this.isLoading = true;
    this.error = null;
    this.authService.createDemoUserAndLogin().subscribe({
      error: (err) => {
        this.error = 'No se pudo crear el usuario demo.';
        this.isLoading = false;
      }
    });
  }

  onForgotPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.error = 'Por favor, ingresa tu email primero.';
      return;
    }
    
    // Por ahora, mostramos un mensaje informativo
    // En el futuro, esto podría llamar a un servicio de recuperación de contraseña
    alert(`Se enviará un enlace de recuperación de contraseña a: ${email}\n\nNota: Esta funcionalidad está en desarrollo.`);
  }
}
