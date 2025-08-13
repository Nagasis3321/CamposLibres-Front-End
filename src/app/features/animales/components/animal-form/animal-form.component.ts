import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animal-form.component.html',
  styleUrl: './animal-form.component.css'
})
export class AnimalFormComponent implements OnChanges {
  @Input() animal: Animal | null = null;
  @Input() pelajes: string[] = []; // 
  @Input() duenos: string[] = [];  
  @Output() save = new EventEmitter<Animal>();
  @Output() cancel = new EventEmitter<void>();

  animalForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.animalForm = this.fb.group({
      id: [null],
      caravana: [''],
      tipoAnimal: ['Vaca', Validators.required],
      pelaje: ['', Validators.required],
      sexo: ['Hembra', Validators.required],
      dueno: ['', Validators.required], // Valor inicial vacío
      descripcion: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.animal) {
      this.animalForm.patchValue(this.animal);
    } else {
      // Si es un animal nuevo, reseteamos el formulario.
      this.animalForm.reset({
        tipoAnimal: 'Vaca',
        sexo: 'Hembra',
        dueno: this.duenos.length > 0 ? this.duenos[0] : '' // Selecciona el primer dueño por defecto
      });
    }
  }

  onSubmit(): void {
    if (this.animalForm.invalid) {
      return;
    }
    this.save.emit(this.animalForm.value);
  }
}