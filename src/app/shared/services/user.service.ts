import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  /**
   * Obtiene una lista paginada de todos los usuarios.
   * @param page - El número de página a solicitar.
   * @param limit - El número de usuarios por página.
   * @returns Un Observable con la lista de usuarios paginada.
   */
  getUsers(page: number = 1, limit: number = 10): Observable<{ data: User[], total: number, page: number, limit: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<{ data: User[], total: number, page: number, limit: number }>(this.apiUrl, { params });
  }

  /**
   * Busca usuarios por su dirección de correo electrónico.
   * @param email - El email a buscar.
   * @returns Un Observable con la lista de usuarios que coinciden con el email.
   */
  searchUsersByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search/${email}`);
  }

  /**
   * Obtiene la información de un usuario específico por su ID.
   * @param id - El ID del usuario a obtener.
   * @returns Un Observable con los datos del usuario.
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza la información de un usuario.
   * @param id - El ID del usuario a actualizar.
   * @param user - Los datos del usuario a modificar.
   * @returns Un Observable con los datos del usuario actualizado.
   */
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Elimina a un usuario del sistema.
   * @param id - El ID del usuario a eliminar.
   * @returns Un Observable que se completa cuando el usuario es eliminado.
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param userData - Los datos del usuario a crear (nombre, email, password).
   * @returns Un Observable con los datos del usuario creado (sin contraseña).
   */
  createUser(userData: { nombre: string, email: string, password: string }): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }
}