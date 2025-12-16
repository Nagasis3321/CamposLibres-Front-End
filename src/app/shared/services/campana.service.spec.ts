import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CampanaService } from './campana.service';
import { Campana, CampaignDto } from '../models/campana.model';
import { environment } from '../../../environments/environment';

describe('CampanaService', () => {
  let service: CampanaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CampanaService],
    });
    service = TestBed.inject(CampanaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCampaigns', () => {
    it('should return campaigns for user', () => {
      const mockCampaigns: Campana[] = [
        {
          id: 'campaign-1',
          nombre: 'Test Campaign',
          fecha: '2024-01-01',
          animales: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      service.getCampaigns({ groupId: null }).subscribe((campaigns) => {
        expect(campaigns.length).toBe(1);
        expect(campaigns[0].nombre).toBe('Test Campaign');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCampaigns);
    });

    it('should return campaigns for a group', () => {
      const mockCampaigns: Campana[] = [];

      service.getCampaigns({ groupId: 'group-1' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns/by-group/group-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCampaigns);
    });
  });

  describe('getCampaignById', () => {
    it('should return a single campaign', () => {
      const mockCampaign: Campana = {
        id: 'campaign-1',
        nombre: 'Test Campaign',
        fecha: '2024-01-01',
        animales: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.getCampaignById('campaign-1').subscribe((campaign) => {
        expect(campaign.id).toBe('campaign-1');
        expect(campaign.nombre).toBe('Test Campaign');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns/campaign-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCampaign);
    });
  });

  describe('createCampaign', () => {
    it('should create a campaign', () => {
      const campaignDto: CampaignDto = {
        nombre: 'New Campaign',
        fecha: '2024-01-01',
        animalesIds: ['animal-1'],
      };

      const mockCampaign: Campana = {
        id: 'campaign-2',
        ...campaignDto,
        animales: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.createCampaign(campaignDto).subscribe((campaign) => {
        expect(campaign.nombre).toBe('New Campaign');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(campaignDto);
      req.flush(mockCampaign);
    });
  });

  describe('updateCampaign', () => {
    it('should update a campaign', () => {
      const updates: Partial<CampaignDto> = {
        nombre: 'Updated Campaign',
      };

      const mockCampaign: Campana = {
        id: 'campaign-1',
        nombre: 'Updated Campaign',
        fecha: '2024-01-01',
        animales: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.updateCampaign('campaign-1', updates).subscribe((campaign) => {
        expect(campaign.nombre).toBe('Updated Campaign');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns/campaign-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockCampaign);
    });
  });

  describe('deleteCampaign', () => {
    it('should delete a campaign', () => {
      service.deleteCampaign('campaign-1').subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns/campaign-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getCampaignsByGroup', () => {
    it('should return campaigns for a group', () => {
      const mockCampaigns: Campana[] = [];

      service.getCampaignsByGroup('group-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/campaigns/by-group/group-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCampaigns);
    });
  });
});
