import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animal-form.component.html',
})
export class AnimalFormComponent implements OnChanges {
  @Input() animal: Animal | null = null;
  @Input() pelajes: string[] = [];
  @Input({required: true})  duenos: { id: string, nombre: string }[] = [];
  @Output() save = new EventEmitter<Partial<Animal>>();
  @Output() cancel = new EventEmitter<void>();

  animalForm: FormGroup;
  private fb = inject(FormBuilder);

  // Listas para las opciones dinámicas del dropdown 'tipoAnimal'
  tiposMacho: Animal['tipoAnimal'][] = ['Toro', 'Novillo', 'Ternero'];
  tiposHembra: Animal['tipoAnimal'][] = ['Vaca', 'Vaquilla', 'Ternera'];

  constructor() {
    this.animalForm = this.fb.group({
      caravana: [''],
      tipoAnimal: ['Vaca', Validators.required],
      pelaje: ['', Validators.required],
      sexo: ['Hembra', Validators.required],
      duenoId: ['', Validators.required],
      descripcion: [''],
    });

    // Escuchamos los cambios en el control 'sexo'
    this.animalForm.get('sexo')?.valueChanges.subscribe(sexoSeleccionado => {
      this.actualizarTipoAnimal(sexoSeleccionado);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.animal) {
      this.animalForm.patchValue(this.animal);
    } else {
      this.animalForm.reset({
        tipoAnimal: 'Vaca',
        sexo: 'Hembra',
        duenoId: this.duenos.length > 0 ? this.duenos[0].id : ''
      });
    }
  }

  /**
   * Actualiza el valor del campo 'tipoAnimal' para que sea consistente
   * con el sexo seleccionado.
   * @param sexo El nuevo sexo seleccionado ('Hembra' o 'Macho').
   */
  private actualizarTipoAnimal(sexo: 'Hembra' | 'Macho'): void {
    const tipoAnimalControl = this.animalForm.get('tipoAnimal');
    if (!tipoAnimalControl) return;

    if (sexo === 'Hembra') {
      // Si el valor actual no es una opción válida para Hembra, lo reseteamos a la primera opción.
      if (!this.tiposHembra.includes(tipoAnimalControl.value)) {
        tipoAnimalControl.setValue(this.tiposHembra[0]);
      }
    } else { // Macho
      // Si el valor actual no es una opción válida para Macho, lo reseteamos a la primera opción.
      if (!this.tiposMacho.includes(tipoAnimalControl.value)) {
        tipoAnimalControl.setValue(this.tiposMacho[0]);
      }
    }
  }

  onSubmit(): void {
    if (this.animalForm.invalid) {
      this.animalForm.markAllAsTouched();
      return;
    }
    // El id no es parte del formulario, se añade solo si estamos editando.
    const outputData = this.animal ? { id: this.animal.id, ...this.animalForm.value } : this.animalForm.value;
    this.save.emit(outputData);
  }
}