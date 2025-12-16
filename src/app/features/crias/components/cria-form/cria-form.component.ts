import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Animal } from '../../../../shared/models/animal.model';

type FormMode = 'create' | 'select';
type ParentType = 'madre' | 'padre';

@Component({
  selector: 'app-cria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cria-form.component.html',
})
export class CriaFormComponent implements OnInit {
  @Input() todosLosAnimales: Animal[] = [];
  @Input() pelajes: string[] = [];
  @Output() save = new EventEmitter<{ motherId: string | null, fatherId: string | null, criaData: Partial<Animal> | null, selectedCriaId: string | null }>();
  @Output() cancel = new EventEmitter<void>();

  criaForm: FormGroup;
  mode: FormMode = 'select';


  private fb = inject(FormBuilder);

  constructor() {
    this.criaForm = this.fb.group({
      cria: this.fb.group({
        caravana: [''],
        pelaje: [''],
        sexo: ['Hembra'],
        fechaNacimiento: [''],
        existingCriaId: [null, Validators.required]
      })
    });
  }

  parentSearchControl = this.fb.control('');
  searchResults: Animal[] = [];
  animalParaAsignar: Animal | null = null;
  madreSeleccionada: Animal | null = null;
  padreSeleccionado: Animal | null = null;
  

  ngOnInit(): void {
    this.setMode('select');
    this.buscarAnimales();
  }

  setMode(newMode: FormMode): void {
    this.mode = newMode;
    const criaGroup = this.criaForm.get('cria') as FormGroup;
    
    // Usamos setTimeout para evitar el error ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (newMode === 'create') {
        criaGroup.get('pelaje')?.setValidators([Validators.required]);
        criaGroup.get('sexo')?.setValidators([Validators.required]);
        criaGroup.get('fechaNacimiento')?.setValidators([Validators.required]);
        criaGroup.get('existingCriaId')?.clearValidators();
        criaGroup.get('existingCriaId')?.setValue(null);
      } else {
        criaGroup.get('pelaje')?.clearValidators();
        criaGroup.get('sexo')?.clearValidators();
        criaGroup.get('fechaNacimiento')?.clearValidators();
        criaGroup.get('existingCriaId')?.setValidators([Validators.required]);
      }
      criaGroup.updateValueAndValidity();
    });
  }

  buscarAnimales(): void {
    const searchTerm = this.parentSearchControl.value?.trim().toLowerCase() || '';
    if (searchTerm === '') {
      this.searchResults = [...this.todosLosAnimales];
      return;
    }
    this.searchResults = this.todosLosAnimales.filter(
      a => a.caravana?.toLowerCase().includes(searchTerm)
    );
  }

  seleccionarParaAsignar(animal: Animal): void {
    if (this.madreSeleccionada?.id === animal.id || this.padreSeleccionado?.id === animal.id) {
      return;
    }
    this.animalParaAsignar = animal;
  }

  asignarParent(): void {
    if (!this.animalParaAsignar) return;

    // Determinar si es madre o padre basado en el TIPO de animal
    const tiposHembra = ['Vaca', 'Vaquilla', 'Ternera'];
    const tiposMacho = ['Toro', 'Novillo', 'Ternero'];

    if (tiposHembra.includes(this.animalParaAsignar.tipoAnimal)) {
      this.madreSeleccionada = this.animalParaAsignar;
    } else if (tiposMacho.includes(this.animalParaAsignar.tipoAnimal)) {
      this.padreSeleccionado = this.animalParaAsignar;
    }
    
    this.animalParaAsignar = null;
  }

  removerParent(tipo: 'madre' | 'padre'): void {
    if (tipo === 'madre') this.madreSeleccionada = null;
    else this.padreSeleccionado = null;
  }

  onSubmit(): void {
    if (!this.madreSeleccionada && !this.padreSeleccionado) {
      alert('Debe seleccionar al menos una madre o un padre.');
      return;
    }

    if (this.criaForm.invalid) {
      this.criaForm.markAllAsTouched();
      return;
    }

    let criaData: Partial<Animal> | null = null;
    if (this.mode === 'create') {
      const formValue = this.criaForm.get('cria')?.value;
      
      // *** LÓGICA CORREGIDA ***
      // Asigna 'Ternero' o 'Ternera' basado en el sexo seleccionado.
      // NOTA: Para que esto funcione sin errores de TypeScript, debes asegurarte
      // de que tu modelo 'Animal' en 'animal.model.ts' incluya 'Ternero' y 'Ternera'
      // como valores válidos para la propiedad 'tipoAnimal'.
      const tipoAnimal = formValue.sexo === 'Hembra' ? 'Ternera' : 'Ternero';
      
      criaData = {
        caravana: formValue.caravana,
        pelaje: formValue.pelaje,
        sexo: formValue.sexo,
        fechaNacimiento: formValue.fechaNacimiento,
        tipoAnimal: tipoAnimal
      };
    }

    const output = {
      motherId: this.madreSeleccionada?.id || null,
      fatherId: this.padreSeleccionado?.id || null,
      criaData: criaData,
      selectedCriaId: this.mode === 'select' ? this.criaForm.get('cria.existingCriaId')?.value : null
    };
    
    this.save.emit(output);
  }
}
