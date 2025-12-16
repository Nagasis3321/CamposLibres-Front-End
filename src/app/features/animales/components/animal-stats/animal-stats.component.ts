import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../../../../shared/models/animal.model';

// Interfaz para estandarizar el formato de las estadísticas
interface StatItem {
  name: string;
  count: number;
}

@Component({
  selector: 'app-animal-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-stats.component.html',
})
export class AnimalStatsComponent implements OnChanges {
  @Input() animales: Animal[] = [];

  statsPorTipo: StatItem[] = [];
  statsPorDueno: StatItem[] = [];

  // Se ejecuta cada vez que la lista de animales de entrada cambia.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animales']) {
      this.calcularEstadisticas();
    }
  }

  private calcularEstadisticas(): void {
    if (!this.animales) {
        this.statsPorTipo = [];
        this.statsPorDueno = [];
        return;
    }
    // Calcula las estadísticas por tipo de animal
    const tipoMap = this.animales.reduce((acc, animal) => {
      acc.set(animal.tipoAnimal, (acc.get(animal.tipoAnimal) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    this.statsPorTipo = Array.from(tipoMap, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Ordena de mayor a menor

    // Calcula las estadísticas por dueño
    const duenoMap = this.animales.reduce((acc, animal) => {
      const duenoNombre = animal.dueno?.nombre || 'Desconocido';
      acc.set(duenoNombre, (acc.get(duenoNombre) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    this.statsPorDueno = Array.from(duenoMap, ([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Ordena de mayor a menor
  }
}