import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Animal } from '../../shared/models/animal.model';
import { HydratedGroup } from '../../shared/models/group.model';
import { User } from '../../shared/models/user.model';

import { AnimalService } from '../../shared/services/animal.service';
import { GroupService } from '../../shared/services/group.service';
import { PelajeService } from '../../shared/services/pelaje.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

import { AnimalListComponent } from './components/animal-list/animal-list.component';
import { AnimalFormComponent } from './components/animal-form/animal-form.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-animales',
  standalone: true,
  imports: [CommonModule, AnimalListComponent, AnimalFormComponent, ModalComponent],
  templateUrl: './animales.component.html',
})
export class AnimalesComponent implements OnInit {
  private animalService = inject(AnimalService);
  private groupService = inject(GroupService);
  private pelajeService = inject(PelajeService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // --- Estado de la Vista ---
  public animales$!: Observable<Animal[]>;
  public userGroups$!: Observable<HydratedGroup[]>;
  public pelajes$!: Observable<string[]>;
  
  public totalAnimales = 0;
  public currentUser!: User;
  
  // --- Filtros ---
  private filterSubject = new BehaviorSubject<{ page: number, groupId: string | null }>({ page: 1, groupId: null });
  public selectedGroupId: string | null = null;
  
  // --- Modal ---
  public isModalOpen = false;
  public selectedAnimal: Animal | null = null;
  public possibleOwners: { id: string, nombre: string }[] = [];

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue!;
    this.userGroups$ = this.groupService.getMyGroups();
    this.pelajes$ = this.pelajeService.getPelajes();
    
    this.animales$ = this.filterSubject.pipe(
      switchMap(({ page, groupId }) => 
        this.animalService.getAnimales(page, 10, groupId).pipe(
          map(response => {
            this.totalAnimales = response.total;
            // La API debería devolver el nombre del dueño, si no, se necesitaría hidratación.
            return response.data;
          })
        )
      )
    );
  }

  // --- Manejo de Filtros ---
  selectFilter(groupId: string | null): void {
    this.selectedGroupId = groupId;
    this.filterSubject.next({ page: 1, groupId: this.selectedGroupId });
  }

  // --- Manejo de Modales y Formularios ---
  openModalParaCrear(groups: HydratedGroup[] | null): void {
    if (this.selectedGroupId) {
      const selectedGroup = groups?.find(g => g.id === this.selectedGroupId);
      this.possibleOwners = selectedGroup?.miembros.map(m => ({ id: m.userId, nombre: m.nombre })) || [];
    } else {
      this.possibleOwners = [{ id: this.currentUser.id, nombre: this.currentUser.nombre }];
    }
    
    this.selectedAnimal = null;
    this.isModalOpen = true;
  }

  onEditar(event: { animal: Animal, groups: HydratedGroup[] | null }): void {
    if (this.selectedGroupId) {
      const selectedGroup = event.groups?.find(g => g.id === this.selectedGroupId);
      this.possibleOwners = selectedGroup?.miembros.map(m => ({ id: m.userId, nombre: m.nombre })) || [];
    } else {
      this.possibleOwners = [{ id: this.currentUser.id, nombre: this.currentUser.nombre }];
    }

    this.selectedAnimal = event.animal;
    this.isModalOpen = true;
  }

  onSave(animalData: Partial<Animal>): void {
    const action = this.selectedAnimal
      ? this.animalService.updateAnimal(this.selectedAnimal.id, animalData)
      : this.animalService.createAnimal(animalData);

    action.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Animal guardado con éxito.`);
        this.filterSubject.next(this.filterSubject.getValue()); // Recarga los datos
        this.isModalOpen = false;
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Error al guardar el animal.')
    });
  }

  onEliminar(animalId: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este animal?')) return;
    
    this.animalService.deleteAnimal(animalId).subscribe({
      next: () => {
        this.notificationService.showSuccess('Animal eliminado con éxito.');
        this.filterSubject.next(this.filterSubject.getValue()); // Recarga los datos
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Error al eliminar el animal.')
    });
  }
}
