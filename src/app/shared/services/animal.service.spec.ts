import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnimalService } from './animal.service';
import { Animal } from '../models/animal.model';
import { environment } from '../../../environments/environment';

describe('AnimalService', () => {
  let service: AnimalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnimalService],
    });
    service = TestBed.inject(AnimalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAnimales', () => {
    it('should return paginated animals', () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            caravana: 'CAR-001',
            tipoAnimal: 'Vaca',
            pelaje: 'Blanco/a',
            sexo: 'Hembra',
          } as Animal,
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      service.getAnimales(1, 10).subscribe((response) => {
        expect(response.data.length).toBe(1);
        expect(response.total).toBe(1);
        expect(response.data[0].caravana).toBe('CAR-001');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch animals for a group', () => {
      const groupId = 'group-1';
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      service.getAnimales(1, 10, groupId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/animals/by-group/${groupId}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getAnimalById', () => {
    it('should return a single animal', () => {
      const mockAnimal: Animal = {
        id: '1',
        caravana: 'CAR-001',
        tipoAnimal: 'Vaca',
        pelaje: 'Blanco/a',
        sexo: 'Hembra',
      };

      service.getAnimalById('1').subscribe((animal) => {
        expect(animal.id).toBe('1');
        expect(animal.caravana).toBe('CAR-001');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAnimal);
    });
  });

  describe('createAnimal', () => {
    it('should create an animal', () => {
      const newAnimal: Partial<Animal> = {
        caravana: 'CAR-002',
        tipoAnimal: 'Vaca',
        pelaje: 'Blanco/a',
        sexo: 'Hembra',
      };

      const mockResponse: Animal = {
        id: '2',
        ...newAnimal,
      } as Animal;

      service.createAnimal(newAnimal).subscribe((animal) => {
        expect(animal.id).toBe('2');
        expect(animal.caravana).toBe('CAR-002');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAnimal);
      req.flush(mockResponse);
    });
  });

  describe('updateAnimal', () => {
    it('should update an animal', () => {
      const updates: Partial<Animal> = {
        caravana: 'CAR-003',
      };

      const mockResponse: Animal = {
        id: '1',
        caravana: 'CAR-003',
        tipoAnimal: 'Vaca',
        pelaje: 'Blanco/a',
        sexo: 'Hembra',
      } as Animal;

      service.updateAnimal('1', updates).subscribe((animal) => {
        expect(animal.caravana).toBe('CAR-003');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });
  });

  describe('deleteAnimal', () => {
    it('should delete an animal', () => {
      service.deleteAnimal('1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('updateAnimalRelations', () => {
    it('should update animal relations', () => {
      const relations = {
        idMadre: 'animal-2',
        idPadre: 'animal-3',
      };

      const mockResponse: Animal = {
        id: '1',
        idMadre: 'animal-2',
        idPadre: 'animal-3',
        tipoAnimal: 'Ternero',
        pelaje: 'Blanco/a',
        sexo: 'Macho',
      } as Animal;

      service.updateAnimalRelations('1', relations).subscribe((animal) => {
        expect(animal.idMadre).toBe('animal-2');
        expect(animal.idPadre).toBe('animal-3');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals/1/relations`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(relations);
      req.flush(mockResponse);
    });
  });

  describe('getAnimalRelations', () => {
    it('should get animal family relations', () => {
      const mockResponse = {
        animal: {
          id: '1',
          tipoAnimal: 'Ternero',
          pelaje: 'Blanco/a',
          sexo: 'Macho',
        },
        madre: {
          id: '2',
          tipoAnimal: 'Vaca',
          sexo: 'Hembra',
        },
        padre: {
          id: '3',
          tipoAnimal: 'Toro',
          sexo: 'Macho',
        },
        crias: [],
      };

      service.getAnimalRelations('1').subscribe((relations) => {
        expect(relations.animal.id).toBe('1');
        expect(relations.madre?.id).toBe('2');
        expect(relations.padre?.id).toBe('3');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/animals/1/relations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});

