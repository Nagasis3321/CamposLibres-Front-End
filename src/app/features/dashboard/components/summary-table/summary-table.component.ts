import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Creamos una interfaz local para la estructura de los datos de esta tabla.
export interface ResumenDueno {
  dueno: string;
  total: number;
  detalle: string;
  sinCaravana: number;
}

@Component({
  selector: 'app-summary-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-table.component.html',
  styleUrl: './summary-table.component.css'
})
export class SummaryTableComponent {
  @Input() data: ResumenDueno[] = [];
}
