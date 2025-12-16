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
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
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

  animal: Animal | null = null;
  loading = true;

  // Modales
  isVaccinationModalOpen = false;
  isStateModalOpen = false;
  isBirthModalOpen = false;
  isHistoryModalOpen = false;

  ngOnInit(): void {
    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.loadAnimal(animalId);
    }
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

  goBack(): void {
    this.router.navigate(['/animales']);
  }

  editAnimal(): void {
    if (this.animal) {
      this.router.navigate(['/animales'], { queryParams: { edit: this.animal.id } });
    }
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

  onSaveHistory(data: { titulo: string; descripcion?: string; fecha: string; tipo: HistoryType }): void {
    if (!this.animal) return;

    const historyData: CreateAnimalHistoryDto = {
      animalId: this.animal.id,
      ...data,
    };

    this.historyService.createHistory(historyData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Registro de historial creado correctamente.');
        this.isHistoryModalOpen = false;
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Error al crear registro de historial.');
      }
    });
  }

  closeModals(): void {
    this.isVaccinationModalOpen = false;
    this.isStateModalOpen = false;
    this.isBirthModalOpen = false;
    this.isHistoryModalOpen = false;
  }
}

