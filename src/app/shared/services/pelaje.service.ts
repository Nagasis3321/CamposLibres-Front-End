import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PelajeService {
  // Simulación hasta que haya un endpoint de API para pelajes
  private pelajesDeEjemplo = ['Pampa Varcina', 'Overo', 'Valla', 'Colorada Cara Blanca', 'Blanco/a', 'Osco', 'Colorada', 'Pampa'];

  getPelajes(): Observable<string[]> {
    return of(this.pelajesDeEjemplo);
  }
}

