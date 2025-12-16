import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input() title: string = 'Título';
  @Input() value: string | number = 0;
  @Input() description: string = '';
}