import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AnimalesComponent } from './animales.component';
import { AnimalService } from '../../shared/services/animal.service';
import { GroupService } from '../../shared/services/group.service';
import { PelajeService } from '../../shared/services/pelaje.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Animal } from '../../shared/models/animal.model';
import { HydratedGroup } from '../../shared/models/group.model';
import { User } from '../../shared/models/user.model';

describe('AnimalesComponent', () => {
  let component: AnimalesComponent;
  let fixture: ComponentFixture<AnimalesComponent>;
  let animalService: jasmine.SpyObj<AnimalService>;
  let groupService: jasmine.SpyObj<GroupService>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 'user-1',
    nombre: 'Test User',
    email: 'test@example.com',
  };

  const mockGroups: HydratedGroup[] = [];

  beforeEach(async () => {
    const animalServiceSpy = jasmine.createSpyObj('AnimalService', [
      'getAnimales',
      'createAnimal',
      'updateAnimal',
      'deleteAnimal',
    ]);
    const groupServiceSpy = jasmine.createSpyObj('GroupService', ['getMyGroups']);
    const pelajeServiceSpy = jasmine.createSpyObj('PelajeService', ['getPelajes']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['currentUserValue']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AnimalesComponent, HttpClientTestingModule],
      providers: [
        { provide: AnimalService, useValue: animalServiceSpy },
        { provide: GroupService, useValue: groupServiceSpy },
        { provide: PelajeService, useValue: pelajeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalesComponent);
    component = fixture.componentInstance;
    animalService = TestBed.inject(AnimalService) as jasmine.SpyObj<AnimalService>;
    groupService = TestBed.inject(GroupService) as jasmine.SpyObj<GroupService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    authService.currentUserValue = mockUser;
    groupService.getMyGroups.and.returnValue(of(mockGroups));
    pelajeServiceSpy.getPelajes.and.returnValue(of([]));
    animalService.getAnimales.and.returnValue(
      of({ data: [], total: 0, page: 1, limit: 10 }),
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load animals on init', () => {
    component.ngOnInit();
    expect(animalService.getAnimales).toHaveBeenCalled();
  });

  it('should filter by group', () => {
    component.ngOnInit();
    component.selectFilter('group-1');
    expect(animalService.getAnimales).toHaveBeenCalled();
  });

  it('should open modal to create animal', () => {
    component.ngOnInit();
    component.openModalParaCrear(mockGroups);
    expect(component.isModalOpen).toBe(true);
    expect(component.selectedAnimal).toBeNull();
  });

  it('should handle save animal - create', () => {
    const animalData: Partial<Animal> = {
      caravana: 'CAR-001',
      tipoAnimal: 'Vaca',
      pelaje: 'Blanco/a',
      sexo: 'Hembra',
    };

    const newAnimal: Animal = {
      id: 'animal-1',
      ...animalData,
    } as Animal;

    animalService.createAnimal.and.returnValue(of(newAnimal));

    component.ngOnInit();
    component.onSave(animalData);

    expect(animalService.createAnimal).toHaveBeenCalled();
    expect(notificationService.showSuccess).toHaveBeenCalled();
    expect(component.isModalOpen).toBe(false);
  });

  it('should handle save animal - update', () => {
    const existingAnimal: Animal = {
      id: 'animal-1',
      caravana: 'CAR-001',
      tipoAnimal: 'Vaca',
      pelaje: 'Blanco/a',
      sexo: 'Hembra',
    } as Animal;

    component.selectedAnimal = existingAnimal;

    const updateData: Partial<Animal> = {
      caravana: 'CAR-002',
    };

    const updatedAnimal: Animal = {
      ...existingAnimal,
      ...updateData,
    };

    animalService.updateAnimal.and.returnValue(of(updatedAnimal));

    component.ngOnInit();
    component.onSave(updateData);

    expect(animalService.updateAnimal).toHaveBeenCalled();
    expect(notificationService.showSuccess).toHaveBeenCalled();
  });

  it('should handle delete animal', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    animalService.deleteAnimal.and.returnValue(of(undefined));

    component.ngOnInit();
    component.onEliminar('animal-1');

    expect(animalService.deleteAnimal).toHaveBeenCalledWith('animal-1');
    expect(notificationService.showSuccess).toHaveBeenCalled();
  });

  it('should navigate to animal detail', () => {
    const animal: Animal = {
      id: 'animal-1',
    } as Animal;

    component.onVerDetalle(animal);

    expect(router.navigate).toHaveBeenCalledWith(['/animales', 'animal-1']);
  });

  it('should handle errors on save', () => {
    const animalData: Partial<Animal> = {
      caravana: 'CAR-001',
      tipoAnimal: 'Vaca',
      pelaje: 'Blanco/a',
      sexo: 'Hembra',
    };

    animalService.createAnimal.and.returnValue(
      throwError(() => ({ error: { message: 'Error test' } })),
    );

    component.ngOnInit();
    component.onSave(animalData);

    expect(notificationService.showError).toHaveBeenCalled();
  });
});

