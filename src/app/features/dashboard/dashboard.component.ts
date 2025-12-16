import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AnimalService } from '../../shared/services/animal.service';
import { CampanaService } from '../../shared/services/campana.service';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { SummaryTableComponent, ResumenDueno } from './components/summary-table/summary-table.component';
import { Animal } from '../../shared/models/animal.model';
import { GroupService } from '../../shared/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { Campana } from '../../shared/models/campana.model'; // Importar Campana

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, SummaryTableComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private animalService = inject(AnimalService);
  private campanaService = inject(CampanaService);
  private groupService = inject(GroupService);
  private authService = inject(AuthService);

  totalAnimales = 0;
  animalesSinCaravana = 0;
  campanasActivas = 0;
  totalGrupos = 0;
  resumenPorDueno: ResumenDueno[] = [];
  isLoading = true;

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    forkJoin({
      animalesResponse: this.animalService.getAnimales(1, 1000),
      // *** CORRECCIÓN DE MÉTODO Y TIPO ***
      campanas: this.campanaService.getCampaigns({ groupId: null }), // Se usa getCampaigns
      grupos: this.groupService.getMyGroups() 
    }).subscribe(({ animalesResponse, campanas, grupos }) => {
      const animales = animalesResponse.data;
      this.totalAnimales = animalesResponse.total;
      this.animalesSinCaravana = animales.filter(a => !a.caravana || a.caravana.trim() === '').length;
      // *** CORRECCIÓN DE LÓGICA ***
      // El estado ya no existe, esta lógica se puede adaptar o eliminar.
      // Por ahora, contamos todas las campañas.
      this.campanasActivas = campanas.length; 
      this.totalGrupos = grupos.length;
      this.resumenPorDueno = this.procesarResumenPorDueno(animales);
      this.isLoading = false;
    });
  }

  private procesarResumenPorDueno(animales: Animal[]): ResumenDueno[] {
    const resumen = animales.reduce((acc, animal) => {
      const duenoNombre = animal.dueno?.nombre || 'Desconocido';
      if (!acc[duenoNombre]) {
        acc[duenoNombre] = { total: 0, tipos: {}, sinCaravana: 0 };
      }
      acc[duenoNombre].total++;
      acc[duenoNombre].tipos[animal.tipoAnimal] = (acc[duenoNombre].tipos[animal.tipoAnimal] || 0) + 1;
      if (!animal.caravana || animal.caravana.trim() === '') {
        acc[duenoNombre].sinCaravana++;
      }
      return acc;
    }, {} as Record<string, { total: number; tipos: Record<string, number>; sinCaravana: number }>);

    return Object.entries(resumen).map(([dueno, data]) => ({
      dueno,
      total: data.total,
      tipos: data.tipos,
      sinCaravana: data.sinCaravana
    }));
  }
}