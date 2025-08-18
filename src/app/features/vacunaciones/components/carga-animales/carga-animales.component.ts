import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';
import { Campana } from '../../../../shared/models/campana.model';
import { HydratedGroup } from '../../../../shared/models/group.model';
import { AnimalService } from '../../../../shared/services/animal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnimalFormComponent } from '../../../animales/components/animal-form/animal-form.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GroupService } from '../../../../shared/services/group.service';
import { PelajeService } from '../../../../shared/services/pelaje.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-carga-animales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AnimalFormComponent, ModalComponent],
  templateUrl: './carga-animales.component.html',
})
export class CargaAnimalesComponent implements OnInit, OnChanges {
  @Input() campana!: Partial<Campana>;
  @Input() contextGroupId: string | null = null;
  @Output() save = new EventEmitter<Animal[]>();
  @Output() cancel = new EventEmitter<void>();

  private animalService = inject(AnimalService);
  private groupService = inject(GroupService);
  private pelajeService = inject(PelajeService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  searchForm: FormGroup;
  todosLosAnimales: Animal[] = [];
  animalesDisponibles: Animal[] = [];
  animalesEnCampana: Animal[] = [];
  
  possibleOwners: { id: string, nombre: string }[] = [];
  pelajes: string[] = [];
  
  isAnimalFormOpen = false;

  constructor() {
    this.searchForm = this.fb.group({
      caravana: [''],
      duenoId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAnimalsForContext();
    this.pelajeService.getPelajes().subscribe(p => this.pelajes = p);
    this.searchForm.valueChanges.subscribe(() => this.filtrarAnimalesDisponibles());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contextGroupId']) {
      this.loadAnimalsForContext();
    }
  }

  loadAnimalsForContext(): void {
    this.animalService.getAnimales(1, 1000, this.contextGroupId).subscribe(response => {
      this.todosLosAnimales = response.data;
      this.setPossibleOwners();
      this.inicializarListas();
      this.filtrarAnimalesDisponibles();
    });
  }

  private setPossibleOwners(): void {
    if (this.contextGroupId) {
      this.groupService.findOne(this.contextGroupId).subscribe(group => {
          // CORRECCIÓN: Se verifica que 'group.miembros' exista antes de mapearlo.
          this.possibleOwners = group?.miembros?.map(m => ({ id: m.userId, nombre: m.nombre })) || [];
        });
    } else {
      const currentUser = this.authService.currentUserValue!;
      this.possibleOwners = [{ id: currentUser.id, nombre: currentUser.nombre }];
    }
  }

  private inicializarListas(): void {
    if (this.campana && this.campana.animales) {
        this.animalesEnCampana = [...this.campana.animales];
    } else {
        this.animalesEnCampana = [];
    }
  }

  private filtrarAnimalesDisponibles(): void {
    const { caravana, duenoId } = this.searchForm.value;
    const idsEnCampana = new Set(this.animalesEnCampana.map(a => a.id));

    this.animalesDisponibles = this.todosLosAnimales.filter(animal => {
      if (idsEnCampana.has(animal.id)) return false;
      const matchCaravana = !caravana || animal.caravana?.toLowerCase().includes(caravana.toLowerCase());
      const matchDueno = !duenoId || animal.duenoId === duenoId;
      return matchCaravana && matchDueno;
    });
  }

  agregarAnimal(animal: Animal): void {
    this.animalesEnCampana.push(animal);
    this.filtrarAnimalesDisponibles();
  }

  quitarAnimal(animal: Animal): void {
    this.animalesEnCampana = this.animalesEnCampana.filter(a => a.id !== animal.id);
    this.filtrarAnimalesDisponibles();
  }

  onSaveNewAnimal(animalData: Partial<Animal>): void {
    this.animalService.createAnimal(animalData).subscribe(newAnimal => {
      this.notificationService.showSuccess(`Animal ${newAnimal.caravana || ''} creado y agregado.`);
      this.loadAnimalsForContext();
      this.isAnimalFormOpen = false;
    });
  }

  finalizarCarga(): void {
    this.save.emit(this.animalesEnCampana);
  }
}