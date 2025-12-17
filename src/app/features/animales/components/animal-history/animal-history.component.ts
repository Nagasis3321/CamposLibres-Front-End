import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalHistory, HistoryType } from '../../../../shared/models/animal-history.model';
import { Vaccination } from '../../../../shared/models/vaccination.model';
import { AnimalState, StateType } from '../../../../shared/models/animal-state.model';
import { Birth } from '../../../../shared/models/birth.model';
import { AnimalHistoryService } from '../../../../shared/services/animal-history.service';
import { VaccinationService } from '../../../../shared/services/vaccination.service';
import { AnimalStateService } from '../../../../shared/services/animal-state.service';
import { BirthService } from '../../../../shared/services/birth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { forkJoin } from 'rxjs';

export interface HistoryItem {
  id: string;
  tipo: 'HISTORIAL' | 'VACUNACION' | 'ESTADO' | 'PARTO';
  titulo: string;
  descripcion?: string;
  fecha: string;
  usuario?: { nombre: string; email: string };
  data?: any; // Datos específicos del tipo
}

@Component({
  selector: 'app-animal-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-history.component.html',
  styleUrl: './animal-history.component.css'
})
export class AnimalHistoryComponent implements OnInit {
  @Input() animalId!: string;
  @Output() editHistoryRequest = new EventEmitter<HistoryItem>();

  private historyService = inject(AnimalHistoryService);
  private vaccinationService = inject(VaccinationService);
  private stateService = inject(AnimalStateService);
  private birthService = inject(BirthService);
  private notificationService = inject(NotificationService);

  historyItems: HistoryItem[] = [];
  loading = true;

  ngOnInit(): void {
    if (this.animalId) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    this.loading = true;
    
    forkJoin({
      history: this.historyService.getHistoryByAnimal(this.animalId),
      vaccinations: this.vaccinationService.getVaccinationsByAnimal(this.animalId),
      states: this.stateService.getStatesByAnimal(this.animalId),
      births: this.birthService.getBirthsByAnimal(this.animalId),
    }).subscribe({
      next: ({ history, vaccinations, states, births }) => {
        this.historyItems = [];

        // Agregar historial general
        history.forEach(item => {
          this.historyItems.push({
            id: item.id,
            tipo: 'HISTORIAL',
            titulo: item.titulo,
            descripcion: item.descripcion,
            fecha: item.fecha,
            usuario: item.usuario,
            data: { historyType: item.tipo }
          });
        });

        // Agregar vacunaciones
        vaccinations.forEach(item => {
          this.historyItems.push({
            id: item.id,
            tipo: 'VACUNACION',
            titulo: `Vacunación: ${item.nombreVacuna}`,
            descripcion: item.observaciones,
            fecha: item.fecha,
            usuario: item.usuario,
            data: { lote: item.lote, veterinario: item.veterinario }
          });
        });

        // Agregar estados
        states.forEach(item => {
          this.historyItems.push({
            id: item.id,
            tipo: 'ESTADO',
            titulo: `Estado: ${item.nombre || item.tipo}`,
            descripcion: item.descripcion,
            fecha: item.fechaInicio,
            usuario: item.usuario,
            data: { 
              tipo: item.tipo, 
              activo: item.activo,
              fechaFin: item.fechaFin 
            }
          });
        });

        // Agregar partos
        births.forEach(item => {
          this.historyItems.push({
            id: item.id,
            tipo: 'PARTO',
            titulo: `Parto - ${item.estado}`,
            descripcion: item.observaciones,
            fecha: item.fecha,
            usuario: item.usuario,
            data: { 
              sexoCria: item.sexoCria,
              peso: item.peso,
              criaId: item.criaId
            }
          });
        });

        // Ordenar por fecha descendente
        this.historyItems.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar el historial.');
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'HISTORIAL': 'Historial',
      'VACUNACION': 'Vacunación',
      'ESTADO': 'Estado',
      'PARTO': 'Parto'
    };
    return labels[tipo] || tipo;
  }

  getTipoColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'HISTORIAL': 'bg-blue-100 text-blue-800',
      'VACUNACION': 'bg-green-100 text-green-800',
      'ESTADO': 'bg-yellow-100 text-yellow-800',
      'PARTO': 'bg-purple-100 text-purple-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  }

  editHistory(item: HistoryItem): void {
    this.editHistoryRequest.emit(item);
  }
}
