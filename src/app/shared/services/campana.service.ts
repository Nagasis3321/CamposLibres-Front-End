import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campana, CampaignDto } from '../models/campana.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampanaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/campaigns`;

  getCampaigns(context: { groupId?: string | null }): Observable<Campana[]> {
    const url = context.groupId ? `${this.apiUrl}/by-group/${context.groupId}` : this.apiUrl;
    return this.http.get<Campana[]>(url);
  }

  getCampaignById(id: string): Observable<Campana> {
    return this.http.get<Campana>(`${this.apiUrl}/${id}`);
  }

  getCampaignsByGroup(groupId: string): Observable<Campana[]> {
    return this.http.get<Campana[]>(`${this.apiUrl}/by-group/${groupId}`);
  }

  createCampaign(campaignData: CampaignDto): Observable<Campana> {
    return this.http.post<Campana>(this.apiUrl, campaignData);
  }

  updateCampaign(id: string, campaignData: Partial<CampaignDto>): Observable<Campana> {
    return this.http.patch<Campana>(`${this.apiUrl}/${id}`, campaignData);
  }

  deleteCampaign(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}