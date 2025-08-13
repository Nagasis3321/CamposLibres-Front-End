import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { Group, HydratedGroup, HydratedMember, UserRole } from '../../shared/models/group.model';
import { User } from '../../shared/models/user.model';
import { GroupService } from '../../shared/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MemberManagerComponent } from './components/member-manager/member-manager.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, MemberManagerComponent, ModalComponent, GroupFormComponent],
  templateUrl: './group.component.html',
})
export class GroupComponent implements OnInit {
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  private groupsSubject = new BehaviorSubject<Group[]>([]);
  userGroups$: Observable<Group[]> = this.groupsSubject.asObservable();
  
  allUsers: User[] = [];
  selectedGroup: HydratedGroup | null = null;
  currentUser!: User;
  
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.notificationService.showError('Error de autenticación. Por favor, inicie sesión de nuevo.');
      this.authService.logout();
      return;
    }
    this.currentUser = currentUser;

    // Carga los datos iniciales
    forkJoin({
      users: this.userService.getUsers(),
      groups: this.groupService.getGruposByUserId(this.currentUser.id)
    }).subscribe(({ users, groups }) => {
      this.allUsers = users;
      this.groupsSubject.next(groups);
    });
  }

  selectGroup(group: Group): void {
    this.selectedGroup = this.hydrateGroup(group);
  }

  private hydrateGroup(group: Group): HydratedGroup {
    const miembros: HydratedMember[] = group.miembros.map(memberRef => {
      const user = this.allUsers.find(u => u.id === memberRef.userId);
      return {
        userId: memberRef.userId,
        nombre: user?.nombre || 'Desconocido',
        email: user?.email || 'N/A',
        role: memberRef.role
      };
    });
    return { ...group, miembros };
  }

  // --- Manejo de Modales ---
  openCreateModal(): void {
    this.modalMode = 'create';
    this.isModalOpen = true;
  }

  openEditModal(): void {
    if (!this.selectedGroup) return;
    this.modalMode = 'edit';
    this.isModalOpen = true;
  }

  // --- Acciones de Grupo ---
  onSaveGroup(nombre: string): void {
    if (this.modalMode === 'create') {
      this.groupService.createGroup(nombre, this.currentUser).subscribe(newGroup => {
        this.notificationService.showSuccess(`Grupo "${newGroup.nombre}" creado.`);
        const currentGroups = this.groupsSubject.getValue();
        this.groupsSubject.next([...currentGroups, newGroup]);
        this.selectGroup(newGroup);
      });
    } else if (this.modalMode === 'edit' && this.selectedGroup) {
      this.groupService.updateGroup(this.selectedGroup.id, nombre).subscribe(updatedGroup => {
        this.notificationService.showSuccess(`Grupo "${updatedGroup.nombre}" actualizado.`);
        this.updateGroupInList(updatedGroup);
        this.selectGroup(updatedGroup);
      });
    }
    this.isModalOpen = false;
  }

  onDeleteGroup(): void {
    if (!this.selectedGroup || !confirm(`¿Estás seguro de que quieres eliminar el grupo "${this.selectedGroup.nombre}"?`)) {
      return;
    }
    this.groupService.deleteGroup(this.selectedGroup.id).subscribe(() => {
      this.notificationService.showSuccess(`Grupo "${this.selectedGroup!.nombre}" eliminado.`);
      const currentGroups = this.groupsSubject.getValue().filter(g => g.id !== this.selectedGroup!.id);
      this.groupsSubject.next(currentGroups);
      this.selectedGroup = null;
    });
  }

  // --- Acciones de Miembros ---
  onInviteMember(event: { email: string, role: UserRole }): void {
    if (!this.selectedGroup) return;
    this.groupService.inviteMember(this.selectedGroup.id, event.email, event.role).subscribe({
      next: (updatedGroup) => {
        this.notificationService.showSuccess(`Invitación enviada a ${event.email}.`);
        this.updateGroupInList(updatedGroup);
        this.selectGroup(updatedGroup);
      },
      error: (err) => this.notificationService.showError(err.message)
    });
  }

  onRemoveMember(member: HydratedMember): void {
    if (!this.selectedGroup) return;
    this.groupService.removeMember(this.selectedGroup.id, member.userId).subscribe(updatedGroup => {
      this.notificationService.showSuccess(`Miembro ${member.nombre} eliminado.`);
      this.updateGroupInList(updatedGroup);
      this.selectGroup(updatedGroup);
    });
  }

  onChangeRole(event: { member: HydratedMember, newRole: UserRole }): void {
    if (!this.selectedGroup) return;
    this.groupService.updateMemberRole(this.selectedGroup.id, event.member.userId, event.newRole).subscribe(updatedGroup => {
      this.notificationService.showSuccess(`Rol de ${event.member.nombre} actualizado a ${event.newRole}.`);
      this.updateGroupInList(updatedGroup);
      this.selectGroup(updatedGroup);
    });
  }
  
  // --- Utilidades ---
  private updateGroupInList(updatedGroup: Group): void {
    const currentGroups = this.groupsSubject.getValue();
    const index = currentGroups.findIndex(g => g.id === updatedGroup.id);
    if (index > -1) {
      currentGroups[index] = updatedGroup;
      this.groupsSubject.next([...currentGroups]);
    }
  }

  canCurrentUserManageGroup(): boolean {
    if (!this.selectedGroup || !this.currentUser) return false;
    const member = this.selectedGroup.miembros.find(m => m.userId === this.currentUser.id);
    return member?.role === 'Propietario' || member?.role === 'Administrador';
  }

  isCurrentUserOwner(): boolean {
    if (!this.selectedGroup || !this.currentUser) return false;
    return this.selectedGroup.propietarioId === this.currentUser.id;
  }
}