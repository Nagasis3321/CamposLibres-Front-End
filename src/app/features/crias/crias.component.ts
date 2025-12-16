import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../shared/models/animal.model';
import { AnimalService } from '../../shared/services/animal.service';
import { NotificationService } from '../../core/services/notification.service';
import { RelationshipViewerComponent } from './components/relationship-viewer/relationship-viewer.component';
import { CriaFormComponent } from './components/cria-form/cria-form.component';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EditRelationshipFormComponent } from './components/edit-relationship-form/edit-relationship-form.component';
import { PelajeService } from '../../shared/services/pelaje.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-crias',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RelationshipViewerComponent,
    CriaFormComponent,
    ModalComponent,
    EditRelationshipFormComponent 
  ],
  templateUrl: './crias.component.html',
})
export class CriasComponent implements OnInit {
  private animalService = inject(AnimalService);
  private pelajeService = inject(PelajeService); 
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

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
      animalesResponse: this.animalService.getAnimales(1, 1000), 
      pelajes: this.pelajeService.getPelajes(),
    }).subscribe(data => {
      this.todosLosAnimales = data.animalesResponse.data;
      this.allFemaleAnimals = data.animalesResponse.data.filter(a => a.sexo === 'Hembra');
      this.pelajes = data.pelajes;
    });
  }
  
  buscarAnimal(): void {
    const searchTerm = this.searchControl.value?.trim().toLowerCase();
    
    if (!searchTerm) {
      this.animalConsultado = null;
      this.notificationService.showInfo('Mostrando todas las relaciones familiares.');
      return;
    }

    const encontrado = this.todosLosAnimales.find(
      a => a.caravana?.toLowerCase() === searchTerm
    );

    if (encontrado) {
      this.animalConsultado = encontrado;
    } else {
      this.animalConsultado = null;
      this.notificationService.showError(`No se encontró animal con la caravana "${searchTerm}".`);
    }
  }

  onSaveCria(event: { motherId: string | null, fatherId: string | null, criaData: Partial<Animal> | null, selectedCriaId: string | null }): void {
    if (!event.motherId && !event.fatherId) {
      this.notificationService.showError('Se debe seleccionar al menos un padre o una madre.');
      return;
    }

    if (event.criaData) {
      this.animalService.createAnimal(event.criaData).pipe(
        switchMap(newCria => {
          this.notificationService.showSuccess(`Nueva cría "${newCria.caravana || 'S/C'}" creada con éxito.`);
          return this.animalService.updateAnimalRelations(newCria.id, {
            idMadre: event.motherId,
            idPadre: event.fatherId
          });
        })
      ).subscribe({
        next: (updatedCria) => {
          this.notificationService.showSuccess(`Relación familiar de "${updatedCria.caravana || 'S/C'}" guardada correctamente.`);
          this.isCriaModalOpen = false;
          this.loadInitialData();
        },
        error: (err) => {
          const errorMessage = Array.isArray(err.error?.message) ? err.error.message.join('. ') : err.error?.message;
          this.notificationService.showError(errorMessage || 'Error al guardar la relación.');
        }
      });
    }
    else if (event.selectedCriaId) {
      this.animalService.updateAnimalRelations(event.selectedCriaId, {
        idMadre: event.motherId,
        idPadre: event.fatherId
      }).subscribe({
        next: (updatedCria) => {
          this.notificationService.showSuccess(`Relación familiar de "${updatedCria.caravana || 'S/C'}" actualizada con éxito.`);
          this.isCriaModalOpen = false;
          this.loadInitialData();
        },
        error: (err) => {
          const errorMessage = Array.isArray(err.error?.message) ? err.error.message.join('. ') : err.error?.message;
          this.notificationService.showError(errorMessage || 'Error al actualizar la relación.');
        }
      });
    } else {
      this.notificationService.showError('No se proporcionaron datos de la cría para guardar la relación.');
    }
  }

  onEditRelationshipRequest(animal: Animal): void {
    this.animalToEditRelationship = animal;
    this.isEditRelationshipModalOpen = true;
  }

  onSaveRelationship(event: { animalId: string, newMotherId: string | null }): void {
    this.animalService.updateAnimalRelations(event.animalId, { idMadre: event.newMotherId })
      .subscribe((updatedAnimal) => {
        this.notificationService.showSuccess(`Relación de ${updatedAnimal.caravana || 'la cría'} actualizada.`);
        this.isEditRelationshipModalOpen = false;
        this.animalToEditRelationship = null;
        this.loadInitialData();
    });
  }

  /**
   * FUNCIÓN CORREGIDA: Maneja la eliminación de una relación madre-cría.
   * Actualiza el estado local en lugar de recargar todos los datos para evitar race conditions.
   */
  onDeleteRelationship(cria: Animal): void {
    this.animalService.updateAnimalRelations(cria.id, { idMadre: null })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Relación eliminada con éxito.');
          
          // Actualizamos la lista de animales localmente
          const index = this.todosLosAnimales.findIndex(a => a.id === cria.id);
          if (index > -1) {
            // Creamos una nueva copia del animal con la relación eliminada
            const updatedAnimal = { ...this.todosLosAnimales[index], idMadre: null };
            // Reemplazamos el animal viejo por el nuevo en la lista
            this.todosLosAnimales[index] = updatedAnimal;
            // Creamos una nueva referencia del array para forzar la detección de cambios en Angular
            this.todosLosAnimales = [...this.todosLosAnimales];
          }
        },
        error: (err) => {
          const errorMessage = Array.isArray(err.error?.message) ? err.error.message.join('. ') : err.error?.message;
          this.notificationService.showError(errorMessage || 'Error al eliminar la relación.');
        }
      });
  }
}
