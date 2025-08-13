import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Animal } from '../../../../shared/models/animal.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-list.component.html',
  styleUrl: './animal-list.component.css'
})
export class AnimalListComponent {
  // Input: Recibe la lista de animales desde el componente padre.
  @Input() animales: Animal[] = [];

  // Output: Emite un evento cuando se hace clic en el botón "Editar".
  @Output() editar = new EventEmitter<Animal>();

  // Output: Emite un evento con el ID del animal cuando se hace clic en "Eliminar".
  @Output() eliminar = new EventEmitter<string>();
}
