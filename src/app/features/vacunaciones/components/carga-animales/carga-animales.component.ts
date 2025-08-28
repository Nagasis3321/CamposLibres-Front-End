import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';
import { Campana } from '../../../../shared/models/campana.model';
import { AnimalService } from '../../../../shared/services/animal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnimalFormComponent } from '../../../animales/components/animal-form/animal-form.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { GroupService } from '../../../../shared/services/group.service';
import { PelajeService } from '../../../../shared/services/pelaje.service';
import { AuthService } from '../../../../core/services/auth.service';

type DisplayItem = Animal | { type: 'marca'; id: number };

@Component({
  selector: 'app-carga-animales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AnimalFormComponent, ModalComponent],
  templateUrl: './carga-animales.component.html',
})
export class CargaAnimalesComponent implements OnInit, OnChanges {
  @Input() campana!: Partial<Campana>;
  @Input() contextGroupId: string | null = null;
  @Input() animalesIniciales: Animal[] = [];
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
  listaVisual: DisplayItem[] = [];

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
          this.possibleOwners = group?.miembros?.map(m => ({ id: m.userId, nombre: m.nombre })) || [];
        });
    } else {
      const currentUser = this.authService.currentUserValue!;
      this.possibleOwners = [{ id: currentUser.id, nombre: currentUser.nombre }];
    }
  }

  private inicializarListas(): void {
    if (this.animalesIniciales && this.animalesIniciales.length > 0) {
      this.animalesEnCampana = [...this.animalesIniciales];
    } 
    else if (this.campana && this.campana.animales) {
      this.animalesEnCampana = [...this.campana.animales];
    } else {
      this.animalesEnCampana = [];
    }
    this.listaVisual = [...this.animalesEnCampana];
  }

  private filtrarAnimalesDisponibles(): void {
    const idsEnCampana = new Set(this.animalesEnCampana.map(a => a.id));
    const { caravana, duenoId } = this.searchForm.value;

    this.animalesDisponibles = this.todosLosAnimales.filter(animal => {
      if (idsEnCampana.has(animal.id)) return false;
      const matchCaravana = !caravana || animal.caravana?.toLowerCase().includes(caravana.toLowerCase());
      const matchDueno = !duenoId || animal.duenoId === duenoId;
      return matchCaravana && matchDueno;
    });
  }

  agregarAnimal(animal: Animal): void {
    this.animalesEnCampana.unshift(animal);
    this.listaVisual.unshift(animal);
    this.filtrarAnimalesDisponibles();
  }

  agregarMarcaDeCarga(): void {
    this.listaVisual.unshift({ type: 'marca', id: Date.now() });
  }

  quitarItem(index: number): void {
    const item = this.listaVisual[index];
    
    if (this.isAnimal(item)) {
      this.animalesEnCampana = this.animalesEnCampana.filter(a => a.id !== item.id);
    }
    
    this.listaVisual.splice(index, 1);
    this.filtrarAnimalesDisponibles(); // Vuelve a filtrar para que el animal quitado aparezca como disponible
  }
  
  /**
   * NUEVO: Borra todos los animales y marcas de la carga actual.
   */
  borrarTodos(): void {
    this.animalesEnCampana = [];
    this.listaVisual = [];
    this.filtrarAnimalesDisponibles(); // Actualiza la lista de disponibles
  }

  onSaveNewAnimal(animalData: Partial<Animal>): void {
    this.animalService.createAnimal(animalData).subscribe(newAnimal => {
      this.notificationService.showSuccess(`Animal ${newAnimal.caravana || ''} creado y agregado.`);
      this.todosLosAnimales.push(newAnimal);
      this.agregarAnimal(newAnimal);
      this.isAnimalFormOpen = false;
    });
  }

  finalizarCarga(): void {
    this.save.emit(this.animalesEnCampana);
  }

  isAnimal(item: DisplayItem): item is Animal {
    return 'caravana' in item;
  }

  isMarca(item: DisplayItem): item is { type: 'marca'; id: number } {
    return 'type' in item && item.type === 'marca';
  }
}