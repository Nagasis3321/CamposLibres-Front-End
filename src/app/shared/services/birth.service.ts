import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Birth, CreateBirthDto } from '../models/birth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BirthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/births`;

  getBirthsByAnimal(animalId: string): Observable<Birth[]> {
    return this.http.get<Birth[]>(`${this.apiUrl}/animal/${animalId}`);
  }

  getBirthById(id: string): Observable<Birth> {
    return this.http.get<Birth>(`${this.apiUrl}/${id}`);
  }

  createBirth(birthData: CreateBirthDto): Observable<Birth> {
    return this.http.post<Birth>(this.apiUrl, birthData);
  }

  updateBirth(id: string, birthData: Partial<CreateBirthDto>): Observable<Birth> {
    return this.http.patch<Birth>(`${this.apiUrl}/${id}`, birthData);
  }

  deleteBirth(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

