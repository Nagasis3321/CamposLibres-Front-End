import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';
import { Campana } from '../../../../shared/models/campana.model';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-carga-animales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carga-animales.component.html',
  styleUrls: ['./carga-animales.component.css']
})
export class CargaAnimalesComponent implements OnChanges {
  @Input() campana: Campana | null = null;
  @Input() todosLosAnimales: Animal[] = [];
  @Output() save = new EventEmitter<Animal[]>();
  @Output() cancel = new EventEmitter<void>();

  searchForm: FormGroup;
  animalesDisponibles: Animal[] = [];
  animalesEnCampana: Animal[] = [];
  
  // Para el autocompletado de pelaje
  pelajesSugeridos$: Observable<string[]>;
  mostrarSugerenciasPelaje = false;
  
  // Para el dropdown de dueños
  duenosUnicos: string[] = [];

  private fb = inject(FormBuilder);

  constructor() {
    this.searchForm = this.fb.group({
      caravana: [''],
      tipoAnimal: [''],
      sexo: [''],
      pelaje: [''],
      dueno: [''] // Nuevo campo de búsqueda
    });

    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.filtrarAnimales());
    
    this.pelajesSugeridos$ = this.searchForm.get('pelaje')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarPelajes(value || ''))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todosLosAnimales'] && this.todosLosAnimales.length > 0) {
      this.duenosUnicos = [...new Set(this.todosLosAnimales.map(a => a['dueno']).filter(Boolean) as string[])];
    }
    if (changes['campana'] || changes['todosLosAnimales']) {
      this.inicializarListas();
      this.filtrarAnimales();
    }
  }

  private inicializarListas(): void {
    if (!this.campana) return;
    this.animalesEnCampana = this.todosLosAnimales.filter(animal => 
      this.campana!.animalesAgregados.some(agregado => agregado.id === animal.id)
    );
  }

  private filtrarAnimales(): void {
    const { caravana, tipoAnimal, sexo, pelaje, dueno } = this.searchForm.value;
    const idsEnCampana = new Set(this.animalesEnCampana.map(a => a.id));

    this.animalesDisponibles = this.todosLosAnimales.filter(animal => {
      if (idsEnCampana.has(animal.id)) return false;

      const matchCaravana = !caravana || animal.caravana?.toLowerCase().includes(caravana.toLowerCase());
      const matchTipo = !tipoAnimal || animal.tipoAnimal === tipoAnimal;
      const matchSexo = !sexo || animal.sexo === sexo;
      const matchPelaje = !pelaje || animal.pelaje?.toLowerCase().includes(pelaje.toLowerCase());
      const matchDueno = !dueno || animal['dueno'] === dueno;

      return matchCaravana && matchTipo && matchSexo && matchPelaje && matchDueno;
    });
  }

  private _filtrarPelajes(valor: string): string[] {
    const valorFiltrado = valor.toLowerCase();
    const todosLosPelajes = [...new Set(this.todosLosAnimales.map(a => a.pelaje).filter(Boolean) as string[])];
    return todosLosPelajes.filter(p => p.toLowerCase().includes(valorFiltrado));
  }

  seleccionarPelaje(pelaje: string): void {
    this.searchForm.get('pelaje')?.setValue(pelaje);
    this.mostrarSugerenciasPelaje = false;
  }

  agregarAnimal(animal: Animal): void {
    this.animalesEnCampana.push(animal);
    this.filtrarAnimales();
  }

  quitarAnimal(animal: Animal): void {
    this.animalesEnCampana = this.animalesEnCampana.filter(a => a.id !== animal.id);
    this.filtrarAnimales();
  }

  finalizarCarga(): void {
    this.save.emit(this.animalesEnCampana);
  }
}
