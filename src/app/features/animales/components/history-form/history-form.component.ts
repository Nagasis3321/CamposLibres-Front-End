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
  @Output() save = new EventEmitter<{ titulo: string; descripcion?: string; fecha: string; tipo: HistoryType }>();
  @Output() cancel = new EventEmitter<void>();

  historyForm!: FormGroup;
  historyTypes = Object.values(HistoryType);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.historyForm = this.fb.group({
      tipo: [HistoryType.OBSERVACION, [Validators.required]],
      titulo: ['', [Validators.required]],
      descripcion: [''],
      fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.historyForm.valid) {
      this.save.emit(this.historyForm.value);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get tipo() { return this.historyForm.get('tipo'); }
  get titulo() { return this.historyForm.get('titulo'); }
  get fecha() { return this.historyForm.get('fecha'); }
}

