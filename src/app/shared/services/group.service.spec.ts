import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GroupService } from './group.service';
import { Group, HydratedGroup, UserRole } from '../models/group.model';
import { environment } from '../../../environments/environment';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GroupService],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyGroups', () => {
    it('should return groups for user', () => {
      const mockGroups: HydratedGroup[] = [
        {
          id: 'group-1',
          nombre: 'Test Group',
          propietario: {
            id: 'user-1',
            nombre: 'Owner',
            email: 'owner@example.com',
          },
          miembros: [],
        },
      ];

      service.getMyGroups().subscribe((groups) => {
        expect(groups.length).toBe(1);
        expect(groups[0].nombre).toBe('Test Group');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGroups);
    });
  });

  describe('findOne', () => {
    it('should return a single group', () => {
      const mockGroup: HydratedGroup = {
        id: 'group-1',
        nombre: 'Test Group',
        propietario: {
          id: 'user-1',
          nombre: 'Owner',
          email: 'owner@example.com',
        },
        miembros: [],
      };

      service.findOne('group-1').subscribe((group) => {
        expect(group.id).toBe('group-1');
        expect(group.nombre).toBe('Test Group');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups/group-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockGroup);
    });
  });

  describe('createGroup', () => {
    it('should create a group', () => {
      const newGroup: Group = {
        id: 'group-2',
        nombre: 'New Group',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.createGroup('New Group').subscribe((group) => {
        expect(group.nombre).toBe('New Group');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ nombre: 'New Group' });
      req.flush(newGroup);
    });
  });

  describe('updateGroup', () => {
    it('should update a group', () => {
      const updatedGroup: Group = {
        id: 'group-1',
        nombre: 'Updated Group',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateGroup('group-1', 'Updated Group').subscribe((group) => {
        expect(group.nombre).toBe('Updated Group');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups/group-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ nombre: 'Updated Group' });
      req.flush(updatedGroup);
    });
  });

  describe('deleteGroup', () => {
    it('should delete a group', () => {
      service.deleteGroup('group-1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups/group-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('inviteMember', () => {
    it('should invite a member', () => {
      const mockResponse = {
        groupId: 'group-1',
        userId: 'user-2',
        role: 'Miembro' as UserRole,
      };

      service.inviteMember('group-1', 'user@example.com', 'Miembro').subscribe((response) => {
        expect(response.groupId).toBe('group-1');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups/group-1/members`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'user@example.com',
        role: 'Miembro',
      });
      req.flush(mockResponse);
    });
  });

  describe('removeMember', () => {
    it('should remove a member', () => {
      service.removeMember('group-1', 'user-2').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/groups/group-1/members/user-2`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role', () => {
      const mockResponse = {
        groupId: 'group-1',
        userId: 'user-2',
        role: 'Administrador' as UserRole,
      };

      service.updateMemberRole('group-1', 'user-2', 'Administrador').subscribe((response) => {
        expect(response.role).toBe('Administrador');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/groups/group-1/members/user-2`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ role: 'Administrador' });
      req.flush(mockResponse);
    });
  });
});
