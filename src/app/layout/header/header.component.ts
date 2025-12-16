import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() toggleSidebarRequest = new EventEmitter<void>();
  
  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.toggleSidebarRequest.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}

