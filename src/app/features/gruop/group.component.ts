import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { Group, HydratedGroup, HydratedMember, UserRole } from '../../shared/models/group.model';
import { User } from '../../shared/models/user.model';
import { GroupService } from '../../shared/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { GroupListComponent } from './components/group-list/group-list.component';
import { MemberManagerComponent } from './components/member-manager/member-manager.component';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, ModalComponent, GroupFormComponent, GroupListComponent, MemberManagerComponent],
  templateUrl: './group.component.html',
})
export class GroupComponent implements OnInit {
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private userService = inject(UserService);

  private groupsSubject = new BehaviorSubject<HydratedGroup[]>([]);
  userGroups$: Observable<HydratedGroup[]> = this.groupsSubject.asObservable();
  
  allUsers: User[] = [];
  selectedGroup: HydratedGroup | null = null;
  currentUser!: User;
  
  isModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  groupToEdit: Group | null = null;

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (!user) {
      this.notificationService.showError('Error de autenticación. Por favor, inicie sesión de nuevo.');
      this.authService.logout();
      return;
    }
    this.currentUser = user;

    forkJoin({
      users: this.userService.getUsers(),
      groups: this.groupService.getMyGroups() 
    }).subscribe(({ users, groups }) => {
      // ✅ **CORRECCIÓN AQUÍ**
      // Accedemos a la propiedad 'data' que contiene el array de usuarios.
      this.allUsers = users.data; 
      this.groupsSubject.next(groups);
    });
  }

  loadGroups(): void {
    this.groupService.getMyGroups().subscribe(groups => {
      this.groupsSubject.next(groups);
      if (this.selectedGroup) {
        const updatedSelectedGroup = groups.find(g => g.id === this.selectedGroup!.id);
        this.selectedGroup = updatedSelectedGroup || null;
      }
    });
  }

  selectGroup(group: HydratedGroup): void {
    this.selectedGroup = group;
  }

  // --- Manejo de Modales ---
  openCreateModal(): void {
    this.modalMode = 'create';
    this.groupToEdit = null;
    this.isModalOpen = true;
  }

  onEditRequest(group: HydratedGroup): void {
    this.modalMode = 'edit';
    this.groupToEdit = { id: group.id, nombre: group.nombre, propietarioId: group.propietarioId, miembros: [] };
    this.isModalOpen = true;
  }

  // --- Acciones de Grupo ---
  onSaveGroup(nombre: string): void {
    const action = this.modalMode === 'create'
      ? this.groupService.createGroup(nombre)
      : this.groupService.updateGroup(this.groupToEdit!.id, nombre);

    action.subscribe(() => {
      const message = this.modalMode === 'create' ? 'creado' : 'actualizado';
      this.notificationService.showSuccess(`Grupo "${nombre}" ${message}.`);
      this.loadGroups();
      this.isModalOpen = false;
    });
  }

  onDeleteRequest(group: HydratedGroup): void {
    if (!confirm(`¿Estás seguro de que quieres eliminar el grupo "${group.nombre}"? Esta acción no se puede deshacer.`)) return;
    
    this.groupService.deleteGroup(group.id).subscribe(() => {
      this.notificationService.showSuccess(`Grupo "${group.nombre}" eliminado correctamente.`);
      this.loadGroups();
      this.selectedGroup = null;
    });
  }

  onLeaveGroup(group: HydratedGroup): void {
    if (!confirm(`¿Estás seguro de que quieres salir del grupo "${group.nombre}"?`)) return;
    
    // Para salir del grupo, simplemente removemos al usuario actual de los miembros
    this.groupService.removeMember(group.id, this.currentUser.id).subscribe(() => {
      this.notificationService.showSuccess(`Has salido del grupo "${group.nombre}".`);
      this.loadGroups();
      this.selectedGroup = null;
    });
  }

  // --- Acciones de Miembros ---
  onInviteMember(event: { email: string, role: UserRole }): void {
    if (!this.selectedGroup) return;
    this.groupService.inviteMember(this.selectedGroup.id, event.email, event.role).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Invitación enviada a ${event.email}.`);
        this.loadGroups();
      },
      error: (err) => this.notificationService.showError(err.error?.message || 'Error al invitar miembro.')
    });
  }

  onRemoveMember(member: HydratedMember): void {
    if (!this.selectedGroup) return;
    this.groupService.removeMember(this.selectedGroup.id, member.userId).subscribe(() => {
      this.notificationService.showSuccess(`Miembro ${member.nombre} eliminado.`);
      this.loadGroups();
    });
  }

  onChangeRole(event: { member: HydratedMember, newRole: UserRole }): void {
    if (!this.selectedGroup) return;
    this.groupService.updateMemberRole(this.selectedGroup.id, event.member.userId, event.newRole).subscribe(() => {
      this.notificationService.showSuccess(`Rol de ${event.member.nombre} actualizado.`);
      this.loadGroups();
    });
  }
}