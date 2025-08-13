import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Animal } from '../models/animal.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private animalesDeEjemplo: Animal[] = [
    // ... (la lista de animales que ya tienes)
    {id: 'A001', caravana: '1515', tipoAnimal: 'Vaca', pelaje: 'Pampa Varcina', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Pampa Varcina', raza: 'Angus', fechaNacimiento: '2020-03-10', idMadre: null},
    {id: 'A002', caravana: '2232', tipoAnimal: 'Vaquilla', pelaje: 'Overo', sexo: 'Hembra', dueno: 'Ramon Diaz', descripcion: 'Pelaje Overo', raza: 'Brangus', fechaNacimiento: '2022-05-15', idMadre: 'A001'},
    {id: 'A003', caravana: '3406', tipoAnimal: 'Vaca', pelaje: 'Pampa Varcina', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Pampa Varcina', raza: 'Holando', fechaNacimiento: '2019-01-20', idMadre: null},
    {id: 'A004', caravana: '4574', tipoAnimal: 'Vaca', pelaje: 'Valla', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Valla', raza: 'Angus', fechaNacimiento: '2018-07-01', idMadre: null},
    {id: 'A005', caravana: '5106', tipoAnimal: 'Vaca', pelaje: 'Colorada Cara Blanca', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Colorada Cara Blanca', raza: 'Hereford', fechaNacimiento: '2021-02-11', idMadre: null},
    {id: 'A006', caravana: '6393', tipoAnimal: 'Vaca', pelaje: 'Blanco/a', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Blanco/a', raza: 'Criollo', fechaNacimiento: '2019-05-20', idMadre: null},
    {id: 'A007', caravana: '7491', tipoAnimal: 'Vaquilla', pelaje: 'Osco', sexo: 'Hembra', dueno: 'Elio Terleski', descripcion: 'Pelaje Osco', raza: 'Angus', fechaNacimiento: '2022-01-10', idMadre: 'A001'},
    {id: 'A008', caravana: '862', tipoAnimal: 'Vaca', pelaje: 'Blanco/a', sexo: 'Hembra', dueno: 'Elio Terleski', descripcion: 'Pelaje Blanco/a', raza: 'Brangus', fechaNacimiento: '2017-11-01', idMadre: null},
    {id: 'A009', caravana: '9510', tipoAnimal: 'Vaquilla', pelaje: 'Colorada', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Colorada', raza: 'Hereford', fechaNacimiento: '2022-02-20', idMadre: 'A005'},
    {id: 'A010', caravana: '', tipoAnimal: 'Ternero/a', pelaje: 'Pampa', sexo: 'Macho', dueno: 'Elio Terleski', descripcion: 'Ternero Pampa', raza: 'Criollo', fechaNacimiento: '2023-08-15', idMadre: 'A008'},
    {id: 'A011', caravana: '549', tipoAnimal: 'Vaca', pelaje: 'Pampa Colorado', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Pampa Colorado', raza: 'Angus', fechaNacimiento: '2018-02-01', idMadre: null},
    {id: 'A012', caravana: '221', tipoAnimal: 'Vaca', pelaje: 'Blanco/a', sexo: 'Hembra', dueno: 'Mariel Ojeda', descripcion: 'Pelaje Blanco/a', raza: 'Holando', fechaNacimiento: '2019-07-10', idMadre: null},
    {id: 'A013', caravana: '423', tipoAnimal: 'Novillo', pelaje: 'Pampa Colorado', sexo: 'Macho', dueno: 'Julio Terleski', descripcion: 'Pelaje Pampa Colorado', raza: 'Angus', fechaNacimiento: '2021-04-05', idMadre: 'A011'},
    {id: 'A014', caravana: '312', tipoAnimal: 'Vaca', pelaje: 'Colorada', sexo: 'Hembra', dueno: 'Julio Terleski', descripcion: 'Pelaje Colorada', raza: 'Hereford', fechaNacimiento: '2017-09-12', idMadre: null},
    {id: 'A015', caravana: '280', tipoAnimal: 'Vaca', pelaje: 'Osco', sexo: 'Hembra', dueno: 'Ramon Diaz', descripcion: 'Pelaje Osco', raza: 'Brangus', fechaNacimiento: '2019-12-22', idMadre: null},
  ];

  getAnimales(): Observable<Animal[]> {
    return of(this.animalesDeEjemplo).pipe(delay(500));
  }

  getPelajes(): Observable<string[]> {
    return of(this.animalesDeEjemplo).pipe(
      map(animales => [...new Set(animales.map(a => a.pelaje))].sort())
    );
  }

  getDuenos(): Observable<string[]> {
    return of(this.animalesDeEjemplo).pipe(
      map(animales => [...new Set(animales.map(a => a.dueno))].sort())
    );
  }

  // --- NUEVO MÉTODO ---
  updateAnimalMother(animalId: string, newMotherId: string | null): Observable<Animal> {
    const animal = this.animalesDeEjemplo.find(a => a.id === animalId);
    if (!animal) {
      return throwError(() => new Error('Animal no encontrado para actualizar.'));
    }
    animal.idMadre = newMotherId;
    return of(animal).pipe(delay(500));
  }
}