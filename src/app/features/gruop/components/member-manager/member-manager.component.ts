import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HydratedGroup, HydratedMember, UserRole } from '../../../../shared/models/group.model';
import { User } from '../../../../shared/models/user.model';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-member-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './member-manager.component.html',
})
export class MemberManagerComponent {
  @Input() group!: HydratedGroup;
  @Input() currentUser!: User;
  @Output() invite = new EventEmitter<{ email: string, role: UserRole }>();
  @Output() remove = new EventEmitter<HydratedMember>();
  @Output() changeRole = new EventEmitter<{ member: HydratedMember, newRole: UserRole }>();

  inviteForm: FormGroup;
  showUserModal = false;
  selectedMember: HydratedMember | null = null;
  
  get currentUserRole(): UserRole | undefined {
    return this.group.miembros.find(m => m.userId === this.currentUser.id)?.role;
  }

  constructor(private fb: FormBuilder) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['Miembro', Validators.required]
    });
  }

  onInviteSubmit(): void {
    if (this.inviteForm.invalid) return;
    this.invite.emit(this.inviteForm.value);
    this.inviteForm.reset({ role: 'Miembro' });
  }

  canManageMembers(): boolean {
    const role = this.currentUserRole;
    return role === 'Propietario' || role === 'Administrador';
  }

  canEditMember(member: HydratedMember): boolean {
    const role = this.currentUserRole;
    if (!role || role === 'Miembro') return false;
    if (role === 'Propietario') return member.role !== 'Propietario';
    if (role === 'Administrador') return member.role === 'Miembro';
    return false;
  }

  showMemberDetails(member: HydratedMember): void {
    this.selectedMember = member;
    this.showUserModal = true;
  }
}