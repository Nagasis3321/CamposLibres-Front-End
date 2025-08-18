import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Group } from '../../../../shared/models/group.model';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="groupForm" (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
        <input id="nombre" type="text" formControlName="nombre" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
        <div *ngIf="groupForm.get('nombre')?.invalid && groupForm.get('nombre')?.touched" class="mt-1 text-xs text-danger">
          El nombre es requerido.
        </div>
      </div>
      <div class="flex justify-end space-x-3 pt-4">
        <button type="button" (click)="cancel.emit()" class="btn-secondary">Cancelar</button>
        <button type="submit" [disabled]="groupForm.invalid" class="btn-primary disabled:opacity-50">
          {{ isEditMode ? 'Guardar Cambios' : 'Crear Grupo' }}
        </button>
      </div>
    </form>
  `
})
export class GroupFormComponent implements OnChanges {
  @Input() group: Group | null = null;
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  groupForm: FormGroup;
  isEditMode = false;
  private fb = inject(FormBuilder);

  constructor() {
    this.groupForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.group) {
      this.isEditMode = true;
      this.groupForm.patchValue({ nombre: this.group.nombre });
    } else {
      this.isEditMode = false;
      this.groupForm.reset();
    }
  }

  onSubmit(): void {
    if (this.groupForm.invalid) return;
    this.save.emit(this.groupForm.value.nombre);
  }
}