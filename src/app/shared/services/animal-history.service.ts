import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimalHistory, CreateAnimalHistoryDto } from '../models/animal-history.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalHistoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/animal-history`;

  getHistoryByAnimal(animalId: string): Observable<AnimalHistory[]> {
    return this.http.get<AnimalHistory[]>(`${this.apiUrl}/animal/${animalId}`);
  }

  getHistoryById(id: string): Observable<AnimalHistory> {
    return this.http.get<AnimalHistory>(`${this.apiUrl}/${id}`);
  }

  createHistory(historyData: CreateAnimalHistoryDto): Observable<AnimalHistory> {
    return this.http.post<AnimalHistory>(this.apiUrl, historyData);
  }

  updateHistory(id: string, historyData: Partial<CreateAnimalHistoryDto>): Observable<AnimalHistory> {
    return this.http.patch<AnimalHistory>(`${this.apiUrl}/${id}`, historyData);
  }

  deleteHistory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

