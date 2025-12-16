import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../../../../shared/services/report.service';
import { CampanaService } from '../../../../shared/services/campana.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatosPorTipoComponent } from '../datos-por-tipo/datos-por-tipo.component';
import { ListadoAnimalesComponent } from '../listado-animales/listado-animales.component';
import { PdfExportUtil } from '../../../../shared/utils/pdf-export.util';
import { ExcelExportUtil } from '../../../../shared/utils/excel-export.util';
import { Campana } from '../../../../shared/models/campana.model';

@Component({
  selector: 'app-reporte-vacunacion-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatosPorTipoComponent, ListadoAnimalesComponent],
  templateUrl: './reporte-vacunacion-general.component.html',
  styleUrl: './reporte-vacunacion-general.component.css'
})
export class ReporteVacunacionGeneralComponent implements OnInit {
  private reportService = inject(ReportService);
  private campanaService = inject(CampanaService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  campanas: Campana[] = [];
  loading = false;

  reporteData: {
    campana: Campana;
    datosPorDueno: Array<{
      dueno: any;
      datosPorTipo: any[];
      listados: any[];
    }>;
  } | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      campanaId: ['']
    });

    this.campanaService.getCampaigns({ groupId: null }).subscribe({
      next: (campanas) => {
        this.campanas = campanas;
      },
      error: () => {
        this.notificationService.showError('Error al cargar las campañas');
      }
    });
  }

  generarReporte(): void {
    const { campanaId } = this.form.value;
    
    if (!campanaId) {
      this.notificationService.showError('Por favor, seleccione una campaña');
      return;
    }

    this.loading = true;
    this.reportService.getReporteVacunacionGeneral(campanaId).subscribe({
      next: (reporte) => {
        this.reporteData = reporte;
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al generar el reporte');
        this.loading = false;
      }
    });
  }

  exportarCompletoPDF(): void {
    if (!this.reporteData) return;
    
    // Para reporte general, exportamos todos los datos juntos
    const todosAnimales = this.reporteData.datosPorDueno.flatMap(d => d.listados);
    const todosDatosPorTipo = this.reporteData.datosPorDueno.reduce((acc, d) => {
      d.datosPorTipo.forEach(dato => {
        const existente = acc.find(a => a.tipo === dato.tipo);
        if (existente) {
          existente.cantidad += dato.cantidad;
        } else {
          acc.push({ ...dato });
        }
      });
      return acc;
    }, [] as any[]);

    PdfExportUtil.exportReporteCompleto(
      todosDatosPorTipo,
      todosAnimales,
      `Reporte Vacunación General - ${this.reporteData.campana.nombre}`,
      `Campaña: ${this.reporteData.campana.nombre}`,
      this.reporteData.campana
    );
  }

  exportarCompletoExcel(): void {
    if (!this.reporteData) return;
    
    const todosAnimales = this.reporteData.datosPorDueno.flatMap(d => d.listados);
    const todosDatosPorTipo = this.reporteData.datosPorDueno.reduce((acc, d) => {
      d.datosPorTipo.forEach(dato => {
        const existente = acc.find(a => a.tipo === dato.tipo);
        if (existente) {
          existente.cantidad += dato.cantidad;
        } else {
          acc.push({ ...dato });
        }
      });
      return acc;
    }, [] as any[]);

    ExcelExportUtil.exportReporteCompleto(
      todosDatosPorTipo,
      todosAnimales,
      `Reporte Vacunación General - ${this.reporteData.campana.nombre}`,
      `Campaña: ${this.reporteData.campana.nombre}`,
      this.reporteData.campana
    );
  }
}

