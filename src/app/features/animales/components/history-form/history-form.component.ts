import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HistoryType } from '../../../../shared/models/animal-history.model';

@Component({
  selector: 'app-history-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './history-form.component.html',
  styleUrl: './history-form.component.css'
})
export class HistoryFormComponent implements OnInit {
  @Input() animalId!: string;
  @Input() historyId?: string;
  @Input() existingHistory?: { titulo: string; descripcion?: string; fecha: string; tipo: HistoryType };
  @Output() save = new EventEmitter<{ id?: string; titulo: string; descripcion?: string; fecha: string; tipo: HistoryType }>();
  @Output() cancel = new EventEmitter<void>();

  historyForm!: FormGroup;
  historyTypes = Object.values(HistoryType);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const defaultValues = this.existingHistory || {
      tipo: HistoryType.OBSERVACION,
      titulo: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    };

    this.historyForm = this.fb.group({
      tipo: [defaultValues.tipo, [Validators.required]],
      titulo: [defaultValues.titulo, [Validators.required]],
      descripcion: [defaultValues.descripcion || ''],
      fecha: [defaultValues.fecha, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.historyForm.valid) {
      const data = this.historyForm.value;
      if (this.historyId) {
        data.id = this.historyId;
      }
      this.save.emit(data);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get tipo() { return this.historyForm.get('tipo'); }
  get titulo() { return this.historyForm.get('titulo'); }
  get fecha() { return this.historyForm.get('fecha'); }
}

