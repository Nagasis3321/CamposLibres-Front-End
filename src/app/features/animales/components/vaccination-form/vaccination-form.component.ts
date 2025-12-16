import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Vaccination, CreateVaccinationDto } from '../../../../shared/models/vaccination.model';

@Component({
  selector: 'app-vaccination-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vaccination-form.component.html',
  styleUrl: './vaccination-form.component.css'
})
export class VaccinationFormComponent implements OnInit {
  @Input() vaccination: Vaccination | null = null;
  @Input() animalId!: string;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() save = new EventEmitter<CreateVaccinationDto>();
  @Output() cancel = new EventEmitter<void>();

  vaccinationForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.vaccinationForm = this.fb.group({
      nombreVacuna: [this.vaccination?.nombreVacuna || '', [Validators.required]],
      fecha: [this.vaccination?.fecha || new Date().toISOString().split('T')[0], [Validators.required]],
      lote: [this.vaccination?.lote || ''],
      veterinario: [this.vaccination?.veterinario || ''],
      observaciones: [this.vaccination?.observaciones || ''],
    });
  }

  onSubmit(): void {
    if (this.vaccinationForm.valid) {
      const formValue = this.vaccinationForm.value;
      this.save.emit({
        ...formValue,
        animalId: this.animalId,
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get nombreVacuna() { return this.vaccinationForm.get('nombreVacuna'); }
  get fecha() { return this.vaccinationForm.get('fecha'); }
}

