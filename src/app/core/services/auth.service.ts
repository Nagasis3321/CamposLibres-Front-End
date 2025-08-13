import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, switchMap, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);
  private router = inject(Router);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.tryRehydrateUser();
  }

  private tryRehydrateUser(): void {
    const token = localStorage.getItem('authToken');
    const userJson = localStorage.getItem('currentUser');
    if (token && userJson && !this.currentUserSubject.getValue()) {
      const user: User = JSON.parse(userJson);
      this.currentUserSubject.next(user);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.userService.findUserByEmail(email).pipe(
      switchMap(user => {
        // En una app real, aquí se verificaría la contraseña.
        if (user) {
          const fakeToken = `fake-jwt-token-for-${user.id}`;
          localStorage.setItem('authToken', fakeToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return of(true).pipe(
            delay(1000),
            tap(() => this.router.navigate(['/dashboard']))
          );
        }
        return throwError(() => new Error('Credenciales incorrectas.'));
      })
    );
  }

  register(nombre: string, email: string, password: string): Observable<User> {
    // Llama al servicio de usuario para crear el nuevo usuario.
    return this.userService.createUser(nombre, email, password);
  }

  createDemoUserAndLogin(): Observable<boolean> {
    const demoUser: User = {
      id: 'user-demo-123',
      nombre: 'Usuario Demo',
      email: 'demo@camposlibres.com'
    };
    const fakeToken = `fake-jwt-token-for-${demoUser.id}`;
    
    localStorage.setItem('authToken', fakeToken);
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    this.currentUserSubject.next(demoUser);

    return of(true).pipe(
      delay(1000),
      tap(() => this.router.navigate(['/dashboard']))
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
