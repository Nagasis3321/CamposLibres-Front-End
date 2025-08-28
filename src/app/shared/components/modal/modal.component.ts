import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal Title';
  @Input() size: 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' = 'lg'; // <-- NUEVO
  @Output() close = new EventEmitter<void>();

  get sizeClass(): string {
    switch (this.size) {
      case 'md': return 'max-w-md';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case '6xl': return 'max-w-6xl'; 
      default: return 'max-w-lg';
    }
  }
}
