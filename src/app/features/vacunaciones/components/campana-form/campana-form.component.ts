import { Component, EventEmitter, Output, Input, OnInit, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Campana } from '../../../../shared/models/campana.model';

@Component({
  selector: 'app-campana-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campana-form.component.html',
})
export class CampanaFormComponent implements OnInit, OnChanges {
  @Input() campana: Campana | null = null; // Para modo edición
  @Input() editMode: boolean = false;
  @Output() save = new EventEmitter<Partial<Campana>>();
  @Output() cancel = new EventEmitter<void>();

  campanaForm: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.campanaForm = this.fb.group({
      nombre: ['', Validators.required],
      fecha: ['', Validators.required],
      productosUtilizados: [''],
      observaciones: [''],
      estado: ['Pendiente', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.campana && this.editMode) {
      this.loadCampanaData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campana'] && this.campana && this.editMode) {
      this.loadCampanaData();
    }
  }

  private loadCampanaData(): void {
    if (this.campana) {
      // Convertir fecha a formato yyyy-MM-dd para el input type="date"
      let fechaFormateada = '';
      if (this.campana.fecha) {
        const fecha = new Date(this.campana.fecha);
        fechaFormateada = fecha.toISOString().split('T')[0];
      }

      this.campanaForm.patchValue({
        nombre: this.campana.nombre,
        fecha: fechaFormateada,
        productosUtilizados: this.campana.productosUtilizados || '',
        observaciones: this.campana.observaciones || '',
        estado: this.campana.estado || 'Pendiente'
      });
    }
  }

  onSubmit(): void {
    if (this.campanaForm.invalid) {
      this.campanaForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.campanaForm.value);
  }
}