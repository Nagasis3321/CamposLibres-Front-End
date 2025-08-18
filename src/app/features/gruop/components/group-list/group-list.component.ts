import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Group, HydratedGroup } from '../../../../shared/models/group.model'; // Importar HydratedGroup
import { User } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3 class="text-lg font-semibold mb-3">Mis Grupos</h3>
      <div *ngIf="groups.length > 0; else noGroups" class="space-y-2">
        <div *ngFor="let group of groups" 
             class="p-3 rounded-md transition-colors flex justify-between items-center"
             [ngClass]="selectedGroupId === group.id ? 'bg-primary text-white' : 'hover:bg-gray-100 cursor-pointer'"
             (click)="select.emit(group)">
          <span>{{ group.nombre }}</span>
          <div *ngIf="selectedGroupId === group.id && isOwner(group)" class="flex space-x-2">
            <button (click)="$event.stopPropagation(); edit.emit(group)" class="text-white hover:text-yellow-300 text-xs font-semibold">EDITAR</button>
            <button (click)="$event.stopPropagation(); delete.emit(group)" class="text-white hover:text-red-300 text-xs font-semibold">ELIMINAR</button>
          </div>
        </div>
      </div>
      <ng-template #noGroups><p class="text-sm text-neutral italic">No perteneces a ningún grupo.</p></ng-template>
    </div>
  `
})
export class GroupListComponent {
  @Input() groups: HydratedGroup[] = []; // <-- CORRECCIÓN: Ahora es HydratedGroup[]
  @Input() selectedGroupId: string | null = null;
  @Input() currentUser!: User;
  @Output() select = new EventEmitter<HydratedGroup>(); // <-- CORRECCIÓN: Emite HydratedGroup
  @Output() edit = new EventEmitter<HydratedGroup>();   // <-- CORRECCIÓN: Emite HydratedGroup
  @Output() delete = new EventEmitter<HydratedGroup>(); // <-- CORRECCIÓN: Emite HydratedGroup

  isOwner(group: HydratedGroup): boolean {
    return group.propietarioId === this.currentUser.id;
  }
}