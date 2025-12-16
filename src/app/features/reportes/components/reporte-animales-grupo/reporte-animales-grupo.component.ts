import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../../../../shared/services/report.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatosPorTipoComponent } from '../datos-por-tipo/datos-por-tipo.component';
import { ListadoAnimalesComponent } from '../listado-animales/listado-animales.component';
import { PdfExportUtil } from '../../../../shared/utils/pdf-export.util';
import { ExcelExportUtil } from '../../../../shared/utils/excel-export.util';
import { HydratedGroup } from '../../../../shared/models/group.model';

@Component({
  selector: 'app-reporte-animales-grupo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatosPorTipoComponent, ListadoAnimalesComponent],
  templateUrl: './reporte-animales-grupo.component.html',
  styleUrl: './reporte-animales-grupo.component.css'
})
export class ReporteAnimalesGrupoComponent implements OnInit {
  private reportService = inject(ReportService);
  private groupService = inject(GroupService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  grupos: HydratedGroup[] = [];
  loading = false;

  reporteData: {
    grupoId: string;
    grupoNombre: string;
    usuarios: Array<{
      usuario: any;
      datosPorTipo: any[];
      listados: any[];
    }>;
  } | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      grupoId: ['']
    });

    this.groupService.getMyGroups().subscribe({
      next: (grupos) => {
        this.grupos = grupos;
      },
      error: () => {
        this.notificationService.showError('Error al cargar los grupos');
      }
    });
  }

  generarReporte(): void {
    const { grupoId } = this.form.value;
    
    if (!grupoId) {
      this.notificationService.showError('Por favor, seleccione un grupo');
      return;
    }

    this.loading = true;
    const grupoSeleccionado = this.grupos.find(g => g.id === grupoId);
    
    this.reportService.getReporteAnimalesGrupo(grupoId).subscribe({
      next: (reporte) => {
        this.reporteData = {
          ...reporte,
          grupoNombre: grupoSeleccionado?.nombre || 'Grupo no encontrado'
        };
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
    
    const todosAnimales = this.reporteData.usuarios.flatMap(u => u.listados);
    const todosDatosPorTipo = this.reporteData.usuarios.reduce((acc, u) => {
      u.datosPorTipo.forEach(dato => {
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
      `Reporte Animales Grupo - ${this.reporteData.grupoNombre}`,
      `Grupo: ${this.reporteData.grupoNombre}`
    );
  }

  exportarCompletoExcel(): void {
    if (!this.reporteData) return;
    
    const todosAnimales = this.reporteData.usuarios.flatMap(u => u.listados);
    const todosDatosPorTipo = this.reporteData.usuarios.reduce((acc, u) => {
      u.datosPorTipo.forEach(dato => {
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
      `Reporte Animales Grupo - ${this.reporteData.grupoNombre}`,
      `Grupo: ${this.reporteData.grupoNombre}`
    );
  }
}

