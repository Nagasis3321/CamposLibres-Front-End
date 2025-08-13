import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campana } from '../../../../shared/models/campana.model';

@Component({
  selector: 'app-campana-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campana-form.component.html',
  styleUrls: ['./campana-form.component.css']
})
export class CampanaFormComponent {
  @Output() save = new EventEmitter<Partial<Campana>>();
  @Output() cancel = new EventEmitter<void>();

  campanaForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.campanaForm = this.fb.group({
      nombreCampana: ['', Validators.required],
      fechaCampana: ['', Validators.required],
      productoUtilizado: [''],
      obsCampana: ['']
    });
  }

  onSubmit(): void {
    this.campanaForm.markAllAsTouched();
    if (this.campanaForm.invalid) return;
    this.save.emit(this.campanaForm.value);
  }
}
