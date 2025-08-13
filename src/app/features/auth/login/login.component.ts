import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router'; // Importar RouterModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Añadir RouterModule
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['admin@camposlibres.com', [Validators.required, Validators.email]],
      password: ['admin', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.error = null;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      error: (err) => {
        this.error = err.message;
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
}