import { Animal } from './animal.model';
import { Campana } from './campana.model';
import { User } from './user.model';

export type TipoAnimal = 'Vaca' | 'Vaquilla' | 'Ternero' | 'Ternera' | 'Novillo' | 'Toro';

export interface DatosPorTipo {
  tipo: TipoAnimal | 'Terneros'; // Terneros es la suma de Ternero + Ternera
  cantidad: number;
}

export interface ReporteAnimalesUsuario {
  usuario: User;
  datosPorTipo: DatosPorTipo[];
  listados: Animal[];
}

export interface ReporteAnimalesGrupo {
  grupoId: string;
  grupoNombre: string;
  usuarios: Array<{
    usuario: User;
    datosPorTipo: DatosPorTipo[];
    listados: Animal[];
  }>;
}

export interface ReporteVacunacionUsuario {
  campana: Campana;
  usuario: User;
  datosPorTipo: DatosPorTipo[];
  listados: Animal[];
}

export interface ReporteVacunacionGeneral {
  campana: Campana;
  datosPorDueno: Array<{
    dueno: User;
    datosPorTipo: DatosPorTipo[];
    listados: Animal[];
  }>;
}

export type TipoReporte = 
  | 'vacunacion-usuario'
  | 'vacunacion-general'
  | 'animales-usuario'
  | 'animales-grupo';

