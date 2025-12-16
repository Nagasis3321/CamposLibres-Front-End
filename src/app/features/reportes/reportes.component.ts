import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoReporte } from '../../shared/models/report.model';
import { AuthService } from '../../core/services/auth.service';
import { ReporteVacunacionUsuarioComponent } from './components/reporte-vacunacion-usuario/reporte-vacunacion-usuario.component';
import { ReporteVacunacionGeneralComponent } from './components/reporte-vacunacion-general/reporte-vacunacion-general.component';
import { ReporteAnimalesUsuarioComponent } from './components/reporte-animales-usuario/reporte-animales-usuario.component';
import { ReporteAnimalesGrupoComponent } from './components/reporte-animales-grupo/reporte-animales-grupo.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReporteVacunacionUsuarioComponent,
    ReporteVacunacionGeneralComponent,
    ReporteAnimalesUsuarioComponent,
    ReporteAnimalesGrupoComponent
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  tipoReporteSeleccionado: TipoReporte | null = null;
  currentUser = this.authService.currentUserValue;

  tiposReporte: Array<{ value: TipoReporte, label: string, descripcion: string }> = [
    {
      value: 'vacunacion-usuario',
      label: 'Detalle Vacunación por Usuario',
      descripcion: 'Reporte de animales de un usuario específico dentro de una vacunación'
    },
    {
      value: 'vacunacion-general',
      label: 'Detalle Vacunación General',
      descripcion: 'Reporte general de todos los animales de una vacunación, agrupados por dueño'
    },
    {
      value: 'animales-usuario',
      label: 'Detalles Animales Usuario',
      descripcion: 'Reporte completo de todos los animales del usuario actual'
    },
    {
      value: 'animales-grupo',
      label: 'Detalles Animales Grupo',
      descripcion: 'Reporte de todos los animales de los usuarios de un grupo'
    }
  ];

  ngOnInit(): void {
    // Verificar si hay un tipo de reporte en los query params
    this.route.queryParams.subscribe(params => {
      if (params['tipo']) {
        this.tipoReporteSeleccionado = params['tipo'] as TipoReporte;
      }
    });
  }

  seleccionarTipoReporte(tipo: TipoReporte): void {
    this.tipoReporteSeleccionado = tipo;
    this.router.navigate(['/reportes'], { queryParams: { tipo } });
  }

  volver(): void {
    this.tipoReporteSeleccionado = null;
    this.router.navigate(['/reportes']);
  }
}

