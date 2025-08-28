import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-edit-relationship-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-relationship-form.component.html',
})
export class EditRelationshipFormComponent implements OnInit {
  @Input() animalToEdit!: Animal;
  @Input() allFemaleAnimals: Animal[] = [];
  @Output() save = new EventEmitter<{ animalId: string, newMotherId: string | null }>();
  @Output() cancel = new EventEmitter<void>();

  searchForm: FormGroup;
  currentMother: Animal | null = null;
  possibleMothers: Animal[] = [];
  selectedNewMother: Animal | null = null;

  private fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      motherSearch: [''],
    });
  }

  ngOnInit(): void {
    if (this.animalToEdit.idMadre) {
      this.currentMother = this.allFemaleAnimals.find(a => a.id === this.animalToEdit.idMadre) || null;
    }
    this.searchMothers(); // Hacemos una búsqueda inicial para poblar la lista
  }

  searchMothers(): void {
    const searchTerm = this.searchForm.get('motherSearch')?.value.trim().toLowerCase() || '';
    this.possibleMothers = this.allFemaleAnimals.filter(
      a => a.id !== this.animalToEdit.id && // No puede ser su propia madre
           (a.caravana?.toLowerCase().includes(searchTerm) || a.pelaje.toLowerCase().includes(searchTerm))
    );
  }

  selectMother(mother: Animal): void {
    this.selectedNewMother = mother;
    this.searchForm.get('motherSearch')?.setValue(`${mother.caravana} - ${mother.pelaje}`);
    this.possibleMothers = []; // Ocultamos la lista después de seleccionar
  }

  /**
   * FUNCIÓN CORREGIDA: Maneja la eliminación de la madre actual.
   * Se elimina la confirmación nativa que es bloqueada en este entorno.
   * Emite el evento de guardado con un ID nulo para la madre directamente.
   */
  removeCurrentMother(): void {
    this.save.emit({
      animalId: this.animalToEdit.id,
      newMotherId: null
    });
  }

  onSubmit(): void {
    // Solo emitimos si se ha seleccionado una nueva madre.
    // La eliminación se maneja con el botón 'removeCurrentMother'.
    if (this.selectedNewMother) {
      this.save.emit({
        animalId: this.animalToEdit.id,
        newMotherId: this.selectedNewMother.id
      });
    }
  }
}
