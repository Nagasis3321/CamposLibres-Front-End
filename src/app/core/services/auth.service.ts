import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment'; // Importa environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  
  private apiUrl = `${environment.apiUrl}/auth`; // Usa la variable de entorno

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.tryRehydrateUser();
  }

  private tryRehydrateUser(): void {
    const token = this.getToken();
    if (token && !this.currentUserSubject.getValue()) {
      this.http.get<User>(`${this.apiUrl}/profile`).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }
  
  public getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('authToken');
  }

  login(email: string, password: string): Observable<{ accessToken: string, user: User }> {
    return this.http.post<{ accessToken: string, user: User }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (this.isBrowser) {
          localStorage.setItem('authToken', response.accessToken);
        }
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
        if (this.isBrowser) {
          localStorage.setItem('authToken', response.accessToken);
        }
        this.currentUserSubject.next(response.user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profile`).pipe(
      tap(() => {
        this.logout();
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}