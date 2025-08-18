import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
})
export class SummaryTableComponent {
  @Input() data: ResumenDueno[] = [];
}
