import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { Animal } from '../../shared/models/animal.model';
import { Campana } from '../../shared/models/campana.model';
import { AnimalService } from '../../shared/services/animal.service';
import { CampanaService } from '../../shared/services/campana.service';
import { NotificationService } from '../../core/services/notification.service';

import { CampanaCardComponent } from './components/campana-card/campana-card.component';
import { CampanaFormComponent } from './components/campana-form/campana-form.component';
import { CargaAnimalesComponent } from './components/carga-animales/carga-animales.component';

@Component({
  selector: 'app-vacunaciones',
  standalone: true,
  imports: [
    CommonModule,
    CampanaCardComponent,
    CampanaFormComponent,
    CargaAnimalesComponent
  ],
  templateUrl: './vacunaciones.component.html',
  styleUrls: ['./vacunaciones.component.css']
})
export class VacunacionesComponent implements OnInit {
  private campanaService = inject(CampanaService);
  private animalService = inject(AnimalService);
  private notificationService = inject(NotificationService);

  campanas$!: Observable<Campana[]>;
  todosLosAnimales: Animal[] = [];
  
  isFormCampanaOpen = false;
  isCargaAnimalesOpen = false;
  
  campanaSeleccionada: Campana | null = null;
  nuevaCampanaData: Partial<Campana> | null = null;

  ngOnInit(): void {
    this.loadCampanas();
    this.animalService.getAnimales().subscribe(data => this.todosLosAnimales = data);
  }

  loadCampanas(): void {
    this.campanas$ = this.campanaService.getCampanas();
  }

  openModalNuevaCampana(): void {
    this.isFormCampanaOpen = true;
  }

  onSaveCampana(data: Partial<Campana>): void {
    this.nuevaCampanaData = data;
    this.isFormCampanaOpen = false;
    this.campanaSeleccionada = {
      idCampana: `TEMP-${Date.now()}`,
      ...data,
      estado: 'Pendiente Carga',
      animalesAgregados: []
    } as Campana;
    this.isCargaAnimalesOpen = true;
  }

  onVerCarga(campana: Campana): void {
    this.campanaSeleccionada = campana;
    this.isCargaAnimalesOpen = true;
  }

  onFinalizarCarga(animales: Animal[]): void {
    // Lógica para guardar la campaña (simulada)
    this.notificationService.showSuccess(`Campaña "${this.campanaSeleccionada?.nombreCampana}" guardada con ${animales.length} animales (simulado).`);
    this.closeAllModals();
  }

  closeAllModals(): void {
    this.isFormCampanaOpen = false;
    this.isCargaAnimalesOpen = false;
    this.campanaSeleccionada = null;
    this.nuevaCampanaData = null;
  }
}
