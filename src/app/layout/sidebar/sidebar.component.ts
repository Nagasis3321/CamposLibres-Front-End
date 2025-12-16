import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/animales', label: 'Animales', icon: '🐄' },
    { path: '/crias', label: 'Crías', icon: '🐮' },
    { path: '/vacunaciones', label: 'Vacunaciones', icon: '💉' },
    { path: '/grupos', label: 'Grupos', icon: '👥' },
    { path: '/users', label: 'Usuarios', icon: '👥' },
    { path: '/reportes', label: 'Reportes', icon: '📄' },
    { path: '/perfil', label: 'Mi Perfil', icon: '⚙️' },
  ];
}

