import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // URL base de tu API (ajústala si es necesario)
  private apiUrl = 'http://localhost:3000/auth'; 

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.tryRehydrateUser();
  }

  private tryRehydrateUser(): void {
    const token = this.getToken();
    if (token && !this.currentUserSubject.getValue()) {
      // Valida el token contra el endpoint de perfil al iniciar.
      this.http.get<User>(`${this.apiUrl}/profile`).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout() // Si el token no es válido, cierra la sesión.
      });
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }
  
  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  login(email: string, password: string): Observable<{ accessToken: string, user: User }> {
    return this.http.post<{ accessToken: string, user: User }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.accessToken);
        this.currentUserSubject.next(response.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(nombre: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { nombre, email, password });
  }

  createDemoUserAndLogin(): Observable<{ accessToken: string, user: User }> {
    return this.http.post<{ accessToken: string, user: User }>(`${this.apiUrl}/demo`, {}).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.accessToken);
        this.currentUserSubject.next(response.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
