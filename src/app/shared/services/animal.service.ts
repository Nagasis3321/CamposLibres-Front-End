import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../models/animal.model';
import { environment } from '../../../environments/environment'; // Importa environment

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/animals`; // Usa la variable de entorno

  getAnimales(page = 1, limit = 1000, groupId?: string | null): Observable<{ data: Animal[], total: number, page: number, limit: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    const url = groupId ? `${this.apiUrl}/by-group/${groupId}` : this.apiUrl;

    return this.http.get<{ data: Animal[], total: number, page: number, limit: number }>(url, { params });
  }

  getAnimalById(animalId: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${animalId}`);
  }

  getAnimalRelations(animalId: string): Observable<{ animal: Animal, madre: Animal | null, padre: Animal | null, crias: Animal[] }> {
    return this.http.get<{ animal: Animal, madre: Animal | null, padre: Animal | null, crias: Animal[] }>(`${this.apiUrl}/${animalId}/relations`);
  }

  createAnimal(animalData: Partial<Animal>): Observable<Animal> {
    return this.http.post<Animal>(this.apiUrl, animalData);
  }

  updateAnimal(animalId: string, animalData: Partial<Animal>): Observable<Animal> {
    return this.http.patch<Animal>(`${this.apiUrl}/${animalId}`, animalData);
  }

  deleteAnimal(animalId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${animalId}`);
  }

  updateAnimalMother(animalId: string, newMotherId: string | null): Observable<Animal> {
    return this.http.patch<Animal>(`${this.apiUrl}/${animalId}/relations`, { idMadre: newMotherId });
  }

  updateAnimalRelations(animalId: string, relations: { idMadre?: string | null, idPadre?: string | null }): Observable<Animal> {
    return this.http.patch<Animal>(`${this.apiUrl}/${animalId}/relations`, relations);
  }
}