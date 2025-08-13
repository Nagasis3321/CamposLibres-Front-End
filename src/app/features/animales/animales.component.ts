import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';

import { AnimalService } from '../../shared/services/animal.service';
import { Animal } from '../../shared/models/animal.model';

import { AnimalListComponent } from './components/animal-list/animal-list.component';
import { AnimalFormComponent } from './components/animal-form/animal-form.component';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-animales',
  standalone: true,
  imports: [
    CommonModule,
    AnimalListComponent,
    AnimalFormComponent,
    ModalComponent
  ],
  templateUrl: './animales.component.html',
  styleUrls: ['./animales.component.css']
})
export class AnimalesComponent implements OnInit {
  private animalService = inject(AnimalService);
  private notificationService = inject(NotificationService);

  public animales$!: Observable<Animal[]>;
  public pelajes: string[] = [];
  public duenos: string[] = [];

  public isModalOpen = false;
  public selectedAnimal: Animal | null = null;
  public modalTitle = '';

  ngOnInit(): void {
    this.loadAnimales();
    // Cargamos las listas para los dropdowns del formulario.
    forkJoin({
      pelajes: this.animalService.getPelajes(),
      duenos: this.animalService.getDuenos()
    }).subscribe(data => {
      this.pelajes = data.pelajes;
      this.duenos = data.duenos;
    });
  }

  loadAnimales(): void {
    this.animales$ = this.animalService.getAnimales();
  }

  openModalParaCrear(): void {
    this.selectedAnimal = null;
    this.modalTitle = 'Registrar Nuevo Animal';
    this.isModalOpen = true;
  }

  onEditar(animal: Animal): void {
    this.selectedAnimal = animal;
    this.modalTitle = `Editar Animal: ${animal.caravana || 'Sin Caravana'}`;
    this.isModalOpen = true;
    this.notificationService.showInfo(`Cargando datos para editar a ${animal.caravana || 'un animal'}.`);
  }

  onEliminar(id: string): void {
    this.notificationService.showSuccess(`Animal con ID ${id} eliminado (simulado).`);
  }

  onSave(animal: Animal): void {
    if (animal.id) {
      this.notificationService.showSuccess(`Animal ${animal.caravana || ''} actualizado con éxito (simulado).`);
    } else {
      this.notificationService.showSuccess(`Nuevo animal creado con éxito (simulado).`);
    }
    this.closeModal();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAnimal = null;
  }
}
