import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, HydratedGroup, UserRole } from '../models/group.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/groups`;
  
  getMyGroups(): Observable<HydratedGroup[]> {
    return this.http.get<HydratedGroup[]>(this.apiUrl);
  }

  /**
   * MÉTODO AÑADIDO: Obtiene los detalles de un solo grupo por su ID.
   */
  findOne(id: string): Observable<HydratedGroup> {
    return this.http.get<HydratedGroup>(`${this.apiUrl}/${id}`);
  }

  createGroup(nombre: string): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, { nombre });
  }
  
  updateGroup(groupId: string, nombre: string): Observable<Group> {
    return this.http.patch<Group>(`${this.apiUrl}/${groupId}`, { nombre });
  }

  deleteGroup(groupId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}`);
  }

  inviteMember(groupId: string, email: string, role: UserRole): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/members`, { email, role });
  }

  removeMember(groupId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/members/${userId}`);
  }

  updateMemberRole(groupId: string, userId: string, newRole: UserRole): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${groupId}/members/${userId}`, { role: newRole });
  }
}
