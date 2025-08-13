import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Campana } from '../../../../shared/models/campana.model';

@Component({
  selector: 'app-campana-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campana-card.component.html',
  styleUrls: ['./campana-card.component.css']
})
export class CampanaCardComponent {
  @Input() campana!: Campana;
  @Output() verCarga = new EventEmitter<Campana>();
}
