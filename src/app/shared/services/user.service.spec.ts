import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return paginated users', () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            nombre: 'Test User',
            email: 'test@example.com',
          } as User,
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      service.getUsers(1, 10).subscribe((response) => {
        expect(response.data.length).toBe(1);
        expect(response.total).toBe(1);
        expect(response.data[0].nombre).toBe('Test User');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchUsersByEmail', () => {
    it('should search users by email', () => {
      const mockUsers: User[] = [
        {
          id: '1',
          nombre: 'Test User',
          email: 'test@example.com',
        },
      ];

      service.searchUsersByEmail('test').subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/search/test`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return a single user', () => {
      const mockUser: User = {
        id: '1',
        nombre: 'Test User',
        email: 'test@example.com',
      };

      service.getUserById('1').subscribe((user) => {
        expect(user.id).toBe('1');
        expect(user.nombre).toBe('Test User');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user', () => {
      const updates: Partial<User> = {
        nombre: 'Updated Name',
      };

      const mockUser: User = {
        id: '1',
        nombre: 'Updated Name',
        email: 'test@example.com',
      };

      service.updateUser('1', updates).subscribe((user) => {
        expect(user.nombre).toBe('Updated Name');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      service.deleteUser('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('createUser', () => {
    it('should create a new user', () => {
      const newUser = {
        nombre: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: '2',
        ...newUser,
      };

      service.createUser(newUser).subscribe((user) => {
        expect(user.id).toBe('2');
        expect(user.nombre).toBe('New User');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newUser);
      req.flush(mockUser);
    });
  });
});
