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
    // ... (lógica de guardado sin cambios)
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
}