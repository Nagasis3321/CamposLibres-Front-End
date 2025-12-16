import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Birth, CreateBirthDto } from '../../../../shared/models/birth.model';
import { Animal } from '../../../../shared/models/animal.model';
import { AnimalService } from '../../../../shared/services/animal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-birth-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './birth-form.component.html',
  styleUrl: './birth-form.component.css'
})
export class BirthFormComponent implements OnInit {
  @Input() birth: Birth | null = null;
  @Input() animalId!: string;
  @Input() mode: 'create' | 'edit' = 'create';
  @Output() save = new EventEmitter<CreateBirthDto>();
  @Output() cancel = new EventEmitter<void>();

  private animalService = inject(AnimalService);
  birthForm!: FormGroup;
  availableCrias$!: Observable<{ data: Animal[]; total: number; page: number; limit: number }>;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.birthForm = this.fb.group({
      criaId: [this.birth?.criaId || ''],
      fecha: [this.birth?.fecha || new Date().toISOString().split('T')[0], [Validators.required]],
      estado: [this.birth?.estado || 'VIVO', [Validators.required]],
      sexoCria: [this.birth?.sexoCria || ''],
      peso: [this.birth?.peso || ''],
      observaciones: [this.birth?.observaciones || ''],
    });

    // Cargar crías disponibles
    this.availableCrias$ = this.animalService.getAnimales(1, 1000);
  }

  onSubmit(): void {
    if (this.birthForm.valid) {
      const formValue = this.birthForm.value;
      this.save.emit({
        ...formValue,
        madreId: this.animalId,
        criaId: formValue.criaId || undefined,
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get fecha() { return this.birthForm.get('fecha'); }
  get estado() { return this.birthForm.get('estado'); }
}

