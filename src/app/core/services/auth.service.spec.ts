import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login and store token', () => {
      const mockResponse = {
        accessToken: 'test-token',
        user: {
          id: '1',
          nombre: 'Test User',
          email: 'test@example.com',
        } as User,
      };

      service.login('test@example.com', 'password123').subscribe((response) => {
        expect(response.accessToken).toBe('test-token');
        expect(response.user.email).toBe('test@example.com');
        expect(localStorage.getItem('authToken')).toBe('test-token');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      const mockUser: User = {
        id: '1',
        nombre: 'Test User',
        email: 'test@example.com',
      };

      service.register('Test User', 'test@example.com', 'password123').subscribe((user) => {
        expect(user.id).toBe('1');
        expect(user.nombre).toBe('Test User');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      req.flush(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear token and navigate to login', () => {
      localStorage.setItem('authToken', 'test-token');

      service.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('authToken', 'test-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if token does not exist', () => {
      localStorage.removeItem('authToken');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('authToken', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null if token does not exist', () => {
      localStorage.removeItem('authToken');
      expect(service.getToken()).toBeNull();
    });
  });

  describe('createDemoUserAndLogin', () => {
    it('should create demo user and login', () => {
      const mockResponse = {
        accessToken: 'demo-token',
        user: {
          id: '1',
          nombre: 'Usuario Demo',
          email: 'demo@example.com',
        } as User,
      };

      service.createDemoUserAndLogin().subscribe((response) => {
        expect(response.accessToken).toBe('demo-token');
        expect(localStorage.getItem('authToken')).toBe('demo-token');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/demo`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('currentUser$', () => {
    it('should emit current user', (done) => {
      const mockUser: User = {
        id: '1',
        nombre: 'Test User',
        email: 'test@example.com',
      };

      service.currentUser$.subscribe((user) => {
        // Initially null
        if (user) {
          expect(user.id).toBe('1');
          done();
        }
      });

      // Simulate setting user (internal method call)
      const mockResponse = {
        accessToken: 'test-token',
        user: mockUser,
      };

      service.login('test@example.com', 'password123').subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });
  });
});

