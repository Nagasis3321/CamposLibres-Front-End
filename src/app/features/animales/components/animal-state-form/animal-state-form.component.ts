import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AnimalState, CreateAnimalStateDto, StateType } from '../../../../shared/models/animal-state.model';

@Component({
  selector: 'app-animal-state-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animal-state-form.component.html',
  styleUrl: './animal-state-form.component.css'
})
export class AnimalStateFormComponent implements OnInit {
  @Input() state: AnimalState | null = null;
  @Input() animalId!: string;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() save = new EventEmitter<CreateAnimalStateDto>();
  @Output() cancel = new EventEmitter<void>();

  stateForm!: FormGroup;
  stateTypes = Object.values(StateType);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.stateForm = this.fb.group({
      tipo: [this.state?.tipo || StateType.SALUDABLE, [Validators.required]],
      nombre: [this.state?.nombre || ''],
      fechaInicio: [this.state?.fechaInicio || new Date().toISOString().split('T')[0], [Validators.required]],
      fechaFin: [this.state?.fechaFin || ''],
      descripcion: [this.state?.descripcion || ''],
      activo: [this.state?.activo !== undefined ? this.state.activo : true],
    });
  }

  onSubmit(): void {
    if (this.stateForm.valid) {
      const formValue = this.stateForm.value;
      this.save.emit({
        ...formValue,
        animalId: this.animalId,
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get tipo() { return this.stateForm.get('tipo'); }
  get fechaInicio() { return this.stateForm.get('fechaInicio'); }
}

