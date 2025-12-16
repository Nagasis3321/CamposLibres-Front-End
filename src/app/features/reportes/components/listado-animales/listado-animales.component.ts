import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../../../../shared/models/animal.model';
import { PdfExportUtil } from '../../../../shared/utils/pdf-export.util';
import { ExcelExportUtil } from '../../../../shared/utils/excel-export.util';

@Component({
  selector: 'app-listado-animales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listado-animales.component.html',
  styleUrl: './listado-animales.component.css'
})
export class ListadoAnimalesComponent {
  @Input() animales: Animal[] = [];
  @Input() titulo: string = 'Listado de Animales';
  @Input() mostrarBotones: boolean = true;

  exportarPDF(): void {
    PdfExportUtil.exportListadoAnimales(this.animales, this.titulo);
  }

  exportarExcel(): void {
    ExcelExportUtil.exportListadoAnimales(this.animales, this.titulo);
  }

  formatearFecha(fecha: string | Date | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}

