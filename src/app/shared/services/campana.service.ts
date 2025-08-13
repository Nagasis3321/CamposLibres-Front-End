import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Campana } from '../models/campana.model';

@Injectable({
  providedIn: 'root'
})
export class CampanaService {
  private campanasDeEjemplo: Campana[] = [
    { 
      idCampana: 'CAMP001', 
      nombreCampana: 'Vitaminas Invierno 2024', 
      fechaCampana: '2024-07-15', 
      productoUtilizado: 'Complejo Vitamínico XYZ', 
      loteProducto: 'VXL001', 
      responsableCarga: 'Dr. Vet Ejemplo', 
      obsCampana: 'Aplicar a todo el rodeo.', 
      estado: 'Pendiente Carga', 
      animalesAgregados: [] 
    },
    { 
      idCampana: 'CAMP002', 
      nombreCampana: 'Aftosa Primavera 2023', 
      fechaCampana: '2023-10-05', 
      productoUtilizado: 'Vacuna Aftosa Oil', 
      loteProducto: 'AFTL088', 
      responsableCarga: 'Téc. Ganadero', 
      obsCampana: 'Rodeo general.', 
      estado: 'Completada', 
      animalesAgregados: [
        {id: 'A001', caravana: '1515'}, 
        {id: 'A004', caravana: '4574'}
      ] 
    }
  ];

  /**
   * Devuelve la lista completa de campañas como un Observable.
   */
  getCampanas(): Observable<Campana[]> {
    return of(this.campanasDeEjemplo).pipe(delay(500));
  }
}
