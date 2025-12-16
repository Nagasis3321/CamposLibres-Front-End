import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  @Input() user: User | null = null;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() save = new EventEmitter<Partial<User>>();
  @Output() cancel = new EventEmitter<void>();

  userForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      nombre: [this.user?.nombre || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      password: ['', this.mode === 'create' ? [Validators.required, Validators.minLength(8)] : []],
    });

    if (this.mode === 'edit') {
      // En modo edición, la contraseña es opcional
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // Si estamos editando y no se proporcionó contraseña, no la incluimos
      if (this.mode === 'edit' && !formValue.password) {
        delete formValue.password;
      }

      this.save.emit(formValue);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get nombre() { return this.userForm.get('nombre'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
}

