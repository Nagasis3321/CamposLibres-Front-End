import { Injectable, inject } from '@angular/core';
import { Animal } from '../models/animal.model';
import { Campana } from '../models/campana.model';
import { DatosPorTipo, TipoAnimal } from '../models/report.model';
import { AnimalService } from './animal.service';
import { CampanaService } from './campana.service';
import { forkJoin, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private animalService = inject(AnimalService);
  private campanaService = inject(CampanaService);

  /**
   * Calcula los datos por tipo de animal
   */
  calcularDatosPorTipo(animales: Animal[]): DatosPorTipo[] {
    const tipos: TipoAnimal[] = ['Vaca', 'Vaquilla', 'Ternero', 'Ternera', 'Novillo', 'Toro'];
    
    const datos = tipos.map(tipo => {
      const cantidad = animales.filter(a => a.tipoAnimal === tipo).length;
      return { tipo, cantidad };
    });

    // Agregar Terneros (suma de Ternero + Ternera)
    const ternerosCount = animales.filter(a => 
      a.tipoAnimal === 'Ternero' || a.tipoAnimal === 'Ternera'
    ).length;
    datos.push({ tipo: 'Terneros' as any, cantidad: ternerosCount });

    return datos.filter(d => d.cantidad > 0); // Solo devolver tipos con cantidad > 0
  }

  /**
   * Obtiene reporte de vacunación por usuario
   */
  getReporteVacunacionUsuario(campanaId: string, usuarioId: string): Observable<{
    campana: Campana;
    usuario: any;
    datosPorTipo: DatosPorTipo[];
    listados: Animal[];
  }> {
    return this.campanaService.getCampaignById(campanaId).pipe(
      map(campana => {
        // Filtrar animales del usuario
        const animalesUsuario = (campana.animales || []).filter(a => a.duenoId === usuarioId);
        const datosPorTipo = this.calcularDatosPorTipo(animalesUsuario);
        
        // Obtener información del usuario del primer animal o usar valores por defecto
        const usuario = animalesUsuario.length > 0 && animalesUsuario[0].dueno 
          ? animalesUsuario[0].dueno 
          : { id: usuarioId, nombre: 'Usuario no encontrado', email: '' };

        return {
          campana,
          usuario,
          datosPorTipo,
          listados: animalesUsuario
        };
      })
    );
  }

  /**
   * Obtiene reporte general de vacunación
   */
  getReporteVacunacionGeneral(campanaId: string): Observable<{
    campana: Campana;
    datosPorDueno: Array<{
      dueno: any;
      datosPorTipo: DatosPorTipo[];
      listados: Animal[];
    }>;
  }> {
    return this.campanaService.getCampaignById(campanaId).pipe(
      map(campana => {
        // Agrupar animales por dueño
        const animalesPorDueno = new Map<string, Animal[]>();
        
        campana.animales.forEach(animal => {
          const duenoId = animal.duenoId;
          if (!animalesPorDueno.has(duenoId)) {
            animalesPorDueno.set(duenoId, []);
          }
          animalesPorDueno.get(duenoId)!.push(animal);
        });

        const datosPorDueno = Array.from(animalesPorDueno.entries()).map(([duenoId, animales]) => {
          const dueno = animales.length > 0 && animales[0].dueno 
            ? animales[0].dueno 
            : { id: duenoId, nombre: 'Usuario no encontrado' };
          
          return {
            dueno,
            datosPorTipo: this.calcularDatosPorTipo(animales),
            listados: animales
          };
        });

        return {
          campana,
          datosPorDueno
        };
      })
    );
  }

  /**
   * Obtiene reporte de animales de un usuario
   */
  getReporteAnimalesUsuario(usuarioId: string): Observable<{
    usuario: any;
    datosPorTipo: DatosPorTipo[];
    listados: Animal[];
  }> {
    return this.animalService.getAnimales(1, 10000).pipe(
      map(response => {
        const animalesUsuario = response.data.filter(a => a.duenoId === usuarioId);
        const datosPorTipo = this.calcularDatosPorTipo(animalesUsuario);
        const usuario = animalesUsuario.length > 0 && animalesUsuario[0].dueno
          ? animalesUsuario[0].dueno
          : { id: usuarioId, nombre: 'Usuario no encontrado' };

        return {
          usuario,
          datosPorTipo,
          listados: animalesUsuario
        };
      })
    );
  }

  /**
   * Obtiene reporte de animales de un grupo
   */
  getReporteAnimalesGrupo(grupoId: string): Observable<{
    grupoId: string;
    grupoNombre: string;
    usuarios: Array<{
      usuario: any;
      datosPorTipo: DatosPorTipo[];
      listados: Animal[];
    }>;
  }> {
    return this.animalService.getAnimales(1, 10000, grupoId).pipe(
      map(response => {
        const animales = response.data;
        
        // Agrupar por usuario
        const animalesPorUsuario = new Map<string, Animal[]>();
        animales.forEach(animal => {
          const usuarioId = animal.duenoId;
          if (!animalesPorUsuario.has(usuarioId)) {
            animalesPorUsuario.set(usuarioId, []);
          }
          animalesPorUsuario.get(usuarioId)!.push(animal);
        });

        const usuarios = Array.from(animalesPorUsuario.entries()).map(([usuarioId, animalesUsuario]) => {
          const usuario = animalesUsuario.length > 0 && animalesUsuario[0].dueno
            ? animalesUsuario[0].dueno
            : { id: usuarioId, nombre: 'Usuario no encontrado' };

          return {
            usuario,
            datosPorTipo: this.calcularDatosPorTipo(animalesUsuario),
            listados: animalesUsuario
          };
        });

        return {
          grupoId,
          grupoNombre: '', // Se debe pasar desde el componente
          usuarios
        };
      })
    );
  }
}

