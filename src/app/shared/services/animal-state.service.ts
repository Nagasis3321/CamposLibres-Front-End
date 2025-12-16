import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnimalState, CreateAnimalStateDto } from '../models/animal-state.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalStateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/animal-states`;

  getStatesByAnimal(animalId: string): Observable<AnimalState[]> {
    return this.http.get<AnimalState[]>(`${this.apiUrl}/animal/${animalId}`);
  }

  getActiveStatesByAnimal(animalId: string): Observable<AnimalState[]> {
    return this.http.get<AnimalState[]>(`${this.apiUrl}/animal/${animalId}/active`);
  }

  getStateById(id: string): Observable<AnimalState> {
    return this.http.get<AnimalState>(`${this.apiUrl}/${id}`);
  }

  createState(stateData: CreateAnimalStateDto): Observable<AnimalState> {
    return this.http.post<AnimalState>(this.apiUrl, stateData);
  }

  updateState(id: string, stateData: Partial<CreateAnimalStateDto>): Observable<AnimalState> {
    return this.http.patch<AnimalState>(`${this.apiUrl}/${id}`, stateData);
  }

  deleteState(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

