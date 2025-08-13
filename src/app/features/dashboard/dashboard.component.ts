import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, map, Observable } from 'rxjs';

import { AnimalService } from '../../shared/services/animal.service';
import { CampanaService } from '../../shared/services/campana.service';

import { StatCardComponent } from './components/stat-card/stat-card.component';
import { SummaryTableComponent, ResumenDueno } from './components/summary-table/summary-table.component';
import { Animal } from '../../shared/models/animal.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, SummaryTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Inyección de servicios
  private animalService = inject(AnimalService);
  private campanaService = inject(CampanaService);

  // Propiedades para las tarjetas de estadísticas
  totalAnimales = 0;
  animalesSinCaravana = 0;
  campanasActivas = 0;

  // Propiedad para la tabla de resumen
  resumenPorDueno: ResumenDueno[] = [];

  isLoading = true;

  ngOnInit(): void {
    // Usamos forkJoin para esperar a que ambas llamadas a los servicios terminen.
    forkJoin({
      animales: this.animalService.getAnimales(),
      campanas: this.campanaService.getCampanas()
    }).subscribe(({ animales, campanas }) => {
      // Una vez que tenemos los datos, procesamos las estadísticas.
      this.totalAnimales = animales.length;
      this.animalesSinCaravana = animales.filter(a => !a.caravana || a.caravana.trim() === '').length;
      this.campanasActivas = campanas.filter(c => c.estado === 'Pendiente Carga').length;

      // Procesamos los datos para la tabla de resumen.
      this.resumenPorDueno = this.procesarResumenPorDueno(animales);

      this.isLoading = false;
    });
  }

  private procesarResumenPorDueno(animales: Animal[]): ResumenDueno[] {
    const resumen = animales.reduce((acc, animal) => {
      // Si el dueño no está en el acumulador, lo inicializamos.
      if (!acc[animal.dueno]) {
        acc[animal.dueno] = { total: 0, tipos: {}, sinCaravana: 0 };
      }

      // Incrementamos los contadores.
      acc[animal.dueno].total++;
      acc[animal.dueno].tipos[animal.tipoAnimal] = (acc[animal.dueno].tipos[animal.tipoAnimal] || 0) + 1;
      if (!animal.caravana || animal.caravana.trim() === '') {
        acc[animal.dueno].sinCaravana++;
      }

      return acc;
    }, {} as Record<string, { total: number; tipos: Record<string, number>; sinCaravana: number }>);

    // Convertimos el objeto procesado en un array para la tabla.
    return Object.entries(resumen).map(([dueno, data]) => ({
      dueno,
      total: data.total,
      detalle: Object.entries(data.tipos).map(([tipo, count]) => `${tipo}: ${count}`).join('<br>'),
      sinCaravana: data.sinCaravana
    }));
  }
}
