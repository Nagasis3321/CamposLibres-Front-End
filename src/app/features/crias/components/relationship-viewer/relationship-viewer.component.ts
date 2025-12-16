import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../../../../shared/models/animal.model';

interface RelacionFamiliar {
  madre: Animal;
  crias: Animal[];
}

@Component({
  selector: 'app-relationship-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relationship-viewer.component.html',
  styleUrls: ['./relationship-viewer.component.css']
})
export class RelationshipViewerComponent implements OnChanges {
  @Input() animalConsultado: Animal | null = null;
  @Input() todosLosAnimales: Animal[] = [];
  @Output() editRelationshipRequest = new EventEmitter<Animal>();
  // --- EVENTO AÑADIDO ---
  @Output() deleteRelationshipRequest = new EventEmitter<Animal>();

  madre: Animal | null = null;
  hermanos: Animal[] = [];
  crias: Animal[] = [];
  todasLasRelaciones: RelacionFamiliar[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animalConsultado'] || changes['todosLosAnimales']) {
      this.encontrarRelaciones();
    }
  }

  private encontrarRelaciones(): void {
    this.madre = null;
    this.hermanos = [];
    this.crias = [];
    this.todasLasRelaciones = [];

    if (this.todosLosAnimales.length === 0) return;

    if (this.animalConsultado) {
      if (this.animalConsultado.idMadre) {
        this.madre = this.todosLosAnimales.find(a => a.id === this.animalConsultado!.idMadre) || null;
        this.hermanos = this.todosLosAnimales.filter(
          a => a.idMadre === this.animalConsultado!.idMadre && a.id !== this.animalConsultado!.id
        );
      }
      if (this.animalConsultado.sexo === 'Hembra') {
        this.crias = this.todosLosAnimales.filter(a => a.idMadre === this.animalConsultado!.id);
      }
    } else {
      const madres = this.todosLosAnimales.filter(a => a.sexo === 'Hembra');
      madres.forEach(madre => {
        const criasDeEstaMadre = this.todosLosAnimales.filter(cria => cria.idMadre === madre.id);
        if (criasDeEstaMadre.length > 0) {
          this.todasLasRelaciones.push({ madre: madre, crias: criasDeEstaMadre });
        }
      });
    }
  }
}
