import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DuenoService {
  // Simulación hasta que haya un endpoint de API para dueños
  private duenosDeEjemplo = ['Julio Terleski', 'Ramon Diaz', 'Mariel Ojeda', 'Elio Terleski'];

  getDuenos(): Observable<string[]> {
    return of(this.duenosDeEjemplo);
  }
}

