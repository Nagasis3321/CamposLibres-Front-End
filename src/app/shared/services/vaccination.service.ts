import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vaccination, CreateVaccinationDto } from '../models/vaccination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VaccinationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vaccinations`;

  getVaccinationsByAnimal(animalId: string): Observable<Vaccination[]> {
    return this.http.get<Vaccination[]>(`${this.apiUrl}/animal/${animalId}`);
  }

  getVaccinationById(id: string): Observable<Vaccination> {
    return this.http.get<Vaccination>(`${this.apiUrl}/${id}`);
  }

  createVaccination(vaccinationData: CreateVaccinationDto): Observable<Vaccination> {
    return this.http.post<Vaccination>(this.apiUrl, vaccinationData);
  }

  updateVaccination(id: string, vaccinationData: Partial<CreateVaccinationDto>): Observable<Vaccination> {
    return this.http.patch<Vaccination>(`${this.apiUrl}/${id}`, vaccinationData);
  }

  deleteVaccination(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

