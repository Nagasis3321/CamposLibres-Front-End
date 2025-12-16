import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatosPorTipo } from '../../../../shared/models/report.model';
import { PdfExportUtil } from '../../../../shared/utils/pdf-export.util';
import { ExcelExportUtil } from '../../../../shared/utils/excel-export.util';

@Component({
  selector: 'app-datos-por-tipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datos-por-tipo.component.html',
  styleUrl: './datos-por-tipo.component.css'
})
export class DatosPorTipoComponent {
  @Input() datosPorTipo: DatosPorTipo[] = [];
  @Input() titulo: string = 'Datos por Tipo de Animal';
  @Input() mostrarBotones: boolean = true;

  exportarPDF(): void {
    PdfExportUtil.exportDatosPorTipo(this.datosPorTipo, this.titulo);
  }

  exportarExcel(): void {
    ExcelExportUtil.exportDatosPorTipo(this.datosPorTipo, this.titulo);
  }
}

