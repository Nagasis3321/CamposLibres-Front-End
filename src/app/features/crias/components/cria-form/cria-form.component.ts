import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-cria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cria-form.component.html',
  styleUrls: ['./cria-form.component.css']
})
export class CriaFormComponent {
  @Input() todosLosAnimales: Animal[] = [];
  @Input() pelajes: string[] = [];
  @Output() save = new EventEmitter<Partial<Animal>>();
  @Output() cancel = new EventEmitter<void>();

  criaForm: FormGroup;
  madreEncontrada: Animal | null = null;
  errorBusquedaMadre: string | null = null;
  posiblesMadres: Animal[] = []; // Almacena la lista de madres para seleccionar

  private fb = inject(FormBuilder);

  constructor() {
    this.criaForm = this.fb.group({
      caravanaMadre: ['', Validators.required],
      idMadre: [null, Validators.required],
      caravana: [''],
      pelaje: ['', Validators.required],
      sexo: ['Hembra', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: [''],
    });
  }

  buscarMadre(): void {
    const caravanaMadre = this.criaForm.get('caravanaMadre')?.value.trim().toLowerCase();
    this.madreEncontrada = null;
    this.errorBusquedaMadre = null;
    this.criaForm.get('idMadre')?.reset();
    this.posiblesMadres = [];

    // Si la búsqueda está vacía, muestra todas las madres posibles.
    if (!caravanaMadre) {
      this.posiblesMadres = this.todosLosAnimales.filter(a => a.sexo === 'Hembra');
      if (this.posiblesMadres.length === 0) {
        this.errorBusquedaMadre = 'No se encontraron animales hembra en el sistema.';
      }
      return;
    }

    // Si hay texto, busca una coincidencia exacta.
    const madre = this.todosLosAnimales.find(
      a => a.sexo === 'Hembra' && a.caravana?.toLowerCase() === caravanaMadre
    );

    if (madre) {
      this.seleccionarMadre(madre);
    } else {
      this.errorBusquedaMadre = 'No se encontró una madre con esa caravana.';
    }
  }

  // Método para manejar la selección de una madre de la lista.
  seleccionarMadre(madre: Animal): void {
    this.madreEncontrada = madre;
    this.criaForm.get('idMadre')?.setValue(madre.id);
    this.criaForm.get('caravanaMadre')?.setValue(madre.caravana);
    this.posiblesMadres = []; // Oculta la lista después de seleccionar
    this.errorBusquedaMadre = null;
  }

  onSubmit(): void {
    this.criaForm.markAllAsTouched();
    if (this.criaForm.invalid) {
      return;
    }
    
    const { caravanaMadre, ...animalData } = this.criaForm.value;

    const nuevaCria: Partial<Animal> = {
      ...animalData,
      tipoAnimal: 'Ternero/a',
      dueno: this.madreEncontrada?.dueno
    };

    this.save.emit(nuevaCria);
  }
}
