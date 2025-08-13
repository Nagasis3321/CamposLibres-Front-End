import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError, switchMap } from 'rxjs';
import { Group, UserRole } from '../models/group.model';
import { User } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private userService = inject(UserService);

  private gruposDeEjemplo: Group[] = [
    {
      id: 'g001',
      nombre: 'Cooperativa "El Progreso"',
      propietarioId: 'u001',
      miembros: [
        { userId: 'u001', role: 'Propietario' },
        { userId: 'u002', role: 'Administrador' },
        { userId: 'u003', role: 'Miembro' },
      ]
    },
    {
      id: 'g002',
      nombre: 'Familia Terleski',
      propietarioId: 'u004',
      miembros: [
        { userId: 'u004', role: 'Propietario' },
        { userId: 'u001', role: 'Miembro' },
      ]
    }
  ];

  getGruposByUserId(userId: string): Observable<Group[]> {
    const grupos = this.gruposDeEjemplo.filter(g => g.miembros.some(m => m.userId === userId));
    return of(grupos).pipe(delay(500));
  }

  createGroup(nombre: string, creador: User): Observable<Group> {
    const nuevoGrupo: Group = {
      id: `g${Date.now()}`,
      nombre: nombre,
      propietarioId: creador.id,
      miembros: [{ userId: creador.id, role: 'Propietario' }]
    };
    this.gruposDeEjemplo.push(nuevoGrupo);
    return of(nuevoGrupo).pipe(delay(500));
  }
  
  updateGroup(groupId: string, nombre: string): Observable<Group> {
    const group = this.gruposDeEjemplo.find(g => g.id === groupId);
    if (!group) return throwError(() => new Error('Grupo no encontrado.'));
    group.nombre = nombre;
    return of(group).pipe(delay(500));
  }

  deleteGroup(groupId: string): Observable<{ success: boolean }> {
    this.gruposDeEjemplo = this.gruposDeEjemplo.filter(g => g.id !== groupId);
    return of({ success: true }).pipe(delay(500));
  }

  inviteMember(groupId: string, email: string, role: UserRole): Observable<Group> {
    return this.userService.findUserByEmail(email).pipe(
      switchMap(userToAdd => {
        if (!userToAdd) {
          return throwError(() => new Error(`Usuario con email ${email} no encontrado.`));
        }

        const group = this.gruposDeEjemplo.find(g => g.id === groupId);
        if (!group) {
          return throwError(() => new Error('Grupo no encontrado.'));
        }

        if (group.miembros.some(m => m.userId === userToAdd.id)) {
          return throwError(() => new Error('El usuario ya es miembro de este grupo.'));
        }

        group.miembros.push({ userId: userToAdd.id, role: role });
        return of(group).pipe(delay(500));
      })
    );
  }

  removeMember(groupId: string, userId: string): Observable<Group> {
    const group = this.gruposDeEjemplo.find(g => g.id === groupId);
    if (!group) return throwError(() => new Error('Grupo no encontrado.'));

    group.miembros = group.miembros.filter(m => m.userId !== userId);
    return of(group).pipe(delay(500));
  }

  updateMemberRole(groupId: string, userId: string, newRole: UserRole): Observable<Group> {
    const group = this.gruposDeEjemplo.find(g => g.id === groupId);
    if (!group) return throwError(() => new Error('Grupo no encontrado.'));

    const member = group.miembros.find(m => m.userId === userId);
    if (!member) return throwError(() => new Error('Miembro no encontrado.'));
    
    member.role = newRole;
    return of(group).pipe(delay(500));
  }
}