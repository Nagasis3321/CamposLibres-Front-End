import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Animal } from '../../../../shared/models/animal.model';
import { AnimalService } from '../../../../shared/services/animal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnimalHistoryComponent } from '../animal-history/animal-history.component';
import { VaccinationFormComponent } from '../vaccination-form/vaccination-form.component';
import { AnimalStateFormComponent } from '../animal-state-form/animal-state-form.component';
import { BirthFormComponent } from '../birth-form/birth-form.component';
import { HistoryFormComponent } from '../history-form/history-form.component';
import { AnimalFormComponent } from '../animal-form/animal-form.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PelajeService } from '../../../../shared/services/pelaje.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { VaccinationService } from '../../../../shared/services/vaccination.service';
import { AnimalStateService } from '../../../../shared/services/animal-state.service';
import { BirthService } from '../../../../shared/services/birth.service';
import { AnimalHistoryService } from '../../../../shared/services/animal-history.service';
import { CreateVaccinationDto } from '../../../../shared/models/vaccination.model';
import { CreateAnimalStateDto } from '../../../../shared/models/animal-state.model';
import { CreateBirthDto } from '../../../../shared/models/birth.model';
import { CreateAnimalHistoryDto, HistoryType } from '../../../../shared/models/animal-history.model';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [
    CommonModule, 
    AnimalHistoryComponent,
    VaccinationFormComponent,
    AnimalStateFormComponent,
    BirthFormComponent,
    HistoryFormComponent,
    AnimalFormComponent,
    ModalComponent
  ],
  templateUrl: './animal-detail.component.html',
  styleUrl: './animal-detail.component.css'
})
export class AnimalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private animalService = inject(AnimalService);
  private notificationService = inject(NotificationService);
  private vaccinationService = inject(VaccinationService);
  private stateService = inject(AnimalStateService);
  private birthService = inject(BirthService);
  private historyService = inject(AnimalHistoryService);
  private pelajeService = inject(PelajeService);
  private authService = inject(AuthService);

  animal: Animal | null = null;
  loading = true;

  // Modales
  isVaccinationModalOpen = false;
  isStateModalOpen = false;
  isBirthModalOpen = false;
  isHistoryModalOpen = false;
  isEditModalOpen = false;

  // Datos para edición
  pelajes$!: Observable<string[]>;
  possibleOwners: { id: string, nombre: string }[] = [];
  
  // Para edición de historial
  editingHistoryId?: string;
  editingHistoryData?: { titulo: string; descripcion?: string; fecha: string; tipo: HistoryType };

  ngOnInit(): void {
    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.loadAnimal(animalId);
    }
    this.pelajes$ = this.pelajeService.getPelajes();
  }

  loadAnimal(id: string): void {
    this.loading = true;
    this.animalService.getAnimalById(id).subscribe({
      next: (animal) => {
        this.animal = animal;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar el animal.');
        this.router.navigate(['/animales']);
      }
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  hasInconsistentData(): boolean {
    if (!this.animal) return false;
    
    const tiposMacho = ['Toro', 'Novillo', 'Ternero'];
    const tiposHembra = ['Vaca', 'Vaquilla', 'Ternera'];
    
    if (this.animal.sexo === 'Macho' && !tiposMacho.includes(this.animal.tipoAnimal)) {
      return true;
    }
    
    if (this.animal.sexo === 'Hembra' && !tiposHembra.includes(this.animal.tipoAnimal)) {
      return true;
    }
    
    return false;
  }

  getInconsistencyMessage(): string {
    if (!this.animal) return '';
    
    const tiposMacho = ['Toro', 'Novillo', 'Ternero'];
    const tiposHembra = ['Vaca', 'Vaquilla', 'Ternera'];
    
    if (this.animal.sexo === 'Macho' && !tiposMacho.includes(this.animal.tipoAnimal)) {
      return `⚠️ INCONSISTENCIA: El animal es "${this.animal.tipoAnimal}" (tipo hembra) pero está marcado como "Macho". Debería ser: ${tiposMacho.join(', ')} para machos.`;
    }
    
    if (this.animal.sexo === 'Hembra' && !tiposHembra.includes(this.animal.tipoAnimal)) {
      return `⚠️ INCONSISTENCIA: El animal es "${this.animal.tipoAnimal}" (tipo macho) pero está marcado como "Hembra". Debería ser: ${tiposHembra.join(', ')} para hembras.`;
    }
    
    return '';
  }

  goBack(): void {
    this.router.navigate(['/animales']);
  }

  editAnimal(): void {
    if (this.animal) {
      const currentUser = this.authService.currentUserValue;
      if (currentUser) {
        this.possibleOwners = [{ id: currentUser.id, nombre: currentUser.nombre }];
      }
      this.isEditModalOpen = true;
    }
  }

  onSaveEdit(animalData: Partial<Animal>): void {
    if (!this.animal) return;

    const updatePayload = { ...animalData };
    delete updatePayload.id;
    delete updatePayload.duenoId;

    this.animalService.updateAnimal(this.animal.id, updatePayload).subscribe({
      next: (updatedAnimal) => {
        this.notificationService.showSuccess('Animal actualizado con éxito.');
        this.animal = updatedAnimal;
        this.isEditModalOpen = false;
      },
      error: (err) => {
        const errorMessage = Array.isArray(err.error?.message) 
          ? err.error.message.join('. ') 
          : err.error?.message;
        this.notificationService.showError(errorMessage || 'Error al actualizar el animal.');
      }
    });
  }

  openVaccinationModal(): void {
    this.isVaccinationModalOpen = true;
  }

  openStateModal(): void {
    this.isStateModalOpen = true;
  }

  openBirthModal(): void {
    this.isBirthModalOpen = true;
  }

  openHistoryModal(): void {
    this.isHistoryModalOpen = true;
  }

  onSaveVaccination(data: CreateVaccinationDto): void {
    this.vaccinationService.createVaccination(data).subscribe({
      next: () => {
        this.notificationService.showSuccess('Vacunación registrada correctamente.');
        this.isVaccinationModalOpen = false;
        // Recargar historial si está visible
        if (this.animal) {
          // El componente de historial se actualizará automáticamente
        }
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Error al registrar vacunación.');
      }
    });
  }

  onSaveState(data: CreateAnimalStateDto): void {
    this.stateService.createState(data).subscribe({
      next: () => {
        this.notificationService.showSuccess('Estado registrado correctamente.');
        this.isStateModalOpen = false;
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Error al registrar estado.');
      }
    });
  }

  onSaveBirth(data: CreateBirthDto): void {
    this.birthService.createBirth(data).subscribe({
      next: () => {
        this.notificationService.showSuccess('Parto registrado correctamente.');
        this.isBirthModalOpen = false;
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Error al registrar parto.');
      }
    });
  }

  onSaveHistory(data: { id?: string; titulo: string; descripcion?: string; fecha: string; tipo: HistoryType }): void {
    if (!this.animal) return;

    if (data.id) {
      // Edición
      const updateData = { ...data };
      delete updateData.id;
      
      this.historyService.updateHistory(data.id, updateData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Registro de historial actualizado correctamente.');
          this.isHistoryModalOpen = false;
          this.editingHistoryId = undefined;
          this.editingHistoryData = undefined;
          // Recargar historial
          if (this.animal) {
            this.loadAnimal(this.animal.id);
          }
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Error al actualizar registro de historial.');
        }
      });
    } else {
      // Creación
      const historyData: CreateAnimalHistoryDto = {
        animalId: this.animal.id,
        ...data,
      };

      this.historyService.createHistory(historyData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Registro de historial creado correctamente.');
          this.isHistoryModalOpen = false;
          // Recargar historial
          if (this.animal) {
            this.loadAnimal(this.animal.id);
          }
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Error al crear registro de historial.');
        }
      });
    }
  }

  onEditHistoryRequest(historyItem: any): void {
    this.editingHistoryId = historyItem.id;
    this.editingHistoryData = {
      titulo: historyItem.titulo,
      descripcion: historyItem.descripcion,
      fecha: historyItem.fecha.split('T')[0], // Formatear para input date
      tipo: historyItem.data?.historyType || 'OBSERVACION'
    };
    this.isHistoryModalOpen = true;
  }

  closeModals(): void {
    this.isVaccinationModalOpen = false;
    this.isStateModalOpen = false;
    this.isBirthModalOpen = false;
    this.isHistoryModalOpen = false;
    this.isEditModalOpen = false;
    this.editingHistoryId = undefined;
    this.editingHistoryData = undefined;
  }
}

