import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';
import { Observable, of } from 'rxjs';

export type SortableColumn = 'caravana' | 'tipoAnimal' | 'dueno' | 'pelaje' | 'sexo';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './animal-list.component.html',
})
export class AnimalListComponent implements OnInit, OnChanges {
  @Input() animales: Animal[] = [];
  // *** CORRECCIÓN 1: Mark as @Input and provide a default value. ***
  @Input() pelajes$: Observable<string[]> = of([]); 
  @Output() editar = new EventEmitter<Animal>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() verDetalle = new EventEmitter<Animal>();

  private fb = inject(FormBuilder);

  public searchForm: FormGroup;
  public displayedAnimales: Animal[] = [];
  public sortColumn: SortableColumn | null = null;
  public sortDirection: 'asc' | 'desc' = 'asc';
  public rowsVisible = 10;
  public rowsVisibleOptions = [10, 15, 20, 25, 30];

  constructor() {
    this.searchForm = this.fb.group({
      caravana: [''],
      pelaje: [''],
      tipoAnimal: ['']
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.processList();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animales']) {
      this.processList();
    }
  }

  private processList(): void {
    const filters = this.searchForm.value;
    
    let filtered = this.animales.filter(animal => {
      const matchCaravana = !filters.caravana || animal.caravana?.toLowerCase().includes(filters.caravana.toLowerCase());
      const matchPelaje = !filters.pelaje || animal.pelaje === filters.pelaje;
      const matchTipo = !filters.tipoAnimal || animal.tipoAnimal === filters.tipoAnimal;
      return matchCaravana && matchPelaje && matchTipo;
    });

    // *** CORRECCIÓN 2: Assign sortColumn to a local constant before sorting. ***
    const currentSortColumn = this.sortColumn;
    if (currentSortColumn) {
      filtered.sort((a, b) => {
        const isAsc = this.sortDirection === 'asc';
        
        if (currentSortColumn === 'sexo') {
          if (a.sexo === b.sexo) return 0;
          return isAsc ? (a.sexo === 'Macho' ? -1 : 1) : (a.sexo === 'Hembra' ? -1 : 1);
        }

        const valA = this.getPropertyForSorting(a, currentSortColumn);
        const valB = this.getPropertyForSorting(b, currentSortColumn);

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });
    }
    
    // Mostrar todos los animales filtrados (sin limitar)
    this.displayedAnimales = filtered;
  }

  getTableHeight(): string {
    // Altura aproximada: 60px por fila + headers
    const rowHeight = 60;
    const headerHeight = 50;
    return `${(this.rowsVisible * rowHeight) + headerHeight}px`;
  }
  private getPropertyForSorting(item: Animal, column: SortableColumn): any {
    if (column === 'dueno') {
      return item.dueno?.nombre?.toLowerCase() || '';
    }

    if (column === 'caravana') {
      // Intenta convertir la caravana a un número entero.
      const num = parseInt(item.caravana || '', 10);
      // Si no es un número válido (NaN), devuelve Infinity.
      // Esto asegura que los animales sin caravana se vayan al final de la lista.
      return isNaN(num) ? Infinity : num;
    }

    const prop = item[column as keyof Animal];
    return typeof prop === 'string' ? prop.toLowerCase() : prop;
  }
  requestSort(column: SortableColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.processList();
  }

  trackById(index: number, item: Animal): string {
    return item.id;
  }
}
