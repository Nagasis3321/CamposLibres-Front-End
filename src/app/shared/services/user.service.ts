import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private todosLosUsuarios: User[] = [
    { id: 'u001', nombre: 'Julio Terleski', email: 'admin@camposlibres.com' },
    { id: 'u002', nombre: 'Ramon Diaz', email: 'ramon@example.com' },
    { id: 'u003', nombre: 'Mariel Ojeda', email: 'mariel@example.com' },
    { id: 'u004', nombre: 'Elio Terleski', email: 'elio@example.com' },
  ];

  getUsers(): Observable<User[]> {
    return of(this.todosLosUsuarios).pipe(delay(200));
  }

  findUserByEmail(email: string): Observable<User | undefined> {
    const user = this.todosLosUsuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
    return of(user);
  }

  createUser(nombre: string, email: string, password: string): Observable<User> {
    const emailExists = this.todosLosUsuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return throwError(() => new Error('El email ya está registrado.'));
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      nombre,
      email
    };
    this.todosLosUsuarios.push(newUser);
    return of(newUser).pipe(delay(500));
  }
}