import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HydratedGroup, UserRole } from '../../../../shared/models/group.model';
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-list.component.html',
})
export class GroupListComponent {
  @Input() groups: HydratedGroup[] = [];
  @Input() selectedGroupId: string | null = null;
  @Input() currentUser!: User;
  @Output() select = new EventEmitter<HydratedGroup>();
  @Output() edit = new EventEmitter<HydratedGroup>();
  @Output() delete = new EventEmitter<HydratedGroup>();
  @Output() leaveGroup = new EventEmitter<HydratedGroup>();

  isOwner(group: HydratedGroup): boolean {
    return group.propietarioId === this.currentUser.id;
  }

  getUserRole(group: HydratedGroup): UserRole | undefined {
    return group.miembros.find(m => m.userId === this.currentUser.id)?.role;
  }

  canManageGroup(group: HydratedGroup): boolean {
    const role = this.getUserRole(group);
    return role === 'Propietario' || role === 'Administrador';
  }
}