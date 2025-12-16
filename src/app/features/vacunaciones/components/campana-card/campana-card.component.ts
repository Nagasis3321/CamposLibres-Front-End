import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Campana } from '../../../../shared/models/campana.model';

@Component({
  selector: 'app-campana-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campana-card.component.html',
  styleUrls: ['./campana-card.component.css']
})
export class CampanaCardComponent {
  @Input() campana!: Campana;
  @Output() verCarga = new EventEmitter<Campana>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() verDetalle = new EventEmitter<Campana>();

  // Función para determinar el estado basado en si tiene animales o no
  getEstado(): { texto: string, clase: string } {
    if (this.campana.animales && this.campana.animales.length > 0) {
      return { texto: 'Completada', clase: 'bg-green-200 text-green-800' };
    }
    return { texto: 'Pendiente Carga', clase: 'bg-yellow-200 text-yellow-800' };
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation(); // Evita que otros eventos (como la navegación) se disparen
    this.eliminar.emit();
  }
}