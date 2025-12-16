import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  @Input() users: User[] = [];
  @Output() editar = new EventEmitter<User>();
  @Output() eliminar = new EventEmitter<User>();
  @Output() verDetalle = new EventEmitter<User>();

  onEditar(user: User): void {
    this.editar.emit(user);
  }

  onEliminar(user: User): void {
    this.eliminar.emit(user);
  }

  onVerDetalle(user: User): void {
    this.verDetalle.emit(user);
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

