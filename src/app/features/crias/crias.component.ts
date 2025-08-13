import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../shared/models/animal.model';
import { AnimalService } from '../../shared/services/animal.service';
import { NotificationService } from '../../core/services/notification.service';
import { RelationshipViewerComponent } from './components/relationship-viewer/relationship-viewer.component';
import { CriaFormComponent } from './components/cria-form/cria-form.component';
import { forkJoin } from 'rxjs';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EditRelationshipFormComponent } from './components/edit-relationship-form/edit-relationship-form.component';

@Component({
  selector: 'app-crias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RelationshipViewerComponent,
    CriaFormComponent,
    ModalComponent,
    EditRelationshipFormComponent // <-- NUEVO
  ],
  templateUrl: './crias.component.html',
})
export class CriasComponent implements OnInit {
  private animalService = inject(AnimalService);
  private notificationService = inject(NotificationService);

  todosLosAnimales: Animal[] = [];
  allFemaleAnimals: Animal[] = [];
  pelajes: string[] = [];
  animalConsultado: Animal | null = null;
  searchControl = new FormControl('');
  
  isCriaModalOpen = false;
  isEditRelationshipModalOpen = false;
  animalToEditRelationship: Animal | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }
  
  loadInitialData(): void {
    forkJoin({
      animales: this.animalService.getAnimales(),
      pelajes: this.animalService.getPelajes(),
    }).subscribe(data => {
      this.todosLosAnimales = data.animales;
      this.allFemaleAnimals = data.animales.filter(a => a.sexo === 'Hembra');
      this.pelajes = data.pelajes;
    });
  }

  buscarAnimal(): void {
    // ... (sin cambios)
  }

  onSaveCria(nuevaCria: Partial<Animal>): void {
    this.notificationService.showSuccess('Nueva cría registrada (simulado).');
    this.isCriaModalOpen = false;
    // this.loadInitialData(); // Recargar datos en una app real
  }

  onEditRelationshipRequest(animal: Animal): void {
    this.animalToEditRelationship = animal;
    this.isEditRelationshipModalOpen = true;
  }

  onSaveRelationship(event: { animalId: string, newMotherId: string | null }): void {
    this.animalService.updateAnimalMother(event.animalId, event.newMotherId).subscribe(updatedAnimal => {
      this.notificationService.showSuccess(`Relación de ${updatedAnimal.caravana || 'la cría'} actualizada.`);
      this.isEditRelationshipModalOpen = false;
      this.animalToEditRelationship = null;
      // Actualizamos la lista local para que la UI refleje el cambio al instante.
      const index = this.todosLosAnimales.findIndex(a => a.id === updatedAnimal.id);
      if (index > -1) {
        this.todosLosAnimales[index] = updatedAnimal;
        // Si el animal actualizado era el que se estaba consultando, lo refrescamos
        if (this.animalConsultado && this.animalConsultado.id === updatedAnimal.id) {
          this.animalConsultado = { ...updatedAnimal };
        }
      }
    });
  }
}
