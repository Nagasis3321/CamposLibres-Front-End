import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../../shared/services/report.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatosPorTipoComponent } from '../datos-por-tipo/datos-por-tipo.component';
import { ListadoAnimalesComponent } from '../listado-animales/listado-animales.component';
import { PdfExportUtil } from '../../../../shared/utils/pdf-export.util';
import { ExcelExportUtil } from '../../../../shared/utils/excel-export.util';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-reporte-animales-usuario',
  standalone: true,
  imports: [CommonModule, DatosPorTipoComponent, ListadoAnimalesComponent],
  templateUrl: './reporte-animales-usuario.component.html',
  styleUrl: './reporte-animales-usuario.component.css'
})
export class ReporteAnimalesUsuarioComponent implements OnInit {
  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  loading = false;
  datosPorTipo: any[] = [];
  listadoAnimales: any[] = [];
  usuario: User | null = null;

  ngOnInit(): void {
    this.usuario = this.authService.currentUserValue;
    if (!this.usuario) {
      this.notificationService.showError('No se pudo obtener la información del usuario');
      return;
    }

    this.generarReporte();
  }

  generarReporte(): void {
    if (!this.usuario) return;

    this.loading = true;
    this.reportService.getReporteAnimalesUsuario(this.usuario.id).subscribe({
      next: (reporte) => {
        this.datosPorTipo = reporte.datosPorTipo;
        this.listadoAnimales = reporte.listados;
        this.usuario = reporte.usuario as User;
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al generar el reporte');
        this.loading = false;
      }
    });
  }

  exportarCompletoPDF(): void {
    if (!this.usuario) return;
    
    PdfExportUtil.exportReporteCompleto(
      this.datosPorTipo,
      this.listadoAnimales,
      `Reporte Animales - ${this.usuario.nombre}`,
      `Usuario: ${this.usuario.nombre}`
    );
  }

  exportarCompletoExcel(): void {
    if (!this.usuario) return;
    
    ExcelExportUtil.exportReporteCompleto(
      this.datosPorTipo,
      this.listadoAnimales,
      `Reporte Animales - ${this.usuario.nombre}`,
      `Usuario: ${this.usuario.nombre}`
    );
  }
}

